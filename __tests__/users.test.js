const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');

const robotUser = {
  email: 'mr.roboto@sentient.robot',
  password: '123456'
}

describe('backend-express-template routes', () => {
  beforeEach(() => {
    return setup(pool);
  });

  it('POST / creates a new user', () => {
    const res = await request(app)
    .post('/api/v1/users')
    .send(robotUser);

    expect(res.body).toEqual({
      id: expect.any(String),
      email
    });
  });

  afterAll(() => {
    pool.end();
  });
});
