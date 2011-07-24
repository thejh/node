var _trace0=_enterModule('_debugger.js');try {// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var net = require('net');
var readline = require('readline');
var inherits = require('util').inherits;
var spawn = require('child_process').spawn;

exports.port = 5858;

exports.start = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (process.argv.length < 3) {
    console.error('Usage: node debug script.js');
    process.exit(1);
  }

  var interface = new Interface();
  process.on('uncaughtException', function(e) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    console.error("There was an internal error in Node's debugger. " +
        'Please report this bug.');
    console.error(e.message);
    console.error(e.stack);
    if (interface.child) interface.child.kill();
    process.exit(1);
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


var args = process.argv.slice(2);
args.unshift('--debug-brk');



//
// Parser/Serializer for V8 debugger protocol
// http://code.google.com/p/v8/wiki/DebuggerProtocol
//
// Usage:
//    p = new Protocol();
//
//    p.onResponse = function(res) {
//      // do stuff with response from V8
//    };
//
//    socket.setEncoding('utf8');
//    socket.on('data', function(s) {
//      // Pass strings into the protocol
//      p.execute(s);
//    });
//
//
function Protocol() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  this._newRes();
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}}
exports.Protocol = Protocol;


Protocol.prototype._newRes = function(raw) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  this.res = { raw: raw || '', headers: {} };
  this.state = 'headers';
  this.reqSeq = 1;
  this.execute('');
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Protocol.prototype.execute = function(d) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var res = this.res;
  res.raw += d;

  switch (this.state) {
    case 'headers':
      var endHeaderIndex = res.raw.indexOf('\r\n\r\n');

      if (endHeaderIndex < 0) break;

      var lines = res.raw.slice(0, endHeaderIndex).split('\r\n');
      for (var i = 0; i < lines.length; i++) {
        var kv = lines[i].split(/: +/);
        res.headers[kv[0]] = kv[1];
      }

      this.contentLength = +res.headers['Content-Length'];
      this.bodyStartIndex = endHeaderIndex + 4;

      this.state = 'body';
      if (res.raw.length - this.bodyStartIndex < this.contentLength) break;
      // pass thru

    case 'body':
      if (res.raw.length - this.bodyStartIndex >= this.contentLength) {
        res.body =
            res.raw.slice(this.bodyStartIndex,
                          this.bodyStartIndex + this.contentLength);
        // JSON parse body?
        res.body = res.body.length ? JSON.parse(res.body) : {};

        // Done!
        this.onResponse(res);

        this._newRes(res.raw.slice(this.bodyStartIndex + this.contentLength));
      }
      break;

    default:
      throw new Error('Unknown state');
      break;
  }
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Protocol.prototype.serialize = function(req) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  req.type = 'request';
  req.seq = this.reqSeq++;
  var json = JSON.stringify(req);
  return 'Content-Length: ' + json.length + '\r\n\r\n' + json;
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


var NO_FRAME = -1;

function Client() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  net.Stream.call(this);
  var protocol = this.protocol = new Protocol(this);
  this._reqCallbacks = [];
  var socket = this;

  this.currentFrame = NO_FRAME;
  this.currentSourceLine = -1;
  this.currentSource = null;
  this.handles = {};
  this.scripts = {};

  // Note that 'Protocol' requires strings instead of Buffers.
  socket.setEncoding('utf8');
  socket.on('data', function(d) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    protocol.execute(d);
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});

  protocol.onResponse = this._onResponse.bind(this);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}}
inherits(Client, net.Stream);
exports.Client = Client;


Client.prototype._addHandle = function(desc) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (typeof desc != 'object' || typeof desc.handle != 'number') {
    return;
  }

  this.handles[desc.handle] = desc;

  if (desc.type == 'script') {
    this._addScript(desc);
  }
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


var natives = process.binding('natives');


Client.prototype._addScript = function(desc) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  this.scripts[desc.id] = desc;
  if (desc.name) {
    desc.isNative = (desc.name.replace('.js', '') in natives) ||
                    desc.name == 'node.js';
  }
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Client.prototype._removeScript = function(desc) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  this.scripts[desc.id] = undefined;
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Client.prototype._onResponse = function(res) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  for (var i = 0; i < this._reqCallbacks.length; i++) {
    var cb = this._reqCallbacks[i];
    if (this._reqCallbacks[i].request_seq == res.body.request_seq) break;
  }

  var self = this;
  var handled = false;

  if (res.headers.Type == 'connect') {
    // Request a list of scripts for our own storage.
    self.reqScripts();
    self.emit('ready');
    handled = true;

  } else if (res.body && res.body.event == 'break') {
    this.emit('break', res.body);
    handled = true;

  } else if (res.body && res.body.event == 'afterCompile') {
    this._addHandle(res.body.body.script);
    handled = true;

  } else if (res.body && res.body.event == 'scriptCollected') {
    // ???
    this._removeScript(res.body.body.script);
    handled = true;

  }

  if (cb) {
    this._reqCallbacks.splice(i, 1);
    handled = true;
    cb(res.body);
  }

  if (!handled) this.emit('unhandledResponse', res.body);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Client.prototype.req = function(req, cb) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  this.write(this.protocol.serialize(req));
  cb.request_seq = req.seq;
  this._reqCallbacks.push(cb);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Client.prototype.reqVersion = function(cb) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  this.req({ command: 'version' } , function(res) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    if (cb) cb(res.body.V8Version, res.running);
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Client.prototype.reqLookup = function(refs, cb) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var self = this;

  // TODO: We have a cache of handle's we've already seen in this.handles
  // This can be used if we're careful.
  var req = {
    command: 'lookup',
    arguments: {
      handles: refs
    }
  };

  this.req(req, function(res) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    if (res.success) {
      for (var ref in res.body) {
        if (typeof res.body[ref] == 'object') {
          self._addHandle(res.body[ref]);
        }
      }
    }

    if (cb) cb(res);
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

// This is like reqEval, except it will look up the expression in each of the
// scopes associated with the current frame.
Client.prototype.reqEval = function(expression, cb) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var self = this;

  if (this.currentFrame == NO_FRAME) {
    // Only need to eval in global scope.
    this.reqFrameEval(expression, NO_FRAME, cb);
    return;
  }

  // Otherwise we need to get the current frame to see which scopes it has.
  this.reqBacktrace(function(bt) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    if (!bt.frames) {
      // ??
      cb({});
      return;
    }

    var frame = bt.frames[self.currentFrame];

    var evalFrames = frame.scopes.map(function(s) {var _trace3=_enterFunction(_trace2, this);try {if (this&&!this._trace) {this._trace=_trace3;}
      if (!s) return;
      var x = bt.frames[s.index];
      if (!x) return;
      return x.index;
    } catch (_err) { throw _enhanceError(_err, _trace3); } finally {_leaveFunction(_trace3);}});

    self._reqFramesEval(expression, evalFrames, cb);
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


// Finds the first scope in the array in which the epxression evals.
Client.prototype._reqFramesEval = function(expression, evalFrames, cb) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (evalFrames.length == 0) {
    // Just eval in global scope.
    this.reqFrameEval(expression, NO_FRAME, cb);
    return;
  }

  var self = this;
  var i = evalFrames.shift();

  this.reqFrameEval(expression, i, function(res) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    if (res.success) {
      if (cb) cb(res);
    } else {
      self._reqFramesEval(expression, evalFrames, cb);
    }
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Client.prototype.reqFrameEval = function(expression, frame, cb) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var self = this;
  var req = {
    command: 'evaluate',
    arguments: { expression: expression }
  };

  if (frame == NO_FRAME) {
    req.arguments.global = true;
  } else {
    req.arguments.frame = frame;
  }

  this.req(req, function(res) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    if (res.success) {
      self._addHandle(res.body);
    }
    if (cb) cb(res);
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


// reqBacktrace(cb)
// TODO: from, to, bottom
Client.prototype.reqBacktrace = function(cb) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  this.req({ command: 'backtrace' } , function(res) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    if (cb) cb(res.body);
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


// Returns an array of objects like this:
//
//   { handle: 11,
//     type: 'script',
//     name: 'node.js',
//     id: 14,
//     lineOffset: 0,
//     columnOffset: 0,
//     lineCount: 562,
//     sourceStart: '(function(process) {\n\n  ',
//     sourceLength: 15939,
//     scriptType: 2,
//     compilationType: 0,
//     context: { ref: 10 },
//     text: 'node.js (lines: 562)' }
//
Client.prototype.reqScripts = function(cb) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var self = this;
  this.req({ command: 'scripts' } , function(res) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    for (var i = 0; i < res.body.length; i++) {
      self._addHandle(res.body[i]);
    }
    if (cb) cb();
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Client.prototype.reqContinue = function(cb) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  this.req({ command: 'continue' }, function(res) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    if (cb) cb(res);
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

Client.prototype.listbreakpoints = function(cb) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  this.req({ command: 'listbreakpoints' }, function(res) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    if (cb) cb(res);
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Client.prototype.reqSource = function(from, to, cb) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var req = {
    command: 'source',
    fromLine: from,
    toLine: to
  };

  this.req(req, function(res) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    if (cb) cb(res.body);
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


// client.next(1, cb);
Client.prototype.step = function(action, count, cb) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var req = {
    command: 'continue',
    arguments: { stepaction: action, stepcount: count }
  };

  this.req(req, function(res) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    if (cb) cb(res);
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Client.prototype.mirrorObject = function(handle, cb) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var self = this;

  if (handle.type == 'object') {
    // The handle looks something like this:
    // { handle: 8,
    //   type: 'object',
    //   className: 'Object',
    //   constructorFunction: { ref: 9 },
    //   protoObject: { ref: 4 },
    //   prototypeObject: { ref: 2 },
    //   properties: [ { name: 'hello', propertyType: 1, ref: 10 } ],
    //   text: '#<an Object>' }

    // For now ignore the className and constructor and prototype.
    // TJ's method of object inspection would probably be good for this:
    // https://groups.google.com/forum/?pli=1#!topic/nodejs-dev/4gkWBOimiOg

    var propertyRefs = handle.properties.map(function(p) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
      return p.ref;
    } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});

    this.reqLookup(propertyRefs, function(res) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
      if (!res.success) {
        console.error('problem with reqLookup');
        if (cb) cb(handle);
        return;
      }

      var mirror;
      if (handle.className == 'Array') {
        mirror = [];
      } else {
        mirror = {};
      }

      for (var i = 0; i < handle.properties.length; i++) {
        var value = res.body[handle.properties[i].ref];
        var mirrorValue;
        if (value) {
          mirrorValue = value.value ? value.value : value.text;
        } else {
          mirrorValue = '[?]';
        }


        if (Array.isArray(mirror) &&
            typeof handle.properties[i].name != 'number') {
          // Skip the 'length' property.
          continue;
        }

        mirror[handle.properties[i].name] = mirrorValue;
      }

      if (cb) cb(mirror);
    } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});

  } else if (handle.value) {
    process.nextTick(function() {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
      cb(handle.value);
    } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});

  } else {
    process.nextTick(function() {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
      cb(handle);
    } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});
  }
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Client.prototype.fullTrace = function(cb) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var self = this;

  this.reqBacktrace(function(trace) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    var refs = [];

    for (var i = 0; i < trace.frames.length; i++) {
      var frame = trace.frames[i];
      // looks like this:
      // { type: 'frame',
      //   index: 0,
      //   receiver: { ref: 1 },
      //   func: { ref: 0 },
      //   script: { ref: 7 },
      //   constructCall: false,
      //   atReturn: false,
      //   debuggerFrame: false,
      //   arguments: [],
      //   locals: [],
      //   position: 160,
      //   line: 7,
      //   column: 2,
      //   sourceLineText: '  debugger;',
      //   scopes: [ { type: 1, index: 0 }, { type: 0, index: 1 } ],
      //   text: '#00 blah() /home/ryan/projects/node/test-debug.js l...' }
      refs.push(frame.script.ref);
      refs.push(frame.func.ref);
      refs.push(frame.receiver.ref);
    }

    self.reqLookup(refs, function(res) {var _trace3=_enterFunction(_trace2, this);try {if (this&&!this._trace) {this._trace=_trace3;}
      for (var i = 0; i < trace.frames.length; i++) {
        var frame = trace.frames[i];
        frame.script = res.body[frame.script.ref];
        frame.func = res.body[frame.func.ref];
        frame.receiver = res.body[frame.receiver.ref];
      }

      if (cb) cb(trace);
    } catch (_err) { throw _enhanceError(_err, _trace3); } finally {_leaveFunction(_trace3);}});
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};






var commands = [
  'backtrace',
  'continue',
  'help',
  'info breakpoints',
  'kill',
  'list',
  'next',
  'print',
  'quit',
  'run',
  'scripts',
  'step',
  'version'
];


var helpMessage = 'Commands: ' + commands.join(', ');


function SourceUnderline(sourceText, position) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (!sourceText) return;

  // Create an underline with a caret pointing to the source position. If the
  // source contains a tab character the underline will have a tab character in
  // the same place otherwise the underline will have a space character.
  var underline = '';
  for (var i = 0; i < position; i++) {
    if (sourceText[i] == '\t') {
      underline += '\t';
    } else {
      underline += ' ';
    }
  }
  underline += '^';

  // Return the source line text with the underline beneath.
  return sourceText + '\n' + underline;
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}}


function SourceInfo(body) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var result = '';

  if (body.script) {
    if (body.script.name) {
      result += body.script.name;
    } else {
      result += '[unnamed]';
    }
  }
  result += ':';
  result += body.sourceLine + 1;

  return result;
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}}


// This class is the readline-enabled debugger interface which is invoked on
// "node debug"
function Interface() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var self = this;
  var child;
  var client;

  function complete(line) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    return self.complete(line);
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}}

  var term = readline.createInterface(process.stdin, process.stdout, complete);
  this.term = term;

  process.on('exit', function() {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    self.killChild();
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});

  this.stdin = process.openStdin();

  term.setPrompt('debug> ');
  term.prompt();

  this.quitting = false;

  process.on('SIGINT', function() {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    self.handleSIGINT();
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});

  term.on('SIGINT', function() {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    self.handleSIGINT();
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});

  term.on('attemptClose', function() {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    self.tryQuit();
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});

  term.on('line', function(cmd) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    // trim whitespace
    cmd = cmd.replace(/^\s*/, '').replace(/\s*$/, '');

    if (cmd.length) {
      self._lastCommand = cmd;
      self.handleCommand(cmd);
    } else {
      self.handleCommand(self._lastCommand);
    }
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}}


Interface.prototype.complete = function(line) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  // Match me with a command.
  var matches = [];
  // Remove leading whitespace
  line = line.replace(/^\s*/, '');

  for (var i = 0; i < commands.length; i++) {
    if (commands[i].indexOf(line) === 0) {
      matches.push(commands[i]);
    }
  }

  return [matches, line];
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Interface.prototype.handleSIGINT = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (this.paused) {
    this.child.kill('SIGINT');
  } else {
    this.tryQuit();
  }
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Interface.prototype.quit = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (this.quitting) return;
  this.quitting = true;
  this.killChild();
  this.term.close();
  process.exit(0);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Interface.prototype.tryQuit = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var self = this;

  if (self.child) {
    self.quitQuestion(function(yes) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
      if (yes) {
        self.quit();
      } else {
        self.term.prompt();
      }
    } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});
  } else {
    self.quit();
  }
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Interface.prototype.pause = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  this.paused = true;
  this.stdin.pause();
  this.term.pause();
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Interface.prototype.resume = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (!this.paused) return false;
  this.paused = false;
  this.stdin.resume();
  this.term.resume();
  this.term.prompt();
  return true;
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Interface.prototype.handleBreak = function(r) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var result = '';
  if (r.breakpoints) {
    result += 'breakpoint';
    if (r.breakpoints.length > 1) {
      result += 's';
    }
    result += ' #';
    for (var i = 0; i < r.breakpoints.length; i++) {
      if (i > 0) {
        result += ', #';
      }
      result += r.breakpoints[i];
    }
  } else {
    result += 'break';
  }
  result += ' in ';
  result += r.invocationText;
  result += ', ';
  result += SourceInfo(r);
  result += '\n';
  result += SourceUnderline(r.sourceLineText, r.sourceColumn);

  this.client.currentSourceLine = r.sourceLine;
  this.client.currentFrame = 0;
  this.client.currentScript = r.script.name;

  console.log(result);

  if (!this.resume()) this.term.prompt();
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


function intChars(n) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  // TODO dumb:
  if (n < 50) {
    return 2;
  } else if (n < 950) {
    return 3;
  } else if (n < 9950) {
    return 4;
  } else {
    return 5;
  }
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}}


function leftPad(n) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var s = n.toString();
  var nchars = intChars(n);
  var nspaces = nchars - s.length;
  for (var i = 0; i < nspaces; i++) {
    s = ' ' + s;
  }
  return s;
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}}


Interface.prototype.handleCommand = function(cmd) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var self = this;

  var client = this.client;
  var term = this.term;

  if (cmd == 'quit' || cmd == 'q' || cmd == 'exit') {
    self._lastCommand = null;
    self.tryQuit();

  } else if (/^r(un)?$/.test(cmd)) {
    self._lastCommand = null;
    if (self.child) {
      self.restartQuestion(function(yes) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
        if (!yes) {
          self._lastCommand = null;
          term.prompt();
        } else {
          console.log('restarting...');
          self.killChild();
          // XXX need to wait a little bit for the restart to work?
          setTimeout(function() {var _trace3=_enterFunction(_trace2, this);try {if (this&&!this._trace) {this._trace=_trace3;}
            self.trySpawn();
          } catch (_err) { throw _enhanceError(_err, _trace3); } finally {_leaveFunction(_trace3);}}, 1000);
        }
      } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});
    } else {
      self.trySpawn();
    }

  } else if (/^help$/.test(cmd)) {
    console.log(helpMessage);
    term.prompt();

  } else if ('version' == cmd) {
    if (!client) {
      self.printNotConnected();
      return;
    }
    client.reqVersion(function(v) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
      console.log(v);
      term.prompt();
    } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});

  } else if (/^info(\s+breakpoint)?$/.test(cmd)) {
    if (!client) {
      self.printNotConnected();
      return;
    }
    client.listbreakpoints(function(res) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
      console.log(res);
      term.prompt();
    } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});


  } else if ('l' == cmd || 'list' == cmd) {
    if (!client) {
      self.printNotConnected();
      return;
    }

    var from = client.currentSourceLine - 5;
    var to = client.currentSourceLine + 5;

    client.reqSource(from, to, function(res) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
      var lines = res.source.split('\n');
      for (var i = 0; i < lines.length; i++) {
        var lineno = res.fromLine + i + 1;
        if (lineno < from || lineno > to) continue;

        if (lineno == 1) {
          // The first line needs to have the module wrapper filtered out of
          // it.
          var wrapper = require('module').wrapper[0];
          lines[i] = lines[i].slice(wrapper.length);
        }

        if (lineno == 1 + client.currentSourceLine) {
          var nchars = intChars(lineno);
          var pointer = '';
          for (var j = 0; j < nchars - 1; j++) {
            pointer += '=';
          }
          pointer += '>';
          console.log(pointer + ' ' + lines[i]);
        } else {
          console.log(leftPad(lineno) + ' ' + lines[i]);
        }
      }
      term.prompt();
    } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});

  } else if (/^b(ack)?t(race)?$/.test(cmd)) {
    if (!client) {
      self.printNotConnected();
      return;
    }

    client.fullTrace(function(bt) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
      if (bt.totalFrames == 0) {
        console.log('(empty stack)');
      } else {
        var text = '';
        var firstFrameNative = bt.frames[0].script.isNative;
        for (var i = 0; i < bt.frames.length; i++) {
          var frame = bt.frames[i];
          if (!firstFrameNative && frame.script.isNative) break;

          text += '#' + i + ' ';
          if (frame.func.inferredName && frame.func.inferredName.length > 0) {
            text += frame.func.inferredName + ' ';
          }
          text += require('path').basename(frame.script.name) + ':';
          text += (frame.line + 1) + ':' + (frame.column + 1);
          text += '\n';
        }

        console.log(text);
      }
      term.prompt();
    } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});

  } else if (cmd == 'scripts' || cmd == 'scripts full') {
    if (!client) {
      self.printNotConnected();
      return;
    }
    self.printScripts(cmd.indexOf('full') > 0);
    term.prompt();

  } else if (/^c(ontinue)?$/.test(cmd)) {
    if (!client) {
      self.printNotConnected();
      return;
    }

    self.pause();
    client.reqContinue(function() {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
      self.resume();
    } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});

  } else if (/^k(ill)?$/.test(cmd)) {
    if (!client) {
      self.printNotConnected();
      return;
    }
    // kill
    if (self.child) {
      self.killQuestion(function(yes) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
        if (yes) {
          self.killChild();
        } else {
          self._lastCommand = null;
        }
      } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});
    } else {
      self.term.prompt();
    }

  } else if (/^n(ext)?$/.test(cmd)) {
    if (!client) {
      self.printNotConnected();
      return;
    }
    client.step('next', 1, function(res) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
      // Wait for break point. (disable raw mode?)
    } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});

  } else if (/^s(tep)?$/.test(cmd)) {
    if (!client) {
      self.printNotConnected();
      return;
    }
    client.step('in', 1, function(res) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
      // Wait for break point. (disable raw mode?)
    } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});

  } else if (/^p(rint)?$/.test(cmd)) {
    if (!client) {
      self.printNotConnected();
      return;
    }
    var i = cmd.indexOf(' ');
    if (i < 0) {
      console.log('print [expression]');
      term.prompt();
    } else {
      cmd = cmd.slice(i);
      client.reqEval(cmd, function(res) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
        if (!res.success) {
          console.log(res.message);
          term.prompt();
          return;
        }

        client.mirrorObject(res.body, function(mirror) {var _trace3=_enterFunction(_trace2, this);try {if (this&&!this._trace) {this._trace=_trace3;}
          console.log(mirror);
          term.prompt();
        } catch (_err) { throw _enhanceError(_err, _trace3); } finally {_leaveFunction(_trace3);}});
      } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});
    }

  } else {
    if (!/^\s*$/.test(cmd)) {
      // If it's not all white-space print this error message.
      console.log('Unknown command "%s". Try "help"', cmd);
    }
    term.prompt();
  }
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};



Interface.prototype.yesNoQuestion = function(prompt, cb) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var self = this;
  self.resume();
  this.term.question(prompt, function(answer) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    if (/^y(es)?$/i.test(answer)) {
      cb(true);
    } else if (/^n(o)?$/i.test(answer)) {
      cb(false);
    } else {
      console.log('Please answer y or n.');
      self.restartQuestion(cb);
    }
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Interface.prototype.restartQuestion = function(cb) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  this.yesNoQuestion('The program being debugged has been started already.\n' +
                     'Start it from the beginning? (y or n) ', cb);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Interface.prototype.killQuestion = function(cb) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  this.yesNoQuestion('Kill the program being debugged? (y or n) ', cb);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Interface.prototype.quitQuestion = function(cb) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  this.yesNoQuestion('A debugging session is active. Quit anyway? (y or n) ',
                     cb);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Interface.prototype.killChild = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (this.child) {
    this.child.kill();
    this.child = null;
  }

  if (this.client) {
    this.client.destroy();
    this.client = null;
  }

  this.resume();
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Interface.prototype.trySpawn = function(cb) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var self = this;

  this.killChild();

  this.child = spawn(process.execPath, args, { customFds: [0, 1, 2] });


  this.pause();

  var client = self.client = new Client();
  var connectionAttempts = 0;

  client.once('ready', function() {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    process.stdout.write(' ok\r\n');

    // since we did debug-brk, we're hitting a break point immediately
    // continue before anything else.
    client.reqContinue(function() {var _trace3=_enterFunction(_trace2, this);try {if (this&&!this._trace) {this._trace=_trace3;}
      if (cb) cb();
    } catch (_err) { throw _enhanceError(_err, _trace3); } finally {_leaveFunction(_trace3);}});

    client.on('close', function() {var _trace3=_enterFunction(_trace2, this);try {if (this&&!this._trace) {this._trace=_trace3;}
      console.log('\nprogram terminated');
      self.client = null;
      self.killChild();
      if (!self.quitting) self.term.prompt();
    } catch (_err) { throw _enhanceError(_err, _trace3); } finally {_leaveFunction(_trace3);}});
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});

  client.on('unhandledResponse', function(res) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    console.log('\r\nunhandled res:');
    console.log(res);
    self.term.prompt();
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});

  client.on('break', function(res) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    self.handleBreak(res.body);
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});

  client.on('error', connectError);
  function connectError() {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    // If it's failed to connect 4 times then don't catch the next error
    if (connectionAttempts >= 4) {
      client.removeListener('error', connectError);
    }
    setTimeout(attemptConnect, 50);
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}}

  function attemptConnect() {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    ++connectionAttempts;
    process.stdout.write('.');
    client.connect(exports.port);
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}}

  setTimeout(function() {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    process.stdout.write('connecting..');
    attemptConnect();
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}}, 50);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Interface.prototype.printNotConnected = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  console.log("Program not running. Try 'run'.");
  this.term.prompt();
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


// argument full tells if it should display internal node scripts or not
Interface.prototype.printScripts = function(displayNatives) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var client = this.client;
  var text = '';
  for (var id in client.scripts) {
    var script = client.scripts[id];
    if (typeof script == 'object' && script.name) {
      if (displayNatives ||
          script.name == client.currentScript ||
          !script.isNative) {
        text += script.name == client.currentScript ? '* ' : '  ';
        text += require('path').basename(script.name) + '\n';
      }
    }
  }
  process.stdout.write(text);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};



} catch (_err) { throw _enhanceError(_err, _trace0); } finally {_leaveFunction(_trace0);}