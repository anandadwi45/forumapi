// istanbul ignore file
const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReplies({
    id = 'reply-123', commentId = 'comment-123', owner = 'user-123', content = 'replies-content', date = new Date('2023-10-29T10:10:10.749Z'),
  }) {
    const query = {
      text: 'INSERT INTO replies(id, comment_id, owner, content, date) VALUES($1,$2,$3,$4,$5)',
      values: [id, commentId, owner, content, date],
    };

    await pool.query(query);
  },

  async findRepliesById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id=$1',
      values: [id],
    };
    const result = await pool.query(query);

    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1 = 1');
  },
};

module.exports = RepliesTableTestHelper;
