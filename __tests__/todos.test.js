const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserServices');

const robotUser = {
  email: 'mr.roboto@sentient.robot',
  password: '123456', 
  first_name: 'Roberto',
  last_name: 'Machinero'
};

const registerAndLogin = async (userProps = {}) => {
  const password = userProps.password ?? robotUser.password;

  const agent = request.agent(app);

  const user = await UserService.create({ ...robotUser, ...userProps });

  const { email, first_name, last_name } = user;
  await agent.post('/api/v1/users/sessions').send({ email, password, first_name, last_name });
  return [agent, user];
};

describe('backend-express-template routes', () => {
  beforeEach(() => {
    return setup(pool);
  });

  it('POST / allows authenticated users to post todos', async () => {
    const [agent, user] = await registerAndLogin();
    const todo = { description: 'Wash the car', importance: 3 }; 
    const res = await agent
      .post('/api/v1/todos')
      .send(todo);

    expect(res.status).toEqual(200);
    expect(res.body).toEqual({
      id: expect.any(String),
      description: 'Wash the car',
      importance: 3, 
      user_id: user.id,
      completed: false,
      created_at: expect.any(String)
    });
  });

  afterAll(() => {
    pool.end();
  });
});