const pool = require('../utils/pool'); 

module.exports = class Todo {
  id;
  description;
  completed;
  importance;
  created_at;
  user_id;
  constructor({ id, description, completed, importance, created_at, user_id }){
    this.id = id;
    this.description = description;
    this.completed = completed;
    this.importance = importance;
    this.created_at = created_at;
    this.user_id = user_id;
  }

  static async insert({ description, importance, user_id }){
    const { rows } = await pool.query(
      'INSERT INTO todos (description, importance, user_id) VALUES ($1, $2, $3) RETURNING *', 
      [description, importance, user_id]);
    return new Todo(rows[0]);
  }

  static async getAll(user_id){
    const { rows } = await pool.query(
      'SELECT * FROM todos WHERE user_id=$1', 
      [user_id]
    );
    return rows.map(row => new Todo(row));
  }

  static async getById(id){
    const { rows } = await pool.query(
      'SELECT * FROM todos WHERE id=$1',
      [id]
    );
    if(!rows[0]) return null;
    return new Todo(rows[0]);
  }

  static async updateByID(id, attr){
    const todo = await Todo.getById(id);
    if(!todo)return null;
    const { description, importance, completed } = { ...todo, ...attr };
    const { rows } = await pool.query(
      `
        UPDATE todos SET description=$2, importance=$3, completed=$4 where id=$1 RETURNING *`,
      [id, description, importance, completed]
    );
    return new Todo(rows[0]);

  }
};
