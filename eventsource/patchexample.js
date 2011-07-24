var baz;
function foo() {
  function bar() {
    throw "oops";
  }
  baz = bar;
}
foo();
baz();


var _trace0 = _enterFunction(); try {
var baz;
function foo() { var _trace1 = _enterFunction(_trace0); try {
  function bar() { var _trace2 = _enterFunction(_trace1); try {
    throw "oops";
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}}
  baz = bar;
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}}
foo();
baz();
} catch (_err) { throw _enhanceError(_err, _trace0); } finally {_leaveFunction(_trace0);}}

/*

enter base
enter foo, parent: base
leave foo
enter baz/bar, parent: foo
throw "oops"

stack trace:
baz/bar     _trace2
  foo       _trace1
    base    _trace0
  base      _trace1
base        _trace2

stacktrace creation:
throw "oops";
throw _enhanceError(_err, _trace2);
_leaveFunction(_trace2);
throw _enhanceError(_err, _trace1);
_leaveFunction(_trace1);
throw _enhanceError(_err, _trace0);
_leaveFunction(_trace0);

*/
