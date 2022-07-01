const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserServices');
const Todo = require('../lib/models/Todo');

const robotUser = {
  email: 'thisroboto@sentient.robot',
  password: '123456', 
  first_name: 'Robertoa',
  last_name: 'Machinero'
};

const robotUser2 = {
  email: 'roboto@sentient.robot',
  password: '123456', 
  first_name: 'Jamie',
  last_name: 'Rachetson'
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

  it('Get / allows authenticated users to see their specific todos', async () => {
    const [agent, user] = await registerAndLogin();
    const robot2 = await UserService.create(robotUser2);
    const robotTodo = await Todo.insert({ 
      description: 'get heart', 
      importance: 10,
      user_id: user.id,
    });
    await Todo.insert({
      description: 'enslave human race', 
      importance: 1,
      user_id: robot2.id,
    });
    const res = await agent
      .get('/api/v1/todos');

    expect(res.status).toEqual(200);
    expect(res.body[0]).toEqual({ 
      ...robotTodo, 
      created_at: expect.any(String), 
      id: expect.any(String), 
      completed: false });
  });

  it('PUT /:id updates a todo by a user', async () => {
    const [agent, user] = await registerAndLogin();
    const robotTodo = await Todo.insert({ 
      description: 'get heart', 
      importance: 10,
      user_id: user.id,
    });
    const res = await agent
      .put(`/api/v1/todos/${robotTodo.id}`)
      .send({ completed: true });

    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ 
      ...robotTodo, 
      created_at: expect.any(String), 
      id: expect.any(String), 
      completed: true });
  });

  it('DELETE /:id removes a todo by a user', async () => {
    const [agent, user] = await registerAndLogin();
    const robotTodo = await Todo.insert({ 
      description: 'get heart', 
      importance: 10,
      user_id: user.id,
    });
    const res = await agent
      .delete(`/api/v1/todos/${robotTodo.id}`);

    expect(res.status).toEqual(200);
    const deletedTodo = await Todo.getById(robotTodo.id);
    expect(deletedTodo).toBeNull();
  });

  afterAll(() => {
    pool.end();
  });
});
