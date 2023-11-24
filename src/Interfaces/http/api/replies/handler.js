const AddRepliesCommentUseCase = require('../../../../Applications/use_case/AddRepliesCommentUseCase');
const DeleteRepliesUseCase = require('../../../../Applications/use_case/DeleteRepliesUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.addRepliesHandler = this.addRepliesHandler.bind(this);
    this.deleteRepliesHandler = this.deleteRepliesHandler.bind(this);
  }

  async addRepliesHandler(request, h) {
    const { id: owner } = request.auth.credentials.user;
    const { commentId } = request.params;
    const { threadId } = request.params;
    const { content } = request.payload;
    const addRepliesCommentUseCase = this._container.getInstance(AddRepliesCommentUseCase.name);
    const addedReply = await addRepliesCommentUseCase.execute({
      content, commentId, threadId, owner,
    });

    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteRepliesHandler(request, h) {
    const { id: owner } = request.auth.credentials.user;
    const { threadId } = request.params;
    const { commentId } = request.params;
    const { replyId } = request.params;

    const payload = {
      replyId, commentId, threadId, owner,
    };

    const deleteRepliesUseCase = this._container.getInstance(DeleteRepliesUseCase.name);

    await deleteRepliesUseCase.execute(payload);

    const response = {
      status: 'success',
    };

    return response;
  }
}

module.exports = RepliesHandler;
