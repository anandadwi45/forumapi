class DetailComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      content, id, date, username,
    } = payload;
    this.id = id;
    this.username = username;
    this.date = date;
    this.content = content;
  }

  _verifyPayload({
    id, date, username, content,
  }) {
    if (!id || !date || !username || !content) {
      throw new Error('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof date !== 'string' || typeof username !== 'string' || typeof content !== 'string') {
      throw new Error('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DetailComment;
