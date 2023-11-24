const AddedReplies = require('../AddedReplies');

describe('a AddedReplies entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'reply_content',
    };

    // Action and Assert
    expect(() => new AddedReplies(payload)).toThrowError('ADDED_REPLIES.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      content: true,
      owner: {},
    };

    // Action and Assert
    expect(() => new AddedReplies(payload)).toThrowError('ADDED_REPLIES.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create addedReplies object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'reply_content',
      owner: 'owner',
    };

    // Action
    const addedReplies = new AddedReplies(payload);

    // Assert
    expect(addedReplies.id).toEqual(payload.id);
    expect(addedReplies.content).toEqual(payload.content);
    expect(addedReplies.owner).toEqual(payload.owner);
  });
});
