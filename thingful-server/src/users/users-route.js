const express = require('express');
const usersRoute = express.Router();
const jsonParser = express.json();
const UsersService = require('./users-service');
const path = require('path');

usersRoute
  .route('/')
  .post(jsonParser, (req, res, next) => {
    const requiredFields = ['full_name', 'user_name', 'password'];
    for (const field of requiredFields){
      if (!req.body[field]){
        return res.status(400).json({
          error: `Missing '${field}' in request body`
        })
      }
    }
    const { password, user_name, full_name, nickname } = req.body
    passwordError = UsersService.validatePassword(password)
    if (passwordError)
      return res.status(400).json({error: passwordError});

    UsersService.hasUserWithUserName(user_name,
      req.app.get('db'))
      .then(taken => {
        if (taken)
          return res.status(400).json({error: 'Username already exists'})
        const newUser = {
          user_name,
          password,
          full_name,
          nickname,
          date_created: 'now()',
        }
        return UsersService.insertUser(req.app.get('db'), newUser)
          .then(user => {
            res
              .status(201)
              .location(path.posix.join(req.originalUrl, `/${user.id}`))
              .json(UsersService.serializeUser(user))
          })
      }).catch(next)
  })

  module.exports = usersRoute;
