var formatError = require('eventsource').formatError;

process.on('uncaughtException', function (err) {
  console.error('uncaughtException');
  console.error(formatError(err));
  console.error('=========================');
});

function test() {
  var baz;
  function foo() {
    function bar() {
      throw new Error("test error");
    }
    baz = bar;
  }
  foo();
  baz();
}

test();
