const AddReplies = require('../../Domains/replies/entities/AddReplies');

class AddRepliesCommentUseCase {
  constructor({ threadRepository, commentRepository, repliesRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._repliesRepository = repliesRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.verifyThreadExistence(useCasePayload.threadId);
    await this._commentRepository.verifyCommentExistence(useCasePayload.commentId, useCasePayload.threadId);
    const {
      content, commentId, threadId, owner,
    } = useCasePayload;
    const addReplies = new AddReplies({
      content, commentId, threadId, owner,
    });
    return this._repliesRepository.addReplies(addReplies);
  }
}

module.exports = AddRepliesCommentUseCase;
