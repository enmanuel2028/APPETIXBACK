import request from 'supertest';
import app from '../../src/app';

jest.mock('../../src/config/data', () => ({
  AppDataSource: {
    getRepository: jest.fn(() => ({
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    })),
  },
}));

const { AppDataSource } = jest.requireMock('../../src/config/data') as {
  AppDataSource: { getRepository: jest.Mock };
};

describe('App routes', () => {
  beforeEach(() => {
    AppDataSource.getRepository.mockClear();
  });

  it('responde al health check', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });
});
