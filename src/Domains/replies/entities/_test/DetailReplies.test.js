const DetailReplies = require('../DetailReplies');

describe('DetailReplies entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      username: 'dicod',
      content: 'reply_content',
    };

    // Action and Assert
    expect(() => new DetailReplies(payload)).toThrowError('DETAIL_REPLIES.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload has forbidden data type', () => {
    // Arrange
    const payload = {
      id: 123,
      username: [],
      date: '2023',
      content: {},
    };

    // Action and Assert
    expect(() => new DetailReplies(payload)).toThrowError('DETAIL_REPLIES.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DetailReplies object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      username: 'dicod',
      date: '2023',
      content: 'reply_content',
    };

    // Action
    const detailReplies = new DetailReplies(payload);

    // Assert
    expect(detailReplies.id).toEqual(payload.id);
    expect(detailReplies.username).toEqual(payload.username);
    expect(detailReplies.date).toEqual(payload.date);
    expect(detailReplies.content).toEqual(payload.content);
  });
});
