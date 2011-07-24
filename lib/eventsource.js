var _currentStack = [];

function _enterFunction(supertrace, _this) {
  var stack = _currentStack.concat();
  stack._this = _this;
  try {
    throw new Error();
  } catch (err) {
    //skip error message and the line about _enterFunction
    stack.func = err.stack.split('\n')[2].replace(/^ +at /, '');
  }
  if (supertrace != null) {
    stack.supertrace = supertrace;
  }
  _currentStack.push(stack);
  return stack;
}

function _enterModule(name) {
  var stack = _currentStack.concat();
  stack.func = "Module '"+name+"'";
  stack.isModule = true;
  _currentStack.push(stack);
  return stack;
}

function _leaveFunction(trace) {
  if (trace != _currentStack.pop()) {
    console.error("left the wrong function!");
  }
}

function _enhanceError(err, stack) {
  //if (err.calltimeTraces == null) {
  //  err.calltimeTraces = [];
  //}
  //err.calltimeTraces.push(calltimeTrace);
  if (stack == null) {
    console.error('_enhanceError was called with a nully stack');
    return;
  }
  if (err.calltimeTrace == null) {
    err.calltimeTrace = stack;
  }
  return err;
}
/*
Interface.emit (events.js:64:17)
Array.sort (native)
[object Context]:1:9
*/


function parseStack(stack) {
  //stack is newline seperated
  stack = stack.split('\n');
  //first line is a message
  stack = stack.slice(1);
  
  var parsedStack = [];
  for (var i=0; i<stack.length; i++) {
    var line = stack[i];
    var lineObj = {};
    line = line.replace(/^ +at /, '');
    lineObj.data = line;
    if (line.indexOf('(native)') != -1) {
      lineObj.native = true;
    }
    parsedStack.push(line);
  }
  return parsedStack;
}

function indentAll(array, howmuch, color) {
  var spaces = "";
  for (var i=0; i<howmuch; i++) {
    spaces += " ";
  }
  if (color) {
    spaces = colorize(spaces, color);
  }
  for (i=0; i<array.length; i++) {
    array[i] = spaces + array[i];
  }
  return array;
}

function colorize (msg, color) {
  color = "31;40";
  return "\033["+color+"m"+msg+"\033[0m";
}

function collectTraceData(stack, knownStacks) {
  if (knownStacks.indexOf(stack) !== -1) {
    return ["[SEE "+knownStacks.indexOf(stack)+"]"];
  }
  
  var lines = [];
  
  //my name
  var myFunction = stack.func;
  lines.push("<"+knownStacks.length+"> "+myFunction);
  knownStacks.push(stack);
  
  //add this (if existent)
  if (stack._this != null && stack._this._trace != null) {
    var thistrace = stack._this._trace;
    if (thistrace !== stack) {
      lines = lines.concat(indentAll(collectTraceData(thistrace, knownStacks), 3, 'gray'));
    }
  }
  
  //add indented stacktrace of the parent
  if (stack.supertrace) {
    lines = lines.concat(indentAll(collectTraceData(stack.supertrace, knownStacks), 2));
  }
  
  //add stacktrace of the caller
  if (stack.length > 0 && !stack.isModule) {
    lines = lines.concat(collectTraceData(stack[stack.length-1], knownStacks));
  }
  return lines;
}

function formatError(err) {
  if (!err.stack) {
    return err;
  } else if (!err.calltimeTrace) {
    return err.stack;
  } else {
    return collectTraceData(err.calltimeTrace, []).join('\n');
  }
}

/*function handleUncaughtError(err) {
  if (!err.stack) {
    console.error(err);
  } else {
    if (err.calltimeTrace) {
      var stacktrace = collectErrorData(err);
    } else {
      console.error(err.stack);
    }
  }
}*/

if (!global._enterFunction) {
  global._enterFunction = _enterFunction;
  global._enterModule = _enterModule;
  global._leaveFunction = _leaveFunction;
  global._enhanceError = _enhanceError;
}

module.exports = {
  formatError: formatError
};
