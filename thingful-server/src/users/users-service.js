const xss = require('xss')
const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/

const UsersSercive = {
  validatePassword(password){
    if (password.length < 9)
      return 'Password must be longer than 8 characters'
    if (password.length > 71)
      return 'Password cannot be longer than 72 characters'
    if (password.startsWith(' ') || password.endsWith(' '))
      return 'Password must not start or end with empty spaces'
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password))
      return 'Password must contain 1 upper case, 1 lower case, a number and a special character'
    return null
  },

  hasUserWithUserName(user_name, db){
    return db('thingful_users')
      .where({user_name})
      .first()
      .then(user => !!user)
  },

  insertUser(db, newUser){
    return db
      .insert(newUser)
      .into('thingful_users')
      .returning('*')
      .then(([user]) => user)
  },

  serializeUser(user){
    return {
      id: user.id,
      full_name: xss(user.full_name),
      user_name: xss(user.user_name),
      nickname: xss(user.nickname),
      date_created: new Date(user.date_created),
    }
  }
}

module.exports = UsersSercive
