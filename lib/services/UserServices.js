const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = class UserService {
  static async create({ email, password, firstName, lastName }) {
    if (email.length <= 6) {
      throw new Error('Bad Email Try Again'); 
    }

    if (password.length < 6){
      throw new Error('Password must be six characters long');
    }

    const passwordHash = await bcrypt.hash(
      password,
      Number(process.env.SALT_ROUNDS)
    );

    const user = await User.insert({
      email,
      passwordHash, 
      firstName, 
      lastName
    });

    return user;
  }

};
