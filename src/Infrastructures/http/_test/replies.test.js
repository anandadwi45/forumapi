const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const UsersLoginTestHelper = require('../../../../tests/UsersLoginTestHelper');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should respond 201 and persisted reply', async () => {
      const server = await createServer(container);

      const { userId, accessToken } = await UsersLoginTestHelper.getUserIdAndAccessTokenObject({ server });
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });

      const repliesPayload = {
        content: 'replies-content',
      };

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: repliesPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });

    it('should respond 400 when bad payload', async () => {
      const server = await createServer(container);

      const { userId, accessToken } = await UsersLoginTestHelper.getUserIdAndAccessTokenObject({ server });
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });

      const repliesPayload = {};

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: repliesPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBe('gagal menambahkan reply karena properti yang dibutuhkan tidak ada');
    });

    it('should respond 404 when thread not found', async () => {
      const server = await createServer(container);

      const { userId, accessToken } = await UsersLoginTestHelper.getUserIdAndAccessTokenObject({ server });
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });

      const repliesPayload = {};

      const response = await server.inject({
        method: 'POST',
        url: `/threads/thread-100/comments/${commentId}/replies`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: repliesPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBe('thread tidak ditemukan');
    });

    it('should respond 404 when comment not found', async () => {
      const server = await createServer(container);

      const { userId, accessToken } = await UsersLoginTestHelper.getUserIdAndAccessTokenObject({ server });
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });

      const repliesPayload = {};

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/comment-100/replies`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: repliesPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBe('Komentar tidak ditemukan');
    });

    it('should respond 401 when adding comment without authentication', async () => {
      const server = await createServer(container);

      const { userId } = await UsersLoginTestHelper.getUserIdAndAccessTokenObject({ server });
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });

      const repliesPayload = {
        content: 'replies_content',
      };

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: repliesPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
    });
  });

  describe('DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 when delete reply', async () => {
      const server = await createServer(container);

      const { accessToken, userId } = await UsersLoginTestHelper.getUserIdAndAccessTokenObject({ server });
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });
      await RepliesTableTestHelper.addReplies({ id: replyId, owner: userId, commentId });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 401 when request without authorization', async () => {
      const server = await createServer(container);

      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread not found', async () => {
      const server = await createServer(container);

      const { accessToken, userId } = await UsersLoginTestHelper.getUserIdAndAccessTokenObject({ server });
      const threadId = 'thread-in';
      const commentId = 'comment-123';
      const replyId = 'reply-123';

      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId: 'thread-123', owner: userId });
      await RepliesTableTestHelper.addReplies({ id: replyId, owner: userId, commentId });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Reply tidak ditemukan');
    });

    it('should response 404 when comment not found', async () => {
      const server = await createServer(container);

      const { accessToken, userId } = await UsersLoginTestHelper.getUserIdAndAccessTokenObject({ server });
      const threadId = 'thread-123';
      const commentId = 'comment-n';
      const replyId = 'reply-123';

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId, owner: userId });
      await RepliesTableTestHelper.addReplies({ id: replyId, owner: userId, commentId: 'comment-123' });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Reply tidak ditemukan');
    });

    it('should response 404 when reply not found', async () => {
      const server = await createServer(container);

      const { accessToken, userId } = await UsersLoginTestHelper.getUserIdAndAccessTokenObject({ server });
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-n';

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });
      await RepliesTableTestHelper.addReplies({ id: 'reply-123', owner: userId, commentId });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Reply tidak ditemukan');
    });

    it('should response 403 when user is not owner', async () => {
      const server = await createServer(container);

      const { accessToken, userId } = await UsersLoginTestHelper.getUserIdAndAccessTokenObject({ server });
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      const userIdOther = 'user-111';

      await UsersTableTestHelper.addUser({ id: userIdOther, username: 'OtherUser' });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userIdOther });
      await RepliesTableTestHelper.addReplies({ id: replyId, owner: userIdOther, commentId });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('AuthorizationError');
    });
  });
});
