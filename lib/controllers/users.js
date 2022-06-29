const { Router } = require('express');
const User = require('../models/User');
const UserService = require('../services/UserServices');

const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;

const IS_DEPLOYED = process.env.NODE_ENV === 'production';

module.exports = Router()
  .post('/', async (req, res, next) => {
    try{
      const newUser = await UserService.create(req.body);
      res.json(newUser);
    }catch(e){
      next(e);
    }
  })
  .get('/currentUser', async (req, res) => {
    res.json(req.user);
    
  })
  .post('/sessions', async (req, res, next) => {
    try{
      const { email, password } = req.body;
      const token = await UserService.signIn({ email, password });

      res
        .cookies(process.env.COOKIE_NAME, token, {
          httpOnly: true, 
          secure: IS_DEPLOYED,
          sameSite: IS_DEPLOYED ? 'none' : 'strict',
          maxAge: ONE_DAY_IN_MS,
        })
        .json({ message: 'Congratulations you are now signed in' });
    }catch(e){
      next(e);
    }
  })
  
  
;
