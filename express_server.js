const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const urlDatabase = require('./urlDatabase');
const {
  generateRandomString,
  emailExists,
  getUserByEmail,
  correctPassword,
  urlsForUser,
} = require('./helpers');

const users = {};

const app = express();
const PORT = 8080; // default port 8080
app.set('view engine', 'ejs');

// ##### Middleware #####
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['aZkas1', 'gTkas2'],
  // cookie options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// ##### Views to Render #####
app.get('/', (req, res) => {
  // check if user is logged in
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get('/urls', (req, res) => {
  // filter out urls database to only show users own urls per user_id
  const filteredURLbyID = urlsForUser(req.session.user_id, urlDatabase);
  const templateVars = {
    urls: filteredURLbyID,
    username: users[req.session.user_id]
  };
  res.render('urls_index', templateVars);
});

// receieve post data from submit new URL button
// generate new shortURL and redirect to show short/long URLS
app.post('/urls', (req, res) => {
  // check if user is logged in
  if (req.session.user_id) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(403).send("Not authorized to edit.");
  }
});

// route to page for creating new shortURL of a longURL
app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: users[req.session.user_id]
  };
  if (templateVars.username) {
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

// shows the shortURL & longURL data
app.get('/urls/:shortURL', (req, res) => {
  // check if the requested :shortURL exists
  if (Object.keys(urlDatabase).includes(req.params.shortURL)) {
    const userCookie = req.session.user_id;
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      username: users[userCookie],
      urlsList: urlsForUser(userCookie, urlDatabase),
    };
    res.render('urls_show', templateVars);
  } else {
    res.status(404).send("Error! This shortened url does not exist.");
  }
});

// redirect shortURL to longURL
app.get('/u/:shortURL', (req, res) => {
  // check if the requested :shortURL exists
  if (Object.keys(urlDatabase).includes(req.params.shortURL)) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.status(404).send("Error! This shortened url does not exist.");
  }
});

// edit longURL
app.post('/urls/:shortURL', (req, res) => {
  // check if the requested :shortURL is owned by the current req.session.user_id
  if (urlsForUser(req.session.user_id, urlDatabase)[req.params.shortURL]) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect(`/urls`);
  } else {
    res.status(403).send("Not authorized to edit.");
  }
});

// delete shortURL entry
app.post('/urls/:shortURL/delete', (req, res) => {
  // check if the requested :shortURL is owned by the current req.session.user_id
  if (urlsForUser(req.session.user_id, urlDatabase)[req.params.shortURL]) {
    delete urlDatabase[req.params.shortURL];
    res.redirect(`/urls`);
  } else {
    res.status(403).send("Not authorized to delete.");
  }
});

// register page
app.get('/register', (req, res) => {
  // check if user is logged in
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      username: users[req.session.user_id]
    };
    res.render('register', templateVars);
  }
});

// registration handler
app.post('/register', (req, res) => {
  if (
    req.body.email === ''
    || req.body.password === ''
    || emailExists(req.body.email, users)
  ) {
    res
      .status(400)
      .send('Uh oh, something went wrong with the registration, try again.');
  } else {
    const randomId = generateRandomString();
    // add new user to database
    users[randomId] = {
      id: randomId,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    // set cookie to equal the randomId
    req.session.user_id = randomId;
    res.redirect('/urls');
  }
});

// login page
app.get('/login', (req, res) => {
  // check if user is logged in
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      username: users[req.session.user_id]
    };
    res.render('login', templateVars);
  }
});

// login handler
app.post('/login', (req, res) => {
  if (
    req.body.email === ''
    || req.body.password === ''
    || !emailExists(req.body.email, users)
  ) {
    res.status(403).send('Uh oh, something went wrong, try again.');
  } else {
    if (correctPassword(req.body.email, req.body.password, users)) {
      req.session.user_id = getUserByEmail(req.body.email, users);
      res.redirect('/urls');
    } else {
      res.status(403).send('Wrong password.');
    }
  }
});

// logout feature
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// ##### Server listen #####
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
