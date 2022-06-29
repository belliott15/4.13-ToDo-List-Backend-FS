const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserServices');

const robotUser = {
  email: 'mr.roboto@sentient.robot',
  password: '123456', 
  firstName: 'Roberto',
  lastName: 'Machinero'
};

const registerAndLogin = async (userProps = {}) => {
  const password = userProps.password ?? robotUser.password;

  const agent = request.agent(app);

  const user = await UserService.create({ ...robotUser, ...userProps });

  const { email } = user;
  await agent.post('/api/v1/users/sessions').send({ email, password });
  return [agent, user];
};

describe('backend-express-template routes', () => {
  beforeEach(() => {
    return setup(pool);
  });

  it('POST / creates a new user', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .send(robotUser);

    expect(res.status).toEqual(200);
    expect(res.body).toEqual({
      id: expect.any(String),
      email: 'mr.roboto@sentient.robot',
      firstName: 'Roberto',
      lastName: 'Machinero'
    });
  });

  it('GET / returns the current user', async () => {
    const [agent, user] = await registerAndLogin();
    const currentUser = await agent
      .get('/api/v1/users/currentUser');
    expect(currentUser.status).toEqual(200);
    expect(currentUser.body).toEqual({
      ...user, 
      exp: expect.any(Number),
      iat: expect.any(Number)
    });
  });

  afterAll(() => {
    pool.end();
  });
});
