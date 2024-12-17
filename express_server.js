// 1. Imports and App Setup
const express = require("express");
// const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const app = express();
const PORT = 8080; //default port 8080
const bcrypt = require("bcryptjs");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true })); //add this middleware to parse URL-encoded payloads
// app.use(cookieParser());
app.use(cookieSession({
  name: "session", //name of the session cookie
  keys: ["secretKey"], // secret key to sign the cookies
  maxAge: 24 * 60 * 60 * 1000 // session expires after 24 hours
}));

// 2. Global Variables and Helper Functions
const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userId: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userId: "user2RandomID" },
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: {
    longURL: "https://www.google.ca", userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

function getUserByEmail(email, users) {
  for (const userId in users) {
    if (users[userId].email === email) {
      console.log(`User found for email: ${email}`);
      return users[userId]; // return the user object if email matches
    }
  }
  console.log(`No user found for email: ${email}`);
  return null; // return null if no match is found
}

function urlsForUser(userId) {
  const filteredURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userId === userId) {
      filteredURLs[shortURL] = { longURL: urlDatabase[shortURL].longURL };
    }
  }
  return filteredURLs;
}

// 3. Authentication Routes

app.get("/", (req, res) => {
  const userId = req.session.user_id; // req.cookies.user_id;
  const user = users[userId];

  if (user) {
    return res.redirect("/urls"); // redirect to /urls if logged in
  }
  return res.redirect("/login"); // redirect to /login if not logged in
});

app.get("/register", (req, res) => {
  const userId = req.session.user_id; // req.cookies.user_id;
  const user = users[userId]; // look up the user based on the cookie

  if (user) {
    // if logged in, redirect to /urls
    return res.redirect("/urls");
  }

  const templateVars = { user }; // pass the user variable to the template
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const userId = req.session.user_id; // req.cookies.user_id;
  const user = users[userId]; // check if the user is already logged in

  // if logged in, redirect to /urls
  if (user) {
    return res.redirect("/urls");
  }

  const templateVars = { user };
  res.render("login", templateVars); // render the login form
});

// POST route for handling user registration
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  //check if PW is missing
  if (!email || !password) {
    console.log("Error: Email of password is missing");
    return res.status(400).send("Email and password are required!");
  }

  // check if the email already exists using the helper function
  const existingUser = getUserByEmail(email, users);
  if (existingUser) {
    console.log("Error: Email already registered");
    return res.status(400).send("Email already registered!");
  }

  // generate a new user ID and save the user
  const userId = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10); // 10 is the saltRounds value

  users[userId] = {
    id: userId,
    email,
    password: hashedPassword, // store the hashed password
  };

  console.log("Updated users object:", users[userId]); // debugging step: log the users to verify new user is added

  // set a cookie with the user's ID and redirect to /urls

  // res.cookie("user_id", userId);
  req.session.user_id = userId;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // user the helper function find the user by email
  const user = getUserByEmail(email, users);

  // if user is not found, send a 403 status code
  if (!user) {
    return res.status(403).send("Error: Invalid email or password");
  }

  // if pw dont match, send a 403 status code
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Invalid email or password!");
  }

  // set a cookie with the user's ID and redirect to /urls
  // res.cookie("user_id", user.id);
  req.session.user_id = user.id;
  res.redirect("/urls");
});

console.log(getUserByEmail("user@example.com", users)); // Should return the user object for "user@example.com"
console.log(getUserByEmail("nonexistent@example.com", users)); // Should return null

app.post("/logout", (req, res) => {
  req.session = null; //res.clearCookie("user_id"); // clear the username cookoie
  res.redirect("/login"); //redirect to the login page
});

// 4. General Routes

app.get("/urls", (req, res) => {
  const userId = req.session.user_id; // req.cookies.user_id;
  const user = users[userId];

  if (!user) {
    const templateVars = {
      message: "You must log in to view your URLs.",
      user: null
    };
    // return res.status(401).send(`
    //   <h2>You must log in to view URLs. </h2>
    //   <a href="/login">Login</a> or <a href="/register">Register</a>
    //   `);
    return res.render("error_view", templateVars); // render an error view
  }

  const userURLs = urlsForUser(userId);

  const templateVars = {
    urls: userURLs,
    user,
  };
  // username: req.cookies.username }; commented out because no longer needed
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];

  if (!user) {
    // render a view prompting the user to log in or register
    const templateVars = { user };
    return res.redirect("/login"); // redirect to login if not logged in
  }

  // const userURLs = urlsForUser(userId);

  const templateVars = { user };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const userId = req.session.user_id; // req.cookies.user_id; // added for redirecting people to register in order to create new url
  const user = users[userId]; // added for redirecting people to register in order to create new url

  if (!user) {
    // if the user is not logged in, send an HTML error message
    return res.status(401).send("Error: You must be logged in to create a new short URL.");
  }

  const shortURL = generateRandomString(); // generate a new short URL
  const longURL = req.body.longURL; // extract the long URL from the form data

  if (!longURL) {
    // validate that the long URL is provided
    return res.status(400).send("Error: A valid URL is required.");
  }

  // add the new short URL and its corresponding long URL to the database
  urlDatabase[shortURL] = {
    longURL: longURL,
    userId: userId, // associate the short URL with the user who created it
  };

  console.log(`Short URL: ${shortURL}, Long URL: ${longURL}`); //log the mapping
  res.redirect(`/urls/${shortURL}`); // redirect to the short URL's page
});

// 5. URL-Specific Routes

app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id; //req.cookies.user_id;
  const user = users[userId]; // get logged in user
  const urlEntry = urlDatabase[req.params.id];

  if (!user) {
    const templateVars = { message: "You must log in to view this URL.", user };
    return res.render("error_view", templateVars);
  }

  if (!urlEntry) {
    const templateVars = { message: "This URL does not exist.", user };
    return res.render("error_view", templateVars);
  }

  if (urlEntry.userId !== userId) {
    //if the short URL ID does not exist in teh database, send an error message
    const templateVars = { message: "You do not have permission to view this URL." };
    return res.render("error_view", templateVars);
  }

  const templateVars = { id: req.params.id, longURL: urlEntry.longURL, user }; //pass ID and longURL to the template
  res.render("urls_show", templateVars); //render the template
  // res.redirect(longURL);
});

app.post("/urls/:id", (req, res) => {
  const userId = req.session.user_id; // get the short URL ID
  const urlEntry = urlDatabase[req.params.id];

  if (!userId) {
    const templateVars = { message: "You must log in to view this URL.", user: null };
    return res.render("error_view", templateVars);
  }

  if (!urlEntry) {
    const templateVars = { message: "This URL does not exist.", user: users[userId] };
    return res.render("error_view", templateVars);
  }

  if (urlEntry.userId !== userId) {
    const templateVars = { message: "You do not have permission to edit this URL.", user: users[userId] };
    return res.render("error_view", templateVars);
  }

  //update the long URL
  urlDatabase[req.params.id].longURL = req.body.longURL;

  res.redirect("/urls"); // redirect back to the URLs list
});

app.get("/urls/:id/edit", (req, res) => {
  const userId = req.session.user_id; //req.cookies.user_id;
  const user = users[userId];
  const id = req.params.id; // extract the short URL ID from the route paramters, taking out for locking URLs for users
  const urlEntry = urlDatabase[id]; // retrieve the corresponding entry from the database

  if (!user) {
    return res.status(401).send("You must log in to edit this URL.");
  }

  if (!urlEntry || urlEntry.userId !== userId) {
    // if the userId doesnt match the userId that created the URL, they will not have permission to edit
    return res.status(403).send("You do not have permission to edit this URL!");
  }

  const templateVars = { id: req.params.id, longURL: urlEntry.longURL, user }; // prepare the variables to pass to the template
  res.render("urls_show", templateVars); // render the 'urls_show' template
});

app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id; //req.cookies.user_id;
  const urlEntry = urlDatabase[req.params.id];

  // if (!urlEntry || urlEntry.userId !== userId) {
  //   return res.status(403).send("You do not have permission to delete this URL.");
  // }

  if (!userId) {
    const templateVars = { message: "You must log in to delete URLs.", user: null };
    return res.render("error_view", templateVars);
  }
  if (!urlEntry) {
    const templateVars = { message: "This URL does not exist.", user: users[userId] };
    return res.render("error_view", templateVars);
  }

  if (urlEntry.userId !== userId) {
    const templateVars = { message: "You do not have permission to delete this URL.", user: users[userId] };
    return res.render("error_view", templateVars);
  }

  delete urlDatabase[req.params.id]; // remove the URL from the database
  res.redirect("/urls"); // redirect back to the URLs list
});

// optiona; ;route to handle redirection from short URL to long URL
app.get("/u/:id", (req, res) => {

  const urlEntry = urlDatabase[req.params.id];

  if (!urlEntry) {
    // if the short URL ID does not exist, send a 404 error
    return res.status(404).send(`
      <h1>Short URL not found!</h1>
      <p>The short URL with ID <strong>${req.params.id}</strong> does not exist in our databse.</p>
      <a href="/urls">Go back to your URLs</a>
      `);
  }
  return res.redirect(urlEntry.longURL);
});

// 6. Utility Routes

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//7. Start Server

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});