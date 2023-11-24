const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const CommentTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const pool = require('../../database/postgres/pool');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
  });

  afterEach(async () => {
    await CommentTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('add comment to database', () => {
    it('should persist add comment correctly', async () => {
      // Arrange
      const addComment = new AddComment({
        threadId: 'thread-123',
        content: 'comment_content',
        owner: 'user-123',
      });

      const IdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, IdGenerator);

      // Action
      const comment = await commentRepositoryPostgres.newComment(addComment);

      // Assert
      const commentInDatabase = await CommentTableTestHelper.findCommentById(comment.id);
      expect(commentInDatabase).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      const addComment = new AddComment({
        threadId: 'thread-123',
        content: 'comment-content',
        owner: 'user-123',
      });

      const IdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, IdGenerator);

      // Action
      const comment = await commentRepositoryPostgres.newComment(addComment);

      // Assert
      expect(comment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: addComment.content,
        owner: addComment.owner,
      }));
    });
  });

  describe('deleteCommentById function', () => {
    it('should persist delete comment correctly', async () => {
      // Arrange
      await CommentTableTestHelper.addComment({});
      const commentId = 'comment-123';

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.deleteCommentById(commentId);

      // Assert
      const comment = await CommentTableTestHelper.findCommentById(commentId);
      expect(comment[0].is_delete).toBe(true);
    });

    it('should throw NotFoundError when comment not exist', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      // Assert
      await expect(commentRepositoryPostgres.deleteCommentById('comment-123')).rejects.toThrow(NotFoundError);
    });
  });

  describe('getCommentByThreadId function', () => {
    it('should return comment by thread id correctly', async () => {
      // Arrange
      await CommentTableTestHelper.addComment({});

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const result = await commentRepositoryPostgres.getCommentByThreadId('thread-123');

      // Assert
      expect(result).toStrictEqual([
        {
          id: 'comment-123',
          thread_id: 'thread-123',
          owner: 'user-123',
          content: 'comment-content',
          date: new Date('2023-10-29T10:10:10.749Z'),
          is_delete: false,
          username: 'dicoding',
        },
      ]);
    });

    it('should return NotFoundError when comment in thread is not exist', async () => {
      await ThreadsTableTestHelper.addThread({ id: 'thread-300' });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.getCommentByThreadId('thread-300')).rejects.toThrow(NotFoundError);
    });
  });

  describe('verifyCommentOwner', () => {
    it('should return AuthorizationError when comment owner is not the real owner', async () => {
      await CommentTableTestHelper.addComment({ id: 'comment-123' });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-321')).rejects.toThrow(AuthorizationError);
    });

    it('should not return AuthorizationError when comment owner is the real owner', async () => {
      await CommentTableTestHelper.addComment({ id: 'comment-123' });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123')).resolves.not.toThrow(AuthorizationError);
    });
  });

  describe('verifyCommentExistence', () => {
    it('should return NotFoundError when comment in thread is not exist', async () => {
      await ThreadsTableTestHelper.addThread({ id: 'thread-321' });
      await CommentTableTestHelper.addComment({ id: 'comment-123' });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyCommentExistence('comment-123', 'thread-321')).rejects.toThrow(NotFoundError);
    });

    it('should not return NotFoundError when comment in thread is exist', async () => {
      await CommentTableTestHelper.addComment({ id: 'comment-123' });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyCommentExistence('comment-123', 'thread-123')).resolves.not.toThrow(NotFoundError);
    });
  });
});
