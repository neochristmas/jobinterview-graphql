// index.js
const { ApolloServer, gql } = require('apollo-server');
const knex = require('knex')(require('./knexfile').development);

// 1. 스키마 정의: 서버가 다룰 데이터 타입과 쿼리/뮤테이션들의 입출력 형태 선언, 설계도
const typeDefs = gql`
  type QnA {
    qna_id: ID!
    tag: String!
    question: String!
    answer: String!
    is_bookmarked: Boolean!
  }

  type Query {
    qnas: [QnA]
  }

  type Mutation {
    addQna(
      tag: String!
      question: String!
      answer: String! 
      is_bookmarked: Boolean!
    ): QnA,
    
    deleteQna(qna_id: ID!): Boolean,

    updateQna(
      qna_id: ID!
      question: String
      answer: String
      is_bookmarked: Boolean
    ): Boolean
  }
`;

// 2. Resolver 정의: typeDef에 선언된 쿼리/뮤테이션의 실제 동작을 구현하는 함수
const resolvers = {
  Query: {
    qnas: () => knex('qnas').select('*'),
    },
    Mutation: {
        addQna: async (_, { tag, question, answer, is_bookmarked }) => {
          const [id] = await knex('qnas').insert({
            tag,
            question,
            answer,
            is_bookmarked,
          });
    
          // insert하면 id만 반환되므로 다시 select로 해당 row 불러오기
          return await knex('qnas').where('qna_id', id).first();
        },
        deleteQna: async (_, { qna_id }) => {
          const deletedCount = await knex('qnas').where('qna_id', qna_id).del();
          return deletedCount > 0;
        },
        updateQna: async (_, args) => {
          const { qna_id, ...updates } = args;

          const filteredUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, value]) => value !== undefined)
          );

          const updated = await knex('qnas').where('qna_id', qna_id).update(filteredUpdates);

          return updated > 0;
        },
    },
};

const loggingPlugin = {
  requestDidStart(requestContext) {
    console.log('🚀 GraphQL Request started!');
    console.log('Query:\n', requestContext.request.query);
    return {
      willSendResponse(requestContext) {
        console.log('Response:\n', requestContext.response.data);
      }
    };
  }
};

// 3. 서버 생성
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [loggingPlugin],
});

// 4. 서버 시작
server.listen().then(({ url }) => {
  console.log(`🚀 서버 실행 중: ${url}`);
});
