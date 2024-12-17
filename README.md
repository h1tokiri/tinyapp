# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly). This application contains a lot of heart and soul (and a healthy amount of tears) to make it all work. This is version 2. Enjoy!

## Final Product

!["screenshot Login Page"](https://github.com/h1tokiri/tinyapp/blob/main/docs/01-login.png)
!["screenshot Registration Page"](https://github.com/h1tokiri/tinyapp/blob/main/docs/02-register.png)
!["screenshot My URLs with Encrypted Cookie"](https://github.com/h1tokiri/tinyapp/blob/main/docs/03-my_urls_encrypted_cookie.png)
!["screenshot My URLs with Examples and Encrypted Cookie"](https://github.com/h1tokiri/tinyapp/blob/main/docs/04-my_urls_filled.png)
!["screenshot My URLs on Edit Page"](https://github.com/h1tokiri/tinyapp/blob/main/docs/05-my_urls_edit_update.png)
!["screenshot My URLs Following Edit-Update"](https://github.com/h1tokiri/tinyapp/blob/main/docs/06-my_urls_updated.png)
!["screenshot if User Not Logged In, HTML Error Message"](https://github.com/h1tokiri/tinyapp/blob/main/docs/07-if_not_logged_in_return_HTML_error_message.png)

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Use `npm start` in terminal to initiate the application.

## Updated Fixes

- Functional requirements were fixed to address:
  - When a user is logged in, there's an extra 'logout' button underneath the nav bar.
  - Major: If a user is not logged in, GET /urls should return HTML with a relevant error message.
  - Major: If a user is not logged in, GET /urls/new should redirect them to /login.
  - Major: After updating a URL, the user should be redirected to GET /urls. The URL also does not update.