var _trace0=_enterModule('tty_win32.js');try {// Copyright Joyent, Inc. and other Node contributors.
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


var binding = process.binding('stdio'),
    Stream = require('stream').Stream,
    inherits = require('util').inherits,
    writeTTY = binding.writeTTY,
    closeTTY = binding.closeTTY;


function ReadStream(fd) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (!(this instanceof ReadStream)) return new ReadStream(fd);
  Stream.call(this);

  var self = this;
  this.fd = fd;
  this.paused = true;
  this.readable = true;

  var dataListeners = this.listeners('data'),
      dataUseString = false;

  function onError(err) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    self.emit('error', err);
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}}
  function onKeypress(char, key) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    self.emit('keypress', char, key);
    if (dataListeners.length && char) {
      self.emit('data', dataUseString ? char : new Buffer(char, 'utf-8'));
    }
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}}
  function onResize() {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    process.emit('SIGWINCH');
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}}

  // A windows console stream is always UTF-16, actually
  // So it makes no sense to set the encoding, however someone could call
  // setEncoding to tell us he wants strings not buffers
  this.setEncoding = function(encoding) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    dataUseString = !!encoding;
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}}

  binding.initTTYWatcher(fd, onError, onKeypress, onResize);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}}
inherits(ReadStream, Stream);
exports.ReadStream = ReadStream;

ReadStream.prototype.isTTY = true;

ReadStream.prototype.pause = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (this.paused)
    return;

  this.paused = true;
  binding.stopTTYWatcher();
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

ReadStream.prototype.resume = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (!this.readable)
    throw new Error('Cannot resume() closed tty.ReadStream.');
  if (!this.paused)
    return;

  this.paused = false;
  binding.startTTYWatcher();
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

ReadStream.prototype.destroy = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (!this.readable)
    return;

  this.readable = false;
  binding.destroyTTYWatcher();

  var self = this;
  process.nextTick(function() {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    try {
      closeTTY(self.fd);
      self.emit('close');
    } catch (err) {
      self.emit('error', err);
    }
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

ReadStream.prototype.destroySoon = ReadStream.prototype.destroy;


function WriteStream(fd) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (!(this instanceof WriteStream)) return new WriteStream(fd);
  Stream.call(this);

  var self = this;
  this.fd = fd;
  this.writable = true;
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}}
inherits(WriteStream, Stream);
exports.WriteStream = WriteStream;

WriteStream.prototype.isTTY = true;

WriteStream.prototype.write = function(data, encoding) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (!this.writable) {
    throw new Error('stream not writable');
  }

  if (Buffer.isBuffer(data)) {
    data = data.toString('utf-8');
  }

  try {
    writeTTY(this.fd, data);
  } catch (err) {
    this.emit('error', err);
  }
  return true;
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

WriteStream.prototype.end = function(data, encoding) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (data) {
    this.write(data, encoding);
  }
  this.destroy();
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

WriteStream.prototype.destroy = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (!this.writable)
    return;

  this.writable = false;

  var self = this;
  process.nextTick(function() {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    var closed = false;
    try {
      closeTTY(self.fd);
      closed = true;
    } catch (err) {
      self.emit('error', err);
    }
    if (closed) {
      self.emit('close');
    }
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

WriteStream.prototype.moveCursor = function(dx, dy) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (!this.writable)
    throw new Error('Stream not writable');

  binding.moveCursor(this.fd, dx, dy);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

WriteStream.prototype.cursorTo = function(x, y) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (!this.writable)
    throw new Error('Stream not writable');

  binding.cursorTo(this.fd, x, y);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

WriteStream.prototype.clearLine = function(direction) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (!this.writable)
    throw new Error('Stream not writable');

  binding.clearLine(this.fd, direction || 0);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};
} catch (_err) { throw _enhanceError(_err, _trace0); } finally {_leaveFunction(_trace0);}