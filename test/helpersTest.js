const { assert } = require('chai');
const bcrypt = require('bcrypt');
const { findUserId, emailExists, correctPassword, urlsForUser } = require('../helpers.js');

const testUsers = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: bcrypt.hashSync('purple-monkey-dinosaur', 10)
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: bcrypt.hashSync('dishwasher-funk', 10)
  }
};

const testUrlDatabase = {
  'b2xVn2': {longURL: 'http://www.lighthouselabs.ca', userID: 'testing'},
  '9sm5xK': {longURL: 'http://www.google.com', userID: 'testing'},
  'abc123': {longURL: 'http://www.google.com', userID: '123abc'},
};

describe('#testing getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserId('user@example.com', testUsers);
    const expectedOutput = 'userRandomID';
    assert.equal(user, expectedOutput);
  });
  it('should return undefined for an invalid email', function() {
    const user = findUserId('test@test.com', testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
  it('should return undefined for an empty email', function() {
    const user = findUserId('', testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});

describe('#emailExists', function () {
  it('should return true if an email exists in the user database', function() {
    const bool = emailExists('user@example.com', testUsers);
    const expectedOutput = true;
    assert.equal(bool, expectedOutput);
  });
  it('should return false if an email does not exist in the user database', function() {
    const bool = emailExists('test@test.com', testUsers);
    const expectedOutput = false;
    assert.equal(bool, expectedOutput);
  });
  it('should return false if for an empty email', function() {
    const bool = emailExists('', testUsers);
    const expectedOutput = false;
    assert.equal(bool, expectedOutput);
  });
});

describe('#correctPassword', function () {
  it('should return true if an password matches hashed password in database', function() {
    const bool = correctPassword('user@example.com', 'purple-monkey-dinosaur', testUsers);
    const expectedOutput = true;
    assert.equal(bool, expectedOutput);
  });
  it('should return false if password does not match hashed password in database', function() {
    const bool = correctPassword('user@example.com', 'purple-donkey-minosaur', testUsers);
    const expectedOutput = false;
    assert.equal(bool, expectedOutput);
  });
  it('should return false if for an empty password', function() {
    const bool = correctPassword('user@example.com', '', testUsers);
    const expectedOutput = false;
    assert.equal(bool, expectedOutput);
  });
});

describe('#urlsForUser', function () {
  it('should return the url objects for specified user id', function() {
    const bool = urlsForUser('testing', testUrlDatabase);
    const expectedOutput = {
      'b2xVn2': {longURL: 'http://www.lighthouselabs.ca', userID: 'testing'},
      '9sm5xK': {longURL: 'http://www.google.com', userID: 'testing'},
    };
    assert.deepEqual(bool, expectedOutput);
  });
  it('should return {} if no urls are found for the user', function() {
    const bool = urlsForUser('abc', testUrlDatabase);
    const expectedOutput = {};
    assert.deepEqual(bool, expectedOutput);
  });
  it('should return {} for empty user', function() {
    const bool = urlsForUser('', testUrlDatabase);
    const expectedOutput = {};
    assert.deepEqual(bool, expectedOutput);
  });

});