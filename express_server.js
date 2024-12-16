// 1. Imports and App Setup
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; //default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true })); //add this middleware to parse URL-encoded payloads
app.use(cookieParser());

// 2. Global Variables and Helper Functions
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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
      return users[userId]; // return the user object if email matches
    }
  }
  return null; // return null if no match is found
}

// 3. Authentication Routes

app.get("/register", (req, res) => {
  res.render("register");
});

// POST route for handling user registration
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  console.log("Received email:", email);
  console.log("Received password:", password);

  //check if PW is missing
  if (!email || !password) {
    return res.status(400).send("Email and password are required!");
  }

  // check if the email already exists using the helper function
  const existingUser = getUserByEmail(email, users);
  if (existingUser) {
    return res.status(400).send("Email already registered!");
  }

  // check if email already exists
  // for (const userId in users) {
  //   if (users[userId].email === email) {
  //     return res.status(400).send("Email already registered!");
  //   }
  // }

  // generate a new user ID and save the user
  const userId = generateRandomString();
  users[userId] = {
    id: userId,
    email,
    password,
  };

  console.log("Updated users object:", users); // debugging step: log the users to verify new user is added

  // set a cookie with the user's ID and redirect to /urls

  res.cookie("user_id", userId);
  res.redirect("/urls");
});

// app.get("/login", (req, res) => {
//   const userId = req.cookies.user_id;
//   const user = users[userId];

//   const templateVars = {user}; // pass user data for consistency
//   res.render("login", templateVars);
// });

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // user the helper function find the user by email
  const user = getUserByEmail(email, users);

  // // find the user by email
  // let user = null;
  // for (const userId in users) {
  //   if (users[userId].email === email) {
  //     user = users[userId];
  //   }
  // }

  // check if the user exists and the password matches
  if (!user || user.password !== password) {
    return res.status(403).send("Invalid email or password!");
  }

  // set a cookie with the user's ID and redirect to /urls

  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

console.log(getUserByEmail("user@example.com", users)); // Should return the user object for "user@example.com"
console.log(getUserByEmail("nonexistent@example.com", users)); // Should return null


//   const username = req.body.username; // get hte username from the form
//   if (username) {
//     res.cookie("username", username); //set a cookie with the username
//     res.redirect("/urls"); //redirect to the URLs page
//   } else {
//     res.status(400).send("Username is Required!");
//   }
// });

app.post("/logout", (req, res) => {
  res.clearCookie("user_id"); // clear the username cookoie
  res.redirect("/urls"); //redirect to the URLs page
});

// 4. General Routes

app.get("/urls", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];

  const templateVars = {
    urls: urlDatabase,
    user,
  };
  // username: req.cookies.username }; commented out because no longer needed
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];

  if (!user) {
    return res.redirect("/login"); // redirect to login if not logged in
  }

  const templateVars = {
    user // username: req.cookies.username
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(); // generate a new short URL
  const longURL = req.body.longURL; // extract the long URL from the form data

  // add the new short URL and its corresponding long URL to the database
  urlDatabase[shortURL] = longURL;

  console.log(`Short URL: ${shortURL}, Long URL: ${longURL}`); //log the mapping
  res.redirect(`/urls/${shortURL}`); // redirect to the short URL's page
  // res.send("Ok");
});

// 5. URL-Specific Routes

app.get("/urls/:id", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId]; // get logged in user
  const id = req.params.id; // get the ID from the route parameter
  const longURL = urlDatabase[id]; // look up the long URL in the database

  if (!user) {
    return res.status(401).send("Please log in to view this URL!");
  }

  // if the id does not exist, return a 404 error
  if (!longURL) {
    res.status(404).send("URL not found!");
    return;
  }

  const templateVars = { id, longURL, user }; //pass ID and longURL to the template
  res.render("urls_show", templateVars); //render the template
  // res.redirect(longURL);
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id; // get the short URL ID
  const newLongURL = req.body.longURL; // get the updated long URL from the form

  //update the long URL in the database
  if (urlDatabase[id]) {
    urlDatabase[id] = newLongURL;
  } else {
    return res.status(404).send("Short URL not found!");
  }

  // redirect back to the URLs list
  res.redirect("/urls");
});

app.get("/urls/:id/edit", (req, res) => {
  const id = req.params.id; // extract the short URL ID from the route paramters
  const longURL = urlDatabase[id]; // retrieve the corresponding long URL from the database

  // if the short URL id does not exist in the databse, return a 404 error
  if (!longURL) {
    res.status(404).send("URL not found!");
    return;
  }
  const templateVars = { id, longURL }; // prepare the variables to pass to the template
  res.render("urls_show", templateVars); // render the 'urls_show' template
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id]; // remove the URL from the database
  res.redirect("/urls"); // redirect back to the URLs list
});

// optiona; ;route to handle redirection from short URL to long URL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]; // look up the long URL in the databse

  // if the short url doesn't exist, return a 404 error
  if (!longURL) {
    res.status(404).send("Short URL not found!");
    return;
  }
  res.redirect(longURL); // redirect to long url
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