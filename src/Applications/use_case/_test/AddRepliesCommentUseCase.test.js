const AddReplies = require('../../../Domains/replies/entities/AddReplies');
const AddedReplies = require('../../../Domains/replies/entities/AddedReplies');
const RepliesRepository = require('../../../Domains/replies/RepliesRepository');
const AddRepliesCommentUseCase = require('../AddRepliesCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('AddRepliesCommentUseCase', () => {
  it('should orchestrating the add replies action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      content: 'replies_content',
      owner: 'user-123',
    };

    const expectedAddedReplies = new AddedReplies({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    const mockRepliesRepository = new RepliesRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadExistence = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentExistence = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockRepliesRepository.addReplies = jest.fn()
      .mockImplementation(() => Promise.resolve(new AddedReplies({
        id: 'reply-123',
        content: useCasePayload.content,
        owner: useCasePayload.owner,
      })));

    const addRepliesCommentUseCase = new AddRepliesCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      repliesRepository: mockRepliesRepository,
    });

    // Action
    const addedReplies = await addRepliesCommentUseCase.execute(useCasePayload);

    // Assert
    expect(addedReplies).toStrictEqual(expectedAddedReplies);
    expect(mockRepliesRepository.addReplies).toBeCalledWith(new AddReplies(useCasePayload));
    expect(mockThreadRepository.verifyThreadExistence).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentExistence).toBeCalledWith(useCasePayload.commentId, useCasePayload.threadId);
  });
});
