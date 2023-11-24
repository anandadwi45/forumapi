const RepliesRepositoryPostgres = require('../RepliesRepositoryPostgres');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const pool = require('../../database/postgres/pool');
const AddReplies = require('../../../Domains/replies/entities/AddReplies');
const AddedReplies = require('../../../Domains/replies/entities/AddedReplies');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('RepliesRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('add replies to database', () => {
    it('should persist add replies correctly', async () => {
      // Arrange
      const addReplies = new AddReplies({
        commentId: 'comment-123',
        content: 'replies_content',
        owner: 'user-123',
      });

      const IdGenerator = () => '123'; // stub!
      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool, IdGenerator);

      // Action
      const replies = await repliesRepositoryPostgres.addReplies(addReplies);

      // Assert
      const repliesInDatabase = await RepliesTableTestHelper.findRepliesById(replies.id);
      expect(repliesInDatabase).toHaveLength(1);
    });

    it('should return added replies correctly', async () => {
      // Arrange
      const addReplies = new AddReplies({
        commentId: 'comment-123',
        content: 'replies-content',
        owner: 'user-123',
      });

      const IdGenerator = () => '123'; // stub!
      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool, IdGenerator);

      // Action
      const replies = await repliesRepositoryPostgres.addReplies(addReplies);

      // Assert
      expect(replies).toStrictEqual(new AddedReplies({
        id: 'reply-123',
        content: addReplies.content,
        owner: addReplies.owner,
      }));
    });
  });

  describe('getRepliesByThreadId function', () => {
    it('should return reply by thread id correctly', async () => {
      // Arrange
      await RepliesTableTestHelper.addReplies({});

      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool, {});

      // Action
      const result = await repliesRepositoryPostgres.getRepliesByThreadId('thread-123');

      // Assert
      expect(result).toStrictEqual([
        {
          comment_id: 'comment-123',
          content: 'replies-content',
          date: new Date('2023-10-29T10:10:10.749Z'),
          id: 'reply-123',
          is_delete: false,
          owner: 'user-123',
          username: 'dicoding',
        },
      ]);
    });
  });

  describe('deleteRepliesById function', () => {
    it('should persist delete reply correctly', async () => {
      // Arrange
      await RepliesTableTestHelper.addReplies({});
      const replyId = 'reply-123';

      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool, {});

      // Action
      await repliesRepositoryPostgres.deleteRepliesById(replyId);

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById(replyId);
      expect(replies[0].is_delete).toBe(true);
    });

    it('should throw NotFoundError when reply not exist', async () => {
      // Arrange
      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool, {});

      // Action
      // Assert
      await expect(repliesRepositoryPostgres.deleteRepliesById('reply-123')).rejects.toThrow(NotFoundError);
    });
  });

  describe('verifyRepliesOwner', () => {
    it('should return AuthorizationError when reply owner is not the real owner', async () => {
      await RepliesTableTestHelper.addReplies({ id: 'reply-123' });

      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool, {});

      await expect(repliesRepositoryPostgres.verifyRepliesOwner('reply-123', 'user-321')).rejects.toThrow(AuthorizationError);
    });

    it('should not return AuthorizationError when reply owner is the real owner', async () => {
      await RepliesTableTestHelper.addReplies({ id: 'reply-123' });

      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool, {});

      await expect(repliesRepositoryPostgres.verifyRepliesOwner('reply-123', 'user-123')).resolves.not.toThrow(AuthorizationError);
    });
  });

  describe('verifyRepliesExistence', () => {
    it('should return NotFoundError when reply in comment is not exist', async () => {
      await CommentsTableTestHelper.addComment({ id: 'comment-321' });
      await RepliesTableTestHelper.addReplies({ id: 'reply-123' });

      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool, {});

      await expect(repliesRepositoryPostgres.verifyRepliesExistence('reply-123', 'comment-321', 'thread-123')).rejects.toThrow(NotFoundError);
    });

    it('should not return NotFoundError when reply in comment is exist', async () => {
      await RepliesTableTestHelper.addReplies({ id: 'reply-123' });

      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool, {});

      await expect(repliesRepositoryPostgres.verifyRepliesExistence('reply-123', 'comment-123', 'thread-123')).resolves.not.toThrow(NotFoundError);
    });
  });
});
