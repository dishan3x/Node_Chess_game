"use strict;"

//The port to serve on
const PORT = 3040;

//global variables
var fs = require('fs');
var http = require('http');
var encryption = require('./lib/encryption');
var urlencoded = require('./lib/form-urlencoded');
var parseCookie = require('./lib/cookie-parser');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('scrumtastic.sqlite3', function(err) {
  if(err) console.error(err);
});
var server = new http.Server(handleRequest);
var io = require('socket.io')(server);


// setup the websockets
var connected = 0;
io.on('connection', function(socket) {
  console.log('came here');
    var name = 'User ' + connected;
    var color = 'gray';
    connected++;

    socket.on('message', function(text) {
        io.emit('message', {
            user: name,
            text: text,
            color: color
        });
    });

    socket.on('color', function(newColor) {
        color = newColor;
    });

    socket.emit('welcome', "Welcome, " + name + "!");
});

/** @function serveFile
 * Serves a static file resource
 * @param {string} file - the path to the file
 * @param {string} type - the Content-Type of the file
 * @param {http.incomingRequest} req - the request object
 * @param {http.serverResponse} res - the response object
 */
function serveFile(file, type, req, res) {
  fs.readFile(file, function(err, data) {
    if(err) {
      console.error("error");
      res.statusCode = 500;
      res.end("Server Error");
      return;
    }
    res.setHeader('ContentType', type);
    res.end(data);
  });
}

/** @function handleRequest
 * Handles incoming http requests
 * @param {http.incomingRequest} req - the request object
 * @param {http.serverResponse} res - the response object
 */
function handleRequest(req, res) {

  // We start by creating an empty session
   req.session = {}

   // We need to determine if there is a logged-in user.
   // We'll check for a session cookie
   var cookie = req.headers.cookie;

   // First, we need to check to see if a cookie was even
   // sent to us.  The first time a client visits our site,
   // they will not have a cookie for it, because we haven't
   // sent them a set-cookie header in a response.  Also,
   // if they turn off cookies in thier browser, there will
   // be no cookies.

if(cookie) {
      // Since we have a cookie, we'll use our cookie-parser
      // library to parse it into an associative array (a map).
      var cookieMap = parseCookie(cookie);

      // To better protect against manipulation of the session
      // cookie, we encrypt it before sending it to the
      // client.  Therefore, the cookie they send back is
      // likewise encrypted, and must be decrypted before
      // we can make sense of it.
      var cryptedSession = cookieMap["cryptsession"];

      // There may not yet be a session
      if(cryptedSession) {
        // if there is, the session is encrypted, and must be decrypted
        var sessionData = encryption.decipher(cryptedSession);
        // further, it is in JSON form, so parse it and set the
        // req.session object to be its parsed value
        req.session = JSON.parse(sessionData);
      }
  }

  switch(req.url) {
    case '/':
    case '/login':
        if(req.method == 'GET') {
          // For GET requests, serve the login page
          fs.readFile('public/login.html', function(err, data){
            if(err){
            }
            res.setHeader("Content-Type", "text/html");
            res.end(data);
          });
        } else {
          // For POST requests, parse the urlencoded body
          urlencoded(req, res, function(req, res){
            var username = req.body.username;
            var password = req.body.password;
            // Evaluate the username/password
            if(username == 'simon' && password == 'simple'){
              // matching password & username - log the user in
              // by creating the session object
              var session = {username: username};
              // JSON encode the session object
              var sessionData = JSON.stringify(session);
              // Encrypt the session data
              var sessionCrypt = encryption.encipher(sessionData);
              // And send it to the client as a session cookie
              res.setHeader("Set-Cookie", ["cryptsession=" + sessionCrypt + "; session;"]);
              // Finally, redirect back to the index
              res.statusCode = 302;
              res.setHeader("Location", "/index.html");
              res.end();
            } else {
              // Not a username/password match, redirect to
              res.statusCode = 302;
              res.setHeader("Location", "/login");
              res.end();
            }
          });
        }
        break;
    case '/register.html':
      if (req.method == 'GET') {
        serveFile('public/register.html', 'text/html', req, res);
      }
      else if (req.method == 'POST') {
        //Create new user
      }
      break;
    case '/index.html':
      serveFile('public/index.html', 'text/html', req, res);
      break;
  //  case '/socket.io/socket.io.js':
  //      serverFile('');
    case '/login.css':
      serveFile('public/login.css', 'text/css', req, res);
      break;
    case '/style.css':
      serveFile('public/style.css', 'text/css', req, res);
      break;
    case '/script.js':
      serveFile('public/script.js', 'text/javascript', req, res);
      break;
    case '/indexStyle.css':
     serveFile('public/indexStyle.css', 'text/css', req, res);
     break;
    case '/indexScript.js':
     serveFile('public/indexScript.js', 'text/css', req, res);
     break;
     case '/chess_game.js':
      serveFile('public/chess_game.js',"text/js", req, res);
      break;
    default:
      res.statusCode = 404;
      res.end("Not found");
  }

}

//Start the server
server.listen(PORT, function(){
  console.log("Listening on port", PORT);
});
