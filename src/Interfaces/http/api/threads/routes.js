const routes = (handler) => ([
  {
    method: 'POST',
    path: '/threads',
    handler: handler.addThreadHandler,
    options: {
      auth: 'forum_jwt',
    },
  },
  {
    method: 'GET',
    path: '/threads/{threadId}',
    handler: handler.detailThreadByIdHandler,
  },
]);

module.exports = routes;
