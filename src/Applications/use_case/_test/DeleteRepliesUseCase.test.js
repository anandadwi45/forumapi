const RepliesRepository = require('../../../Domains/replies/RepliesRepository');
const DeleteRepliesUseCase = require('../DeleteRepliesUseCase');

describe('DeleteRepliesUseCase', () => {
  it('should orchestrating delete reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
      owner: 'user-123',
    };

    const mockRepliesRepository = new RepliesRepository();

    mockRepliesRepository.verifyRepliesExistence = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockRepliesRepository.verifyRepliesOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockRepliesRepository.deleteRepliesById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteRepliesUseCase = new DeleteRepliesUseCase({
      repliesRepository: mockRepliesRepository,
    });

    // Action
    await deleteRepliesUseCase.execute(useCasePayload);
    // Assert
    expect(mockRepliesRepository.verifyRepliesExistence)
      .toBeCalledWith(useCasePayload.replyId, useCasePayload.commentId, useCasePayload.threadId);
    expect(mockRepliesRepository.verifyRepliesOwner)
      .toBeCalledWith(useCasePayload.replyId, useCasePayload.owner);
    expect(mockRepliesRepository.deleteRepliesById)
      .toBeCalledWith(useCasePayload.replyId);
  });
});
