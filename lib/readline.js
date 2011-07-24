var _trace0=_enterModule('readline.js');try {// Copyright Joyent, Inc. and other Node contributors.
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

// Inspiration for this code comes from Salvatore Sanfilippo's linenoise.
// http://github.com/antirez/linenoise
// Reference:
// * http://invisible-island.net/xterm/ctlseqs/ctlseqs.html
// * http://www.3waylabs.com/nw/WWW/products/wizcon/vt220.html

var kHistorySize = 30;
var kBufSize = 10 * 1024;

var util = require('util');
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var tty = require('tty');


exports.createInterface = function(input, output, completer) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  return new Interface(input, output, completer);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


function Interface(input, output, completer) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (!(this instanceof Interface)) {
    return new Interface(input, output, completer);
  }
  EventEmitter.call(this);

  var self = this;

  this.output = output;
  this.input = input;
  input.resume();

  this.completer = completer;

  this.setPrompt('> ');

  this.enabled = output.isTTY;

  if (parseInt(process.env['NODE_NO_READLINE'], 10)) {
    this.enabled = false;
  }

  if (!this.enabled) {
    input.on('data', function(data) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
      self._normalWrite(data);
    } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});

  } else {

    // input usually refers to stdin
    input.on('keypress', function(s, key) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
      self._ttyWrite(s, key);
    } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});

    // Current line
    this.line = '';

    // Check process.env.TERM ?
    tty.setRawMode(true);
    this.enabled = true;

    // Cursor position on the line.
    this.cursor = 0;

    this.history = [];
    this.historyIndex = -1;

    var winSize = tty.getWindowSize(output.fd);
    exports.columns = winSize[1];

    if (process.listeners('SIGWINCH').length === 0) {
      process.on('SIGWINCH', function() {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
        var winSize = tty.getWindowSize(output.fd);
        exports.columns = winSize[1];
      } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});
    }
  }
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}}

inherits(Interface, EventEmitter);

Interface.prototype.__defineGetter__('columns', function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  return exports.columns;
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}});

Interface.prototype.setPrompt = function(prompt, length) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  this._prompt = prompt;
  if (length) {
    this._promptLength = length;
  } else {
    var lines = prompt.split(/[\r\n]/);
    var lastLine = lines[lines.length - 1];
    this._promptLength = Buffer.byteLength(lastLine);
  }
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Interface.prototype.prompt = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (this.enabled) {
    this.cursor = 0;
    this._refreshLine();
  } else {
    this.output.write(this._prompt);
  }
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Interface.prototype.question = function(query, cb) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (cb) {
    this.resume();
    if (this._questionCallback) {
      this.output.write('\n');
      this.prompt();
    } else {
      this._oldPrompt = this._prompt;
      this.setPrompt(query);
      this._questionCallback = cb;
      this.output.write('\n');
      this.prompt();
    }
  }
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Interface.prototype._onLine = function(line) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (this._questionCallback) {
    var cb = this._questionCallback;
    this._questionCallback = null;
    this.setPrompt(this._oldPrompt);
    cb(line);
  } else {
    this.emit('line', line);
  }
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Interface.prototype._addHistory = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (this.line.length === 0) return '';

  this.history.unshift(this.line);
  this.line = '';
  this.historyIndex = -1;

  this.cursor = 0;

  // Only store so many
  if (this.history.length > kHistorySize) this.history.pop();

  return this.history[0];
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Interface.prototype._refreshLine = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (this._closed) return;

  // Cursor to left edge.
  this.output.cursorTo(0);

  // Write the prompt and the current buffer content.
  this.output.write(this._prompt);
  this.output.write(this.line);

  // Erase to right.
  this.output.clearLine(1);

  // Move cursor to original position.
  this.output.cursorTo(this._promptLength + this.cursor);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Interface.prototype.close = function(d) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (this._closing) return;
  this._closing = true;
  if (this.enabled) {
    tty.setRawMode(false);
  }
  this.emit('close');
  this._closed = true;
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Interface.prototype.pause = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (this.enabled) {
    tty.setRawMode(false);
  }
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Interface.prototype.resume = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (this.enabled) {
    tty.setRawMode(true);
  }
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Interface.prototype.write = function(d, key) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (this._closed) return;
  this.enabled ? this._ttyWrite(d, key) : this._normalWrite(d, key);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Interface.prototype._normalWrite = function(b) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  // Very simple implementation right now. Should try to break on
  // new lines.
  if (b !== undefined)
    this._onLine(b.toString());
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

Interface.prototype._insertString = function(c) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  //BUG: Problem when adding tabs with following content.
  //     Perhaps the bug is in _refreshLine(). Not sure.
  //     A hack would be to insert spaces instead of literal '\t'.
  if (this.cursor < this.line.length) {
    var beg = this.line.slice(0, this.cursor);
    var end = this.line.slice(this.cursor, this.line.length);
    this.line = beg + c + end;
    this.cursor += c.length;
    this._refreshLine();
  } else {
    this.line += c;
    this.cursor += c.length;
    this.output.write(c);
  }
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

Interface.prototype._tabComplete = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var self = this;

  var rv = this.completer(self.line.slice(0, self.cursor));
  var completions = rv[0],
      completeOn = rv[1];  // the text that was completed
  if (completions && completions.length) {
    // Apply/show completions.
    if (completions.length === 1) {
      self._insertString(completions[0].slice(completeOn.length));
      self._refreshLine();
    } else {
      self.output.write('\r\n');
      var width = completions.reduce(function(a, b) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
        return a.length > b.length ? a : b;
      } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}}).length + 2;  // 2 space padding
      var maxColumns = Math.floor(this.columns / width) || 1;

      function handleGroup(group) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
        if (group.length == 0) {
          return;
        }
        var minRows = Math.ceil(group.length / maxColumns);
        for (var row = 0; row < minRows; row++) {
          for (var col = 0; col < maxColumns; col++) {
            var idx = row * maxColumns + col;
            if (idx >= group.length) {
              break;
            }
            var item = group[idx];
            self.output.write(item);
            if (col < maxColumns - 1) {
              for (var s = 0, itemLen = item.length; s < width - itemLen; s++) {
                self.output.write(' ');
              }
            }
          }
          self.output.write('\r\n');
        }
        self.output.write('\r\n');
      } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}}

      var group = [], c;
      for (var i = 0, compLen = completions.length; i < compLen; i++) {
        c = completions[i];
        if (c === '') {
          handleGroup(group);
          group = [];
        } else {
          group.push(c);
        }
      }
      handleGroup(group);

      // If there is a common prefix to all matches, then apply that
      // portion.
      var f = completions.filter(function(e) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;} if (e) return e; } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});
      var prefix = commonPrefix(f);
      if (prefix.length > completeOn.length) {
        self._insertString(prefix.slice(completeOn.length));
      }

      self._refreshLine();
    }
  }
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


function commonPrefix(strings) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (!strings || strings.length == 0) {
    return '';
  }
  var sorted = strings.slice().sort();
  var min = sorted[0];
  var max = sorted[sorted.length - 1];
  for (var i = 0, len = min.length; i < len; i++) {
    if (min[i] != max[i]) {
      return min.slice(0, i);
    }
  }
  return min;
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}}


Interface.prototype._wordLeft = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (this.cursor > 0) {
    var leading = this.line.slice(0, this.cursor);
    var match = leading.match(/([^\w\s]+|\w+|)\s*$/);
    this.cursor -= match[0].length;
    this._refreshLine();
  }
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}}


Interface.prototype._wordRight = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (this.cursor < this.line.length) {
    var trailing = this.line.slice(this.cursor);
    var match = trailing.match(/^(\s+|\W+|\w+)\s*/);
    this.cursor += match[0].length;
    this._refreshLine();
  }
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}}


Interface.prototype._deleteLeft = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (this.cursor > 0 && this.line.length > 0) {
    this.line = this.line.slice(0, this.cursor - 1) +
                this.line.slice(this.cursor, this.line.length);

    this.cursor--;
    this._refreshLine();
  }
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Interface.prototype._deleteRight = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  this.line = this.line.slice(0, this.cursor) +
              this.line.slice(this.cursor + 1, this.line.length);
  this._refreshLine();
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Interface.prototype._deleteWordLeft = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (this.cursor > 0) {
    var leading = this.line.slice(0, this.cursor);
    var match = leading.match(/([^\w\s]+|\w+|)\s*$/);
    leading = leading.slice(0, leading.length - match[0].length);
    this.line = leading + this.line.slice(this.cursor, this.line.length);
    this.cursor = leading.length;
    this._refreshLine();
  }
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}}


Interface.prototype._deleteWordRight = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (this.cursor < this.line.length) {
    var trailing = this.line.slice(this.cursor);
    var match = trailing.match(/^(\s+|\W+|\w+)\s*/);
    this.line = this.line.slice(0, this.cursor) +
                trailing.slice(match[0].length);
    this._refreshLine();
  }
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}}


Interface.prototype._deleteLineLeft = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  this.line = this.line.slice(this.cursor);
  this.cursor = 0;
  this._refreshLine();
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}}


Interface.prototype._deleteLineRight = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  this.line = this.line.slice(0, this.cursor);
  this._refreshLine();
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}}


Interface.prototype._line = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var line = this._addHistory();
  this.output.write('\r\n');
  this._onLine(line);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Interface.prototype._historyNext = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (this.historyIndex > 0) {
    this.historyIndex--;
    this.line = this.history[this.historyIndex];
    this.cursor = this.line.length; // set cursor to end of line.
    this._refreshLine();

  } else if (this.historyIndex === 0) {
    this.historyIndex = -1;
    this.cursor = 0;
    this.line = '';
    this._refreshLine();
  }
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Interface.prototype._historyPrev = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (this.historyIndex + 1 < this.history.length) {
    this.historyIndex++;
    this.line = this.history[this.historyIndex];
    this.cursor = this.line.length; // set cursor to end of line.

    this._refreshLine();
  }
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


Interface.prototype._attemptClose = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (this.listeners('attemptClose').length) {
    // User is to call interface.close() manually.
    this.emit('attemptClose');
  } else {
    this.close();
  }
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


// handle a write from the tty
Interface.prototype._ttyWrite = function(s, key) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var next_word, next_non_word, previous_word, previous_non_word;
  key = key || {};

  if (key.ctrl && key.shift) {
    /* Control and shift pressed */
    switch (key.name) {
      case "backspace":
        this._deleteLineLeft();
        break;

      case "delete":
        this._deleteLineRight();
        break;
    }

  } else if (key.ctrl) {
    /* Control key pressed */

    switch (key.name) {
      case 'c':
        if (this.listeners('SIGINT').length) {
          this.emit('SIGINT');
        } else {
          // default behavior, end the readline
          this._attemptClose();
        }
        break;

      case 'h': // delete left
        this._deleteLeft();
        break;

      case 'd': // delete right or EOF
        if (this.cursor === 0 && this.line.length === 0) {
          this._attemptClose();
        } else if (this.cursor < this.line.length) {
          this._deleteRight();
        }
        break;

      case 'u': // delete the whole line
        this.cursor = 0;
        this.line = '';
        this._refreshLine();
        break;

      case 'k': // delete from current to end of line
        this._deleteLineRight();
        break;

      case 'a': // go to the start of the line
        this.cursor = 0;
        this._refreshLine();
        break;

      case 'e': // go to the end of the line
        this.cursor = this.line.length;
        this._refreshLine();
        break;

      case 'b': // back one character
        if (this.cursor > 0) {
          this.cursor--;
          this._refreshLine();
        }
        break;

      case 'f': // forward one character
        if (this.cursor != this.line.length) {
          this.cursor++;
          this._refreshLine();
        }
        break;

      case 'n': // next history item
        this._historyNext();
        break;

      case 'p': // previous history item
        this._historyPrev();
        break;

      case 'z':
        process.kill(process.pid, 'SIGTSTP');
        return;

      case 'w': // delete backwards to a word boundary
      case 'backspace':
        this._deleteWordLeft();
        break;

      case 'delete': // delete forward to a word boundary
        this._deleteWordRight();
        break;

      case 'backspace':
        this._deleteWordLeft();
        break;

      case 'left':
        this._wordLeft();
        break;

      case 'right':
        this._wordRight();
    }

  } else if (key.meta) {
    /* Meta key pressed */

    switch (key.name) {
      case 'b': // backward word
        this._wordLeft();
        break;

      case 'f': // forward word
        this._wordRight();
        break;

      case 'd': // delete forward word
      case 'delete':
        this._deleteWordRight();
        break;

      case 'backspace': // delete backwards to a word boundary
        this._deleteWordLeft();
        break;
    }

  } else {
    /* No modifier keys used */

    switch (key.name) {
      case 'enter':
        this._line();
        break;

      case 'backspace':
        this._deleteLeft();
        break;

      case 'delete':
        this._deleteRight();
        break;

      case 'tab': // tab completion
        if (this.completer) {
          this._tabComplete();
        }
        break;

      case 'left':
        if (this.cursor > 0) {
          this.cursor--;
          this.output.moveCursor(-1, 0);
        }
        break;

      case 'right':
        if (this.cursor != this.line.length) {
          this.cursor++;
          this.output.moveCursor(1, 0);
        }
        break;

      case 'home':
        this.cursor = 0;
        this._refreshLine();
        break;

      case 'end':
        this.cursor = this.line.length;
        this._refreshLine();
        break;

      case 'up':
        this._historyPrev();
        break;

      case 'down':
        this._historyNext();
        break;

      default:
        if (Buffer.isBuffer(s))
          s = s.toString('utf-8');

        if (s) {
          var lines = s.split(/\r\n|\n|\r/);
          for (var i = 0, len = lines.length; i < len; i++) {
            if (i > 0) {
              this._line();
            }
            this._insertString(lines[i]);
          }
        }
    }
  }
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


exports.Interface = Interface;
} catch (_err) { throw _enhanceError(_err, _trace0); } finally {_leaveFunction(_trace0);}