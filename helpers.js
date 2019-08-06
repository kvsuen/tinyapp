const users = require('./users');

const generateRandomString = function() {
  const result = [];
  const keys = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", 1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  while (result.length < 6) {
    const randomNum = Math.floor(Math.random() * keys.length);
    const randomNumCase = Math.floor(Math.random() * 2);

    let char = keys[randomNum];
    if (typeof char === "string" && randomNumCase === 1) {
      char = char.toUpperCase();
    }
    result.push(char);
  }

  return result.join("");
};

// helper function to help check duplicate emails in registration
const emailExists = function(email) {
  for (const user in users) {
    if (users.hasOwnProperty(user)) {
      if (users[user].email === email) {
        return true;
      }
    }
  }
  return false;
};

// helper function to find id of user depending on email
const findId = function(email) {
  for (const user in users) {
    if (users.hasOwnProperty(user)) {
      if (Object.values(users[user]).includes(email)) {
        return users[user].id;
      }
    }
  }
  return undefined;
};

// helper function to check if password is correct
const correctPassword = function(email, password) {
  if (users[findId(email)].password === password) {
    return true;
  }
  return false;
};

module.exports = {
  generateRandomString,
  emailExists,
  findId,
  correctPassword,
  users
};