const pool = require('../utils/pool');

module.exports = class User {
  id; 
  email;
  first_name;
  last_name;
  #passwordHash;
  constructor(row){
    this.id = row.id;
    this.email = row.email;
    this.first_name = row.first_name;
    this.last_name = row.last_name;
    this.#passwordHash = row.password_hash;
  }

  static async insert({ email, passwordHash, first_name, last_name }) {
    const { rows } = await pool.query(
      `
      INSERT INTO users (email, password_hash, first_name, last_name)
    VALUES ($1, $2, $3, $4) 
    RETURNING *`, 
      [email, passwordHash, first_name, last_name]
    );
    return new User(rows[0]);
  }

  static async getByEmail(email){
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email=$1', 
      [email]
    );
    if(!rows[0]) return null;

    return new User(rows[0]);
  }

  get passwordHash(){
    return this.#passwordHash;
  }
};
