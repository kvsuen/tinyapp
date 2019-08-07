const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const {
  users,
  urlDatabase,
  generateRandomString,
  emailExists,
  findId,
  correctPassword,
  urlsForUser,
} = require('./helpers');

const app = express();
const PORT = 8080; // default port 8080
app.set('view engine', 'ejs');

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
  // filter out urls list to only show users own urls per user_id
  const filteredURLbyID = urlsForUser(req.cookies['user_id']);
  const templateVars = {
    urls: filteredURLbyID,
    username: users[req.cookies['user_id']]
  };
  res.render('urls_index', templateVars);
});

// receieve post data from submit button
// generate new shortURL and redirect to show short/long URLS
app.post('/urls', (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = {
    longURL: req.body.longURL,
    userID: req.cookies['user_id']
  };
  console.log(urlDatabase);
  res.redirect(`/urls/${shortUrl}`);
});

// edit longURL
app.post('/urls/:shortURL', (req, res) => {
  if (urlsForUser(req.cookies['user_id'])[req.params.shortURL]) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect(`/urls`);
  } else {
    res.status(403).send("Not authorized to edit.");
  }
});

// delete shortURL entry
app.post('/urls/:shortURL/delete', (req, res) => {
  if (urlsForUser(req.cookies['user_id'])[req.params.shortURL]) {
    delete urlDatabase[req.params.shortURL];
    res.redirect(`/urls`);
  } else {
    res.status(403).send("Not authorized to delete.");
  }
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
  if (Object.keys(urlDatabase).includes(req.params.shortURL)) {
    const userCookie = req.cookies['user_id'];
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      username: users[userCookie],
      urlsList: urlsForUser(userCookie),
    };
    res.render('urls_show', templateVars);
  } else {
    res.status(403).send("Error! This shortened url does not exist.");
  }
});

// redirect shortURL to longURL
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
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
      password: bcrypt.hashSync(req.body.password, 10)
    };
    console.log(users[randomId]);
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
