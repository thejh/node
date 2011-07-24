var formatError = require('eventsource').formatError;

process.on('uncaughtException', function (err) {
  console.error(formatError(err));
});

var http = require('http');
var options = {
  host: 'localhost',
  port: 1,
  path: '/index.html'
};

http.get(options, function(res) {
  console.log("Oops, actually, I didn't want a response.");
});
