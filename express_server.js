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
  // res.send("Ok");
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
  // res.redirect(longURL);
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

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});