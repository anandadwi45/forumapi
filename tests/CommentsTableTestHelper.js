// istanbul ignore file
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123', threadId = 'thread-123', owner = 'user-123', content = 'comment-content', date = new Date('2023-10-29T10:10:10.749Z'),
  }) {
    const query = {
      text: 'INSERT INTO comments(id, thread_id, owner, content, date) VALUES($1,$2,$3,$4,$5)',
      values: [id, threadId, owner, content, date],
    };

    await pool.query(query);
  },

  async findCommentById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id=$1',
      values: [id],
    };
    const result = await pool.query(query);

    return result.rows;
  },

  async deleteCommentById(id) {
    const query = {
      text: 'DELETE FROM comments WHERE id = $1',
      values: [id],
    };

    await pool.query(query);
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1 = 1');
  },
};

module.exports = CommentsTableTestHelper;
