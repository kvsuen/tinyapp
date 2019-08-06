const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const {
  generateRandomString,
  emailExists,
  findId,
  correctPassword,
  users,
} = require('./helpers');

const app = express();
const PORT = 8080; // default port 8080
app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

// ### Middleware ###
// converts post buffer from client into string we can read
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// ### Views to Render ###
app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// ### Real views below ###
app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: users[req.cookies['user_id']]
  };
  res.render('urls_index', templateVars);
});

// receieve post data from submit button
// generate new shortURL and redirect to show short/long URLS
app.post('/urls', (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = req.body.longURL;
  res.redirect(`/urls/${shortUrl}`);
});

// edit longURL
app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect(`/urls`);
});

// delete shortURL entry
app.post('/urls/:shortURL/delete', (req, res) => {
  console.log(req.params); // Log the POST request body to the console
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

// to create new shortURL for a longURL
app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: users[req.cookies['user_id']]
  };
  if (templateVars.username) {
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

// shows the shortURL & longURL data
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: users[req.cookies['user_id']]
  };
  res.render('urls_show', templateVars);
});

// redirect shortURL to longURL
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// register page
app.get('/register', (req, res) => {
  const templateVars = {
    username: users[req.cookies['user_id']]
  };
  res.render('register', templateVars);
});

// registration handler
app.post('/register', (req, res) => {
  if (
    req.body.email === '' ||
    req.body.password === '' ||
    emailExists(req.body.email)
  ) {
    res
      .status(400)
      .send('Uh oh, something went wrong with the registration, try again.');
  } else {
    const randomId = generateRandomString();
    users[randomId] = {
      id: randomId,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie('user_id', randomId);
    res.redirect('/urls');
  }
});

// login page
app.get('/login', (req, res) => {
  const templateVars = {
    username: users[req.cookies['user_id']]
  };
  res.render('login', templateVars);
});

// login handler
app.post('/login', (req, res) => {
  if (
    req.body.email === '' ||
    req.body.password === '' ||
    !emailExists(req.body.email)
  ) {
    res.status(403).send('Uh oh, something went wrong, try again.');
  } else if (emailExists(req.body.email)) {
    if (correctPassword(req.body.email, req.body.password)) {
      res.cookie('user_id', findId(req.body.email));
      res.redirect('/urls');
    } else {
      res.status(403).send('Wrong password.');
    }
  }
});

// logout feature
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// ### Server listen ###
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
