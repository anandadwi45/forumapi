const RepliesRepository = require('../RepliesRepository');

describe('RepliesRepository interface', () => {
  it('should threw error when invoke abstract behavior', async () => {
    const repliesRepository = new RepliesRepository();

    await expect(repliesRepository.addReplies).rejects.toThrowError('REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repliesRepository.deleteRepliesById).rejects.toThrowError('REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repliesRepository.getRepliesByThreadId).rejects.toThrowError('REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repliesRepository.verifyRepliesOwner).rejects.toThrowError('REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repliesRepository.verifyRepliesExistence).rejects.toThrowError('REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
