const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const UsersLoginTestHelper = require('../../../../tests/UsersLoginTestHelper');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should respond 201 and persisted comment', async () => {
      const server = await createServer(container);

      const { userId, accessToken } = await UsersLoginTestHelper.getUserIdAndAccessTokenObject({ server });
      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      const commentPayload = {
        content: 'comment-content',
      };

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: commentPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should respond 400 when bad payload', async () => {
      const server = await createServer(container);

      const { userId, accessToken } = await UsersLoginTestHelper.getUserIdAndAccessTokenObject({ server });
      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      const commentPayload = {};

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: commentPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBe('gagal menambahkan comment karena properti yang dibutuhkan tidak ada');
    });

    it('should respond 404 when thread not found', async () => {
      const server = await createServer(container);

      const { userId, accessToken } = await UsersLoginTestHelper.getUserIdAndAccessTokenObject({ server });
      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      const commentPayload = {};

      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-100/comments',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: commentPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBe('thread tidak ditemukan');
    });

    it('should respond 401 when adding comment without authentication', async () => {
      const server = await createServer(container);

      const { userId } = await UsersLoginTestHelper.getUserIdAndAccessTokenObject({ server });
      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      const commentPayload = {
        content: 'comment_content',
      };

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: commentPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 401 when request not contain access token', async () => {
      // Arrange
      const server = await createServer(container);

      const { userId } = await UsersLoginTestHelper.getUserIdAndAccessTokenObject({ server });
      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      const commentId = 'comment-123';
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, threadId });

      // action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const server = await createServer(container);

      const { userId, accessToken } = await UsersLoginTestHelper.getUserIdAndAccessTokenObject({ server });
      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      const commentId = 'comment-123';
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, threadId });

      // action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/thread-321/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Komentar tidak ditemukan');
    });

    it('should response 403 when user is not owner', async () => {
      // Arrange
      const server = await createServer(container);

      const { userId, accessToken } = await UsersLoginTestHelper.getUserIdAndAccessTokenObject({ server });
      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'Another User' });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: 'user-123', threadId });

      // action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('AuthorizationError');
    });

    it('should respond 200 and delete comment', async () => {
      // Arrange
      const server = await createServer(container);

      const { userId, accessToken } = await UsersLoginTestHelper.getUserIdAndAccessTokenObject({ server });
      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      const commentId = 'comment-123';
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, threadId });

      // action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
