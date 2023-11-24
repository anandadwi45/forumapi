class DetailThreadUseCase {
  constructor({ threadRepository, commentRepository, repliesRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._repliesRepository = repliesRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;
    const thread = await this._threadRepository.getDetailThreadById(threadId);
    let comments = await this._commentRepository.getCommentByThreadId(threadId);
    const replies = await this._repliesRepository.getRepliesByThreadId(threadId);

    comments = comments.map((comment) => ({
      id: comment.id,
      username: comment.username,
      date: comment.date,
      content: comment.is_delete
        ? '**komentar telah dihapus**'
        : comment.content,
      replies: replies.filter((replies) => replies.comment_id === comment.id)
        .map((replies) => ({
          id: replies.id,
          content: replies.is_delete
            ? '**balasan telah dihapus**'
            : replies.content,
          date: replies.date,
          username: replies.username,
        })),
    }));

    return {
      ...thread,
      comments,
    };
  }
}

module.exports = DetailThreadUseCase;
