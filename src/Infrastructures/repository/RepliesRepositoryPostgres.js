const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const RepliesRepository = require('../../Domains/replies/RepliesRepository');
const AddedReplies = require('../../Domains/replies/entities/AddedReplies');

class RepliesRepositoryPostgres extends RepliesRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReplies(repliesPayload) {
    const { content, commentId, owner } = repliesPayload;
    const replyId = `reply-${this._idGenerator()}`;
    const date = new Date();

    const query = {
      text: 'INSERT INTO replies(id, content, comment_id, owner, date) VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [replyId, content, commentId, owner, date],
    };

    const result = await this._pool.query(query);

    return new AddedReplies({ ...result.rows[0] });
  }

  async deleteRepliesById(repliesId) {
    const query = {
      text: 'UPDATE replies SET is_delete=TRUE WHERE id = $1',
      values: [repliesId],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Reply tidak ditemukan');
    }
  }

  async getRepliesByThreadId(threadId) {
    const query = {
      text: 'SELECT replies.*, users.username FROM replies LEFT JOIN comments ON replies.comment_id = comments.id LEFT JOIN users ON replies.owner = users.id WHERE comments.thread_id = $1 ORDER BY replies.date ASC',
      values: [threadId],
    };

    const { rows } = await this._pool.query(query);

    return rows;
  }

  async verifyRepliesOwner(replyId, owner) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1 AND owner = $2',
      values: [replyId, owner],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new AuthorizationError('AuthorizationError');
    }
  }

  async verifyRepliesExistence(replyId, commentId, threadId) {
    const query = {
      text: 'SELECT * FROM replies INNER JOIN comments ON replies.comment_id = comments.id WHERE replies.id = $1 AND replies.comment_id = $2 AND comments.thread_id = $3 AND replies.is_delete = FALSE',
      values: [replyId, commentId, threadId],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Reply tidak ditemukan');
    }
  }
}

module.exports = RepliesRepositoryPostgres;
