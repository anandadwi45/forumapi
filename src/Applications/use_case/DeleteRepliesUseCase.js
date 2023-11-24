class DeleteRepliesUseCase {
  constructor({ repliesRepository }) {
    this._repliesRepository = repliesRepository;
  }

  async execute(useCasePayload) {
    const {
      replyId, commentId, threadId, owner,
    } = useCasePayload;
    await this._repliesRepository.verifyRepliesExistence(replyId, commentId, threadId);
    await this._repliesRepository.verifyRepliesOwner(replyId, owner);
    await this._repliesRepository.deleteRepliesById(replyId);
  }
}

module.exports = DeleteRepliesUseCase;
