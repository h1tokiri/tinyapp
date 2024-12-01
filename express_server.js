const express = require("express");
const app = express();
const PORT = 8080; //default port 8080

app.set("view engine", "ejs");

//add this middleware to parse URL-encoded payloads
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(); // generate a new short URL
  const longURL = req.body.longURL; // extract the long URL from the form data

  // add the new short URL and its corresponding long URL to the database
  urlDatabase[shortURL] = longURL;
  
  console.log(`Short URL: ${shortURL}, Long URL: ${longURL}`); //log the mapping
  res.redirect(`/urls/${shortURL}`); // redirect to the short URL's page
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id; // get the ID from the route parameter
  const longURL = urlDatabase[id]; // look up the long URL in the database

  // if the id does not exist, return a 404 error
  if (!longURL) {
    res.status(404).send("URL not found!");
    return;
  }

  const templateVars = { id, longURL }; //pass ID and longURL to the template
  res.render("urls_show", templateVars); //render the template
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

const urls = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// app.post("/urls", (req, res) => {
//   console.log(req.body); // Log the POST request body to the console
//   res.send("Ok"); // Respond with 'Ok' (we will replace this)
// });