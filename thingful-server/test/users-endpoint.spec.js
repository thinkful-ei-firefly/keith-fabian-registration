const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe.only('Users Endpoints', function() {
  let db

  const { testUsers } = helpers.makeThingsFixtures()
  const testUser = testUsers[0]

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe(`POST /api/users`, () => {
    context(`User Validation`, () => {
      beforeEach('insert users', () =>
        helpers.seedUsers(
          db,
          testUsers,
        )
      )

      const requiredFields = ['user_name', 'password', 'full_name']

      requiredFields.forEach(field => {
        const registerAttemptBody = {
          user_name: 'test user_name',
          password: 'test password',
          full_name: 'test full_name',
          nickname: 'test nickname',
        }

        it(`responds with 400 required error when '${field}' is missing`, () => {
          delete registerAttemptBody[field]

          return supertest(app)
            .post('/api/users')
            .send(registerAttemptBody)
            .expect(400, {
              error: `Missing '${field}' in request body`,
            })
        })
      })
    })

    it('responds 400 "Password must be longer than 8 characters" when password not long enough', () => {
      const userShortPasswrd = {
        user_name: 'test-user-name',
        password: '1234567',
        full_name: 'full-name'
      }
      return supertest(app)
        .post('/api/users')
        .send(userShortPasswrd)
        .expect(400, {error: 'Password must be longer than 8 characters'})
    })

    it('Responds 400 "Password cannot be longer than 72 characters"', () => {
      const userLongPassword = {
        user_name: 'test-user-name',
        password: '*'.repeat(72),
        full_name: 'full-name'
      }
      return supertest(app)
        .post('/api/users')
        .send(userLongPassword)
        .expect(400, {error: 'Password cannot be longer than 72 characters'})
    })

    it('responds 400 error when password starts with spaces', () => {
      const userPasswordSpaces = {
        user_name: 'test-user-name',
        password: ' 1234567ee',
        full_name: 'full-name'
      }
      return supertest(app)
        .post('/api/users')
        .send(userPasswordSpaces)
        .expect(400, {error: 'Password must not start or end with empty spaces'})
    })
    it('responds 400 error when password ends with spaces', () => {
      const userPasswordSpaces = {
        user_name: 'test-user-name',
        password: '1234567ee ',
        full_name: 'full-name'
      }
      return supertest(app)
        .post('/api/users')
        .send(userPasswordSpaces)
        .expect(400, {error: 'Password must not start or end with empty spaces'})
    })

    it('responds 400 error when password isnt complex enough', () => {
      const userPasswordSpaces = {
        user_name: 'test-user-name',
        password: 'eeeeeeeeeeee',
        full_name: 'full-name'
      }
      return supertest(app)
        .post('/api/users')
        .send(userPasswordSpaces)
        .expect(400, {error: 'Password must contain 1 upper case, 1 lower case, a number and a special character'})
    })

    it('responds 400 user name already taken ', () => {
      const duplicateUser = {
        user_name: testUser.user_name,
        password: '1aAb*ciaohgfwqegf',
        full_name: 'name'
      }

      supertest(app)
        .post('/api/users')
        .send(duplicateUser)
        .expect(400, {error: 'Username already exists'})
    })
  })
})
