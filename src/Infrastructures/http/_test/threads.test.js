const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const UsersLoginTestHelper = require('../../../../tests/UsersLoginTestHelper');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should respond 201 and persisted thread', async () => {
      // Arrange
      const server = await createServer(container);

      const { accessToken } = await UsersLoginTestHelper.getUserIdAndAccessTokenObject({ server });

      const threadPayload = {
        title: 'thread-title',
        body: 'thread_body',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: threadPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it('should throw error code 400 when bad payload', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken } = await UsersLoginTestHelper.getUserIdAndAccessTokenObject({ server });

      const threadPayload = {
        body: 'thread_body',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: threadPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBe('gagal membuat thread karena properti yang dibutuhkan tidak ada');
    });

    it('should throw error code 401 when adding thread without authentication', async () => {
      // Arrange
      const server = await createServer(container);

      const threadPayload = {
        title: 'thread_title',
        body: 'thread_body',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: threadPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toBe('Missing authentication');
    });
  });

  describe('when GET /threads/threadId/', () => {
    it('should response 200 and get the thread and comments correctly', async () => {
      const userPayload = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'dicoding indonesia',
      };
      const threadPayload = {
        title: 'sebuah title',
        body: 'sebuah body',
      };
      const commentPayload1 = {
        content: 'sebuah comment-1',
      };
      const commentPayload2 = {
        content: 'sebuah comment-2',
      };
      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: userPayload,
      });
      const auth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const responseAuth = JSON.parse(auth.payload);
      const { accessToken } = responseAuth.data;

      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: threadPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const threadJson = JSON.parse(thread.payload);
      const { addedThread } = threadJson.data;
      await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: commentPayload1,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const comment = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: commentPayload2,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const commentJson = JSON.parse(comment.payload);
      const { addedComment } = commentJson.data;
      await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
        payload: {
          content: 'sebuah reply',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${addedThread.id}`,
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments).toBeDefined();
      expect(responseJson.data.thread.comments[1].replies).toBeDefined();
    });
  });
});
