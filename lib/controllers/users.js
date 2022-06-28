const { Router } = require('express');
const User = require('../models/User');
const UserService = require('../services/UserServices');

module.exports = Router()
  .post('/', async (req, res, next) => {
    try{
      const newUser = await UserService.create(req.body);
      res.json(newUser);
    }catch(e){
      next(e);
    }
    
  });
