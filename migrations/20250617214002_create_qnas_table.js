/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('qnas', function(table) {
        table.increments('qna_id').primary();
        table.string('tag').notNullable();
        table.string('question').notNullable();
        table.text('answer').notNullable();
        table.boolean('is_bookmarked').defaultTo(false);
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('qnas');
};
