const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = { 
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  }
};

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

// ### Middleware ###
// converts post buffer from client into string we can read
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// ### Views to Render ###
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// ### Real views below ###
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"],
  };
  res.render("urls_index", templateVars);
});

// receieve post data from submit button
// generate new shortURL and redirect to show short/long URLS
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = req.body.longURL;
  res.redirect(`/urls/${shortUrl}`);
});

// edit longURL
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect(`/urls`);
});

// delete shortURL entry
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(req.params);  // Log the POST request body to the console
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

// to create new shortURL for a longURL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});

// shows the shortURL & longURL data
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"],
  };
  res.render("urls_show", templateVars);
});

// redirect shortURL to longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// login feature
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

// logout feature
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

// register page
app.get("/register", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("register", templateVars);
});

// registration handler
app.post("/register", (req, res) => {
  const randomId = generateRandomString();
  users[randomId] = {
    id: randomId,
    email: req.body.email,
    password: req.body.password,
  };
  console.log(users);
  res.cookie("user_id", randomId);
  res.redirect("/urls");
});

// ### Server listen ###
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});