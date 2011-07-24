var _trace0=_enterModule('stream.js');try {// Copyright Joyent, Inc. and other Node contributors.
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

var events = require('events');
var util = require('util');

function Stream() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  events.EventEmitter.call(this);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}}
util.inherits(Stream, events.EventEmitter);
exports.Stream = Stream;

Stream.prototype.pipe = function(dest, options) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var source = this;

  function ondata(chunk) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    if (dest.writable) {
      if (false === dest.write(chunk)) source.pause();
    }
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}}

  source.on('data', ondata);

  function ondrain() {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    if (source.readable) source.resume();
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}}

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once, and
  // only when all sources have ended.
  if (!options || options.end !== false) {
    dest._pipeCount = dest._pipeCount || 0;
    dest._pipeCount++;

    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    if (didOnEnd) return;
    didOnEnd = true;

    dest._pipeCount--;

    // remove the listeners
    cleanup();

    if (dest._pipeCount > 0) {
      // waiting for other incoming streams to end.
      return;
    }

    dest.end();
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}}


  function onclose() {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    if (didOnEnd) return;
    didOnEnd = true;

    dest._pipeCount--;

    // remove the listeners
    cleanup();

    if (dest._pipeCount > 0) {
      // waiting for other incoming streams to end.
      return;
    }

    dest.destroy();
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}}

  // don't leave dangling pipes when there are errors.
  function onerror(er) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    cleanup();
    if (this.listeners('error').length === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}}

  source.on('error', onerror);
  dest.on('error', onerror);

  // guarantee that source streams can be paused and resumed, even
  // if the only effect is to proxy the event back up the pipe chain.
  if (!source.pause) {
    source.pause = function() {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
      source.emit('pause');
    } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}};
  }

  if (!source.resume) {
    source.resume = function() {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
      source.emit('resume');
    } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}};
  }

  function onpause() {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    source.pause();
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}}

  dest.on('pause', onpause);

  function onresume() {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    if (source.readable) source.resume();
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}}

  dest.on('resume', onresume);

  // remove all the event listeners that were added.
  function cleanup() {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    dest.removeListener('pause', onpause);
    dest.removeListener('resume', onresume);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('end', cleanup);
    dest.removeListener('close', cleanup);
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}}

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('end', cleanup);
  dest.on('close', cleanup);

  dest.emit('pipe', source);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};
} catch (_err) { throw _enhanceError(_err, _trace0); } finally {_leaveFunction(_trace0);}