const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.verifyThreadExistence(useCasePayload.threadId);
    const { content, threadId, owner } = useCasePayload;
    const addComment = new AddComment({ content, threadId, owner });
    return this._commentRepository.newComment(addComment);
  }
}

module.exports = AddCommentUseCase;
