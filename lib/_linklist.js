var _trace0=_enterModule('_linklist.js');try {// Copyright Joyent, Inc. and other Node contributors.
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

function init(list) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  list._idleNext = list;
  list._idlePrev = list;
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}}
exports.init = init;


// show the most idle item
function peek(list) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (list._idlePrev == list) return null;
  return list._idlePrev;
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}}
exports.peek = peek;


// remove the most idle item from the list
function shift(list) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var first = list._idlePrev;
  remove(first);
  return first;
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}}
exports.shift = shift;


// remove a item from its list
function remove(item) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (item._idleNext) {
    item._idleNext._idlePrev = item._idlePrev;
  }

  if (item._idlePrev) {
    item._idlePrev._idleNext = item._idleNext;
  }

  item._idleNext = null;
  item._idlePrev = null;
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}}
exports.remove = remove;


// remove a item from its list and place at the end.
function append(list, item) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  remove(item);
  item._idleNext = list._idleNext;
  list._idleNext._idlePrev = item;
  item._idlePrev = list;
  list._idleNext = item;
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}}
exports.append = append;


function isEmpty(list) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  return list._idleNext === list;
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}}
exports.isEmpty = isEmpty;
} catch (_err) { throw _enhanceError(_err, _trace0); } finally {_leaveFunction(_trace0);}