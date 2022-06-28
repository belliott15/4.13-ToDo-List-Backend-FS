const { Router } = require('express');
const User = require('../models/User');

module.exports = Router()
  .post('/', async (req, res) => {
    const newUser = await User.insert();
    res.json(newUser);
  });
