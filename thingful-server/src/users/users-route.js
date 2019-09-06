const express = require('express');
const usersRoute = express.Router();
const jsonParser = express.json();

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
    res.status(200).end();
  })

  module.exports = usersRoute;
