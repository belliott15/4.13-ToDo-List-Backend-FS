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

  static async signIn({ email, password = '' }) {
    try{
      const user = await User.getByEmail(email);

      if(!user)throw new Error('Invalid Email');
      if(!bcrypt.compareSync(password, user.passwordHash))
        throw new Error('Invalid Password');

      const token = jwt.sign({ ...user }, process.env.JWT_SECRET, {
        expiresIn: '1 day',
      });

      return token;
    }catch(e){
      e.status = 401;
      throw e;
    }
  }
};
