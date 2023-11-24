const AddReplies = require('../AddReplies');

describe('a AddReplies entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'abc',
    };

    // Action and Dessert
    expect(() => new AddReplies(payload)).toThrowError('ADD_REPLIES.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      commentId: 123,
      content: 123,
      owner: {},
    };

    // Action and Assert
    expect(() => new AddReplies(payload)).toThrowError('ADD_REPLIES.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create addComment object correctly', () => {
    // Arrange
    const payload = {
      commentId: 'comment-id',
      content: 'content',
      owner: 'owner',
    };

    // Actin
    const { commentId, content, owner } = new AddReplies(payload);

    // Assert
    expect(commentId).toEqual(payload.commentId);
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
  });
});
