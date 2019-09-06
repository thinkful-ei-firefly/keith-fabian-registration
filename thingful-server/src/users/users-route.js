const express = require('express');
const usersRoute = express.Router();
const jsonParser = express.json();
const UsersService = require('./users-service')

usersRoute
  .route('/')
  .post(jsonParser, (req, res) => {
    const requiredFields = ['full_name', 'user_name', 'password'];
    for (const field of requiredFields){
      if (!req.body[field]){
        return res.status(400).json({
          error: `Missing '${field}' in request body`
        })
      }
    }
    const {password, user_name} = req.body
    passwordError = UsersService.validatePassword(password)
    if (passwordError)
      return res.status(400).json({error: passwordError});

    UsersService.hasUserWithUserName(user_name,
      req.app.get('db'))
      .then(taken => {
        if (taken)
          return res.status(400).json({error: 'Username already exists'})
      })

    res.status(200).end();
  })

  module.exports = usersRoute;
