/* eslint-disable camelcase */
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const RepliesRepository = require('../../../Domains/replies/RepliesRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DetailThreadUseCase = require('../DetailThreadUseCase');

describe('DetailThreadUseCase', () => {
  it('should orchestrating get detail thread action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';

    const detailThread = {
      title: 'thread-title',
      id: 'thread-123',
      date: '2023',
      body: 'thread_body',
      username: 'user',
    };

    const detailComment = [
      {
        id: 'comment-123',
        username: 'user',
        date: '2023',
        content: 'comment_content',
        is_delete: false,
      },
    ];

    const detailReplies = [
      {
        id: 'comment-123',
        username: 'user',
        date: '2023',
        content: 'comment',
        comment_id: 'comment-123',
        is_delete: false,
      },
    ];

    const mapComment = detailComment.map(({ is_delete: boolean, ...otherProperties }) => otherProperties);
    const mapReplies = detailReplies.map(({ comment_id, is_delete: boolean, ...otherProperties }) => otherProperties);

    const detailCommentAndReplies = [
      {
        ...mapComment[0],
        replies: mapReplies,
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockRepliesRepository = new RepliesRepository();

    mockCommentRepository.getCommentByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          id: 'comment-123',
          username: 'user',
          date: '2023',
          content: 'comment_content',
          is_delete: false,
          thread_id: 'thread-123',
        },
      ]));

    mockThreadRepository.getDetailThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(
        {
          title: 'thread-title',
          id: 'thread-123',
          date: '2023',
          body: 'thread_body',
          username: 'user',
        },
      ));

    mockRepliesRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(detailReplies));

    const detailThreadUseCase = new DetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      repliesRepository: mockRepliesRepository,
    });

    // Action
    const threadAndComments = await detailThreadUseCase.execute({ threadId });

    // Assert
    expect(threadAndComments).toEqual({ ...detailThread, comments: detailCommentAndReplies });
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(threadId);
    expect(mockThreadRepository.getDetailThreadById).toBeCalledWith(threadId);
    expect(mockRepliesRepository.getRepliesByThreadId).toBeCalledWith(threadId);
  });

  it('should not display comments when deleted', async () => {
    // Arrange
    const threadId = 'thread-123';

    const detailThread = {
      title: 'thread-title',
      id: 'thread-123',
      date: '2023',
      body: 'thread_body',
      username: 'user',
    };

    const detailComment = [
      {
        id: 'comment-123',
        username: 'user',
        date: '2023',
        content: '**komentar telah dihapus**',
        is_delete: true,
      },
    ];

    const detailReplies = [
      {
        id: 'reply-123',
        username: 'user',
        date: '2023',
        content: '**balasan telah dihapus**',
        comment_id: 'comment-123',
        is_delete: true,
      },
    ];

    const mapComment = detailComment.map(({ is_delete: boolean, ...otherProperties }) => otherProperties);
    const mapReplies = detailReplies.map(({ comment_id, is_delete, ...otherProperties }) => otherProperties);

    const detailCommentAndReplies = [
      {
        ...mapComment[0],
        replies: mapReplies,
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockRepliesRepository = new RepliesRepository();

    mockThreadRepository.getDetailThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(detailThread));

    mockCommentRepository.getCommentByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          id: 'comment-123',
          username: 'user',
          date: '2023',
          content: '**komentar telah dihapus**',
          is_delete: true,
        },
      ]));

    mockRepliesRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          id: 'reply-123',
          username: 'user',
          date: '2023',
          content: '**balasan telah dihapus**',
          comment_id: 'comment-123',
          is_delete: true,
        },
      ]));

    const detailThreadUseCase = new DetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      repliesRepository: mockRepliesRepository,
    });

    // Action
    const threadAndComments = await detailThreadUseCase.execute({ threadId });

    // Assert
    expect(threadAndComments).toEqual({ ...detailThread, comments: detailCommentAndReplies });
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(threadId);
    expect(mockThreadRepository.getDetailThreadById).toBeCalledWith(threadId);
    expect(mockRepliesRepository.getRepliesByThreadId).toBeCalledWith(threadId);
  });
});
