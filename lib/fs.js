var _trace0=_enterModule('fs.js');try {// Copyright Joyent, Inc. and other Node contributors.
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

var util = require('util');

var binding = process.binding('fs');
var constants = process.binding('constants');
var fs = exports;
var Stream = require('stream').Stream;

var kMinPoolSpace = 128;
var kPoolSize = 40 * 1024;

fs.Stats = binding.Stats;

fs.Stats.prototype._checkModeProperty = function(property) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  return ((this.mode & constants.S_IFMT) === property);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.Stats.prototype.isDirectory = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  return this._checkModeProperty(constants.S_IFDIR);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.Stats.prototype.isFile = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  return this._checkModeProperty(constants.S_IFREG);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.Stats.prototype.isBlockDevice = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  return this._checkModeProperty(constants.S_IFBLK);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.Stats.prototype.isCharacterDevice = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  return this._checkModeProperty(constants.S_IFCHR);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.Stats.prototype.isSymbolicLink = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  return this._checkModeProperty(constants.S_IFLNK);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.Stats.prototype.isFIFO = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  return this._checkModeProperty(constants.S_IFIFO);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.Stats.prototype.isSocket = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  return this._checkModeProperty(constants.S_IFSOCK);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.readFile = function(path, encoding_) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var encoding = typeof(encoding_) === 'string' ? encoding_ : null;
  var callback = arguments[arguments.length - 1];
  if (typeof(callback) !== 'function') callback = noop;
  var readStream = fs.createReadStream(path);
  var buffers = [];
  var nread = 0;

  readStream.on('data', function(chunk) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    buffers.push(chunk);
    nread += chunk.length;
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});

  readStream.on('error', function(er) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    callback(er);
    readStream.destroy();
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});

  readStream.on('end', function() {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    // copy all the buffers into one
    var buffer;
    switch (buffers.length) {
      case 0: buffer = new Buffer(0); break;
      case 1: buffer = buffers[0]; break;
      default: // concat together
        buffer = new Buffer(nread);
        var n = 0;
        buffers.forEach(function(b) {var _trace3=_enterFunction(_trace2, this);try {if (this&&!this._trace) {this._trace=_trace3;}
          var l = b.length;
          b.copy(buffer, n, 0, l);
          n += l;
        } catch (_err) { throw _enhanceError(_err, _trace3); } finally {_leaveFunction(_trace3);}});
        break;
    }
    if (encoding) {
      try {
        buffer = buffer.toString(encoding);
      } catch (er) {
        return callback(er);
      }
    }
    callback(null, buffer);
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.readFileSync = function(path, encoding) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var fd = fs.openSync(path, constants.O_RDONLY, 0666);
  var buffer = new Buffer(4048);
  var buffers = [];
  var nread = 0;
  var lastRead = 0;

  do {
    if (lastRead) {
      buffer._bytesRead = lastRead;
      nread += lastRead;
      buffers.push(buffer);
    }
    var buffer = new Buffer(4048);
    lastRead = fs.readSync(fd, buffer, 0, buffer.length, null);
  } while (lastRead > 0);

  fs.closeSync(fd);

  if (buffers.length > 1) {
    var offset = 0;
    var i;
    buffer = new Buffer(nread);
    buffers.forEach(function(i) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
      if (!i._bytesRead) return;
      i.copy(buffer, offset, 0, i._bytesRead);
      offset += i._bytesRead;
    } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});
  } else if (buffers.length) {
    // buffers has exactly 1 (possibly zero length) buffer, so this should
    // be a shortcut
    buffer = buffers[0].slice(0, buffers[0]._bytesRead);
  } else {
    buffer = new Buffer(0);
  }

  if (encoding) buffer = buffer.toString(encoding);
  return buffer;
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


// Used by binding.open and friends
function stringToFlags(flag) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  // Only mess with strings
  if (typeof flag !== 'string') {
    return flag;
  }
  switch (flag) {
    case 'r':
      return constants.O_RDONLY;

    case 'r+':
      return constants.O_RDWR;

    case 'w':
      return constants.O_CREAT | constants.O_TRUNC | constants.O_WRONLY;

    case 'w+':
      return constants.O_CREAT | constants.O_TRUNC | constants.O_RDWR;

    case 'a':
      return constants.O_APPEND | constants.O_CREAT | constants.O_WRONLY;

    case 'a+':
      return constants.O_APPEND | constants.O_CREAT | constants.O_RDWR;

    default:
      throw new Error('Unknown file open flag: ' + flag);
  }
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}}

function noop() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}}

// Yes, the follow could be easily DRYed up but I provide the explicit
// list to make the arguments clear.

fs.close = function(fd, callback) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  binding.close(fd, callback || noop);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.closeSync = function(fd) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  return binding.close(fd);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

function modeNum(m, def) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  switch(typeof m) {
    case 'number': return m;
    case 'string': return parseInt(m, 8);
    default:
      if (def) {
        return modeNum(def);
      } else {
        return undefined;
      }
  }
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}}

fs.open = function(path, flags, mode, callback) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  callback = arguments[arguments.length - 1];
  if (typeof(callback) !== 'function') {
    callback = noop;
  }

  mode = modeNum(mode, '0666');

  binding.open(path, stringToFlags(flags), mode, callback);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.openSync = function(path, flags, mode) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  mode = modeNum(mode, '0666');
  return binding.open(path, stringToFlags(flags), mode);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.read = function(fd, buffer, offset, length, position, callback) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (!Buffer.isBuffer(buffer)) {
    // legacy string interface (fd, length, position, encoding, callback)
    var cb = arguments[4],
        encoding = arguments[3];
    position = arguments[2];
    length = arguments[1];
    buffer = new Buffer(length);
    offset = 0;

    callback = function(err, bytesRead) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
      if (!cb) return;

      var str = (bytesRead > 0) ? buffer.toString(encoding, 0, bytesRead) : '';

      (cb)(err, str, bytesRead);
    } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}};
  }

  function wrapper(err, bytesRead) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    // Retain a reference to buffer so that it can't be GC'ed too soon.
    callback && callback(err, bytesRead || 0, buffer);
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}}

  binding.read(fd, buffer, offset, length, position, wrapper);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.readSync = function(fd, buffer, offset, length, position) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var legacy = false;
  if (!Buffer.isBuffer(buffer)) {
    // legacy string interface (fd, length, position, encoding, callback)
    legacy = true;
    var encoding = arguments[3];
    position = arguments[2];
    length = arguments[1];
    buffer = new Buffer(length);

    offset = 0;
  }

  var r = binding.read(fd, buffer, offset, length, position);
  if (!legacy) {
    return r;
  }

  var str = (r > 0) ? buffer.toString(encoding, 0, r) : '';
  return [str, r];
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.write = function(fd, buffer, offset, length, position, callback) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (!Buffer.isBuffer(buffer)) {
    // legacy string interface (fd, data, position, encoding, callback)
    callback = arguments[4];
    position = arguments[2];

    buffer = new Buffer('' + arguments[1], arguments[3]);
    offset = 0;
    length = buffer.length;
  }

  if (!length) {
    if (typeof callback == 'function') {
      process.nextTick(function() {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
        callback(undefined, 0);
      } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});
    }
    return;
  }

  function wrapper(err, written) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    // Retain a reference to buffer so that it can't be GC'ed too soon.
    callback && callback(err, written || 0, buffer);
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}}

  binding.write(fd, buffer, offset, length, position, wrapper);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.writeSync = function(fd, buffer, offset, length, position) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (!Buffer.isBuffer(buffer)) {
    // legacy string interface (fd, data, position, encoding)
    position = arguments[2];

    buffer = new Buffer('' + arguments[1], arguments[3]);
    offset = 0;
    length = buffer.length;
  }
  if (!length) return 0;

  return binding.write(fd, buffer, offset, length, position);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.rename = function(oldPath, newPath, callback) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  binding.rename(oldPath, newPath, callback || noop);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.renameSync = function(oldPath, newPath) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  return binding.rename(oldPath, newPath);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.truncate = function(fd, len, callback) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  binding.truncate(fd, len, callback || noop);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.truncateSync = function(fd, len) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  return binding.truncate(fd, len);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.rmdir = function(path, callback) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  binding.rmdir(path, callback || noop);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.rmdirSync = function(path) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  return binding.rmdir(path);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.fdatasync = function(fd, callback) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  binding.fdatasync(fd, callback || noop);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.fdatasyncSync = function(fd) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  return binding.fdatasync(fd);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.fsync = function(fd, callback) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  binding.fsync(fd, callback || noop);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.fsyncSync = function(fd) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  return binding.fsync(fd);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.mkdir = function(path, mode, callback) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  binding.mkdir(path, modeNum(mode), callback || noop);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.mkdirSync = function(path, mode) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  return binding.mkdir(path, modeNum(mode));
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.sendfile = function(outFd, inFd, inOffset, length, callback) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  binding.sendfile(outFd, inFd, inOffset, length, callback || noop);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.sendfileSync = function(outFd, inFd, inOffset, length) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  return binding.sendfile(outFd, inFd, inOffset, length);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.readdir = function(path, callback) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  binding.readdir(path, callback || noop);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.readdirSync = function(path) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  return binding.readdir(path);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.fstat = function(fd, callback) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  binding.fstat(fd, callback || noop);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.lstat = function(path, callback) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  binding.lstat(path, callback || noop);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.stat = function(path, callback) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  binding.stat(path, callback || noop);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.fstatSync = function(fd) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  return binding.fstat(fd);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.lstatSync = function(path) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  return binding.lstat(path);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.statSync = function(path) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  return binding.stat(path);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.readlink = function(path, callback) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  binding.readlink(path, callback || noop);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.readlinkSync = function(path) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  return binding.readlink(path);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.symlink = function(destination, path, callback) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  binding.symlink(destination, path, callback || noop);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.symlinkSync = function(destination, path) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  return binding.symlink(destination, path);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.link = function(srcpath, dstpath, callback) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  binding.link(srcpath, dstpath, callback || noop);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.linkSync = function(srcpath, dstpath) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  return binding.link(srcpath, dstpath);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.unlink = function(path, callback) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  binding.unlink(path, callback || noop);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.unlinkSync = function(path) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  return binding.unlink(path);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.chmod = function(path, mode, callback) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  binding.chmod(path, modeNum(mode), callback || noop);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.chmodSync = function(path, mode) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  return binding.chmod(path, modeNum(mode));
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.chown = function(path, uid, gid, callback) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  binding.chown(path, uid, gid, callback || noop);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.chownSync = function(path, uid, gid) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  return binding.chown(path, uid, gid);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

function writeAll(fd, buffer, offset, length, callback) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  // write(fd, buffer, offset, length, position, callback)
  fs.write(fd, buffer, offset, length, offset, function(writeErr, written) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    if (writeErr) {
      fs.close(fd, function() {var _trace3=_enterFunction(_trace2, this);try {if (this&&!this._trace) {this._trace=_trace3;}
        if (callback) callback(writeErr);
      } catch (_err) { throw _enhanceError(_err, _trace3); } finally {_leaveFunction(_trace3);}});
    } else {
      if (written === length) {
        fs.close(fd, callback);
      } else {
        writeAll(fd, buffer, offset + written, length - written, callback);
      }
    }
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}}

fs.writeFile = function(path, data, encoding_, callback) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var encoding = (typeof(encoding_) == 'string' ? encoding_ : 'utf8');
  var callback_ = arguments[arguments.length - 1];
  var callback = (typeof(callback_) == 'function' ? callback_ : null);
  fs.open(path, 'w', 0666, function(openErr, fd) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    if (openErr) {
      if (callback) callback(openErr);
    } else {
      var buffer = Buffer.isBuffer(data) ? data : new Buffer(data, encoding);
      writeAll(fd, buffer, 0, buffer.length, callback);
    }
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.writeFileSync = function(path, data, encoding) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var fd = fs.openSync(path, 'w');
  if (!Buffer.isBuffer(data)) {
    data = new Buffer(data, encoding || 'utf8');
  }
  var written = 0;
  var length = data.length;
  //writeSync(fd, buffer, offset, length, position)
  while (written < length) {
    written += fs.writeSync(fd, data, written, length - written, written);
  }
  fs.closeSync(fd);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

// Stat Change Watchers

var statWatchers = {};

fs.watchFile = function(filename) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var stat;
  var options;
  var listener;

  if ('object' == typeof arguments[1]) {
    options = arguments[1];
    listener = arguments[2];
  } else {
    options = {};
    listener = arguments[1];
  }

  if (options.persistent === undefined) options.persistent = true;
  if (options.interval === undefined) options.interval = 0;

  if (statWatchers[filename]) {
    stat = statWatchers[filename];
  } else {
    statWatchers[filename] = new binding.StatWatcher();
    stat = statWatchers[filename];
    stat.start(filename, options.persistent, options.interval);
  }
  stat.addListener('change', listener);
  return stat;
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

fs.unwatchFile = function(filename) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var stat;
  if (statWatchers[filename]) {
    stat = statWatchers[filename];
    stat.stop();
    statWatchers[filename] = undefined;
  }
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

// Realpath
// Not using realpath(2) because it's bad.
// See: http://insanecoding.blogspot.com/2007/11/pathmax-simply-isnt.html

var path = require('path'),
    normalize = path.normalize,
    isWindows = process.platform === 'win32';

if (isWindows) {
  // Node doesn't support symlinks / lstat on windows. Hence realpatch is just
  // the same as path.resolve that fails if the path doesn't exists.

  // windows version
  fs.realpathSync = function realpathSync(p, cache) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
    var p = path.resolve(p);
    if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
      return cache[p];
    }
    fs.statSync(p);
    if (cache) cache[p] = p;
    return p;
  } catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

  // windows version
  fs.realpath = function(p, cache, cb) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
    if (typeof cb !== 'function') {
      cb = cache;
      cache = null;
    }
    var p = path.resolve(p);
    if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
      return cb(null, cache[p]);
    }
    fs.stat(p, function(err) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
      if (err) cb(err);
      if (cache) cache[p] = p;
      cb(null, p);
    } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});
  } catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


} else /* posix */ {

  // Regexp that finds the next partion of a (partial) path
  // result is [base_with_slash, base], e.g. ['somedir/', 'somedir']
  var nextPartRe = /(.*?)(?:[\/]+|$)/g;

  // posix version
  fs.realpathSync = function realpathSync(p, cache) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
    // make p is absolute
    p = path.resolve(p);

    if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
      return cache[p];
    }

    var original = p,
        seenLinks = {},
        knownHard = {};

    // current character position in p
    var pos = 0;
    // the partial path so far, including a trailing slash if any
    var current = '';
    // the partial path without a trailing slash
    var base = '';
    // the partial path scanned in the previous round, with slash
    var previous = '';

    // walk down the path, swapping out linked pathparts for their real
    // values
    // NB: p.length changes.
    while (pos < p.length) {
      // find the next part
      nextPartRe.lastIndex = pos;
      var result = nextPartRe.exec(p);
      previous = current;
      current += result[0];
      base = previous + result[1];
      pos = nextPartRe.lastIndex;

      // continue if not a symlink, or if root
      if (!base || knownHard[base] || (cache && cache[base] === base)) {
        continue;
      }

      var resolvedLink;
      if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
        // some known symbolic link.  no need to stat again.
        resolvedLink = cache[base];
      } else {
        var stat = fs.lstatSync(base);
        if (!stat.isSymbolicLink()) {
          knownHard[base] = true;
          if (cache) cache[base] = base;
          continue;
        }

        // read the link if it wasn't read before
        var id = stat.dev.toString(32) + ':' + stat.ino.toString(32);
        if (!seenLinks[id]) {
          fs.statSync(base);
          seenLinks[id] = fs.readlinkSync(base);
          resolvedLink = path.resolve(previous, seenLinks[id]);
          // track this, if given a cache.
          if (cache) cache[base] = resolvedLink;
        }
      }

      // resolve the link, then start over
      p = path.resolve(resolvedLink, p.slice(pos));
      pos = 0;
      previous = base = current = '';
    }

    if (cache) cache[original] = p;

    return p;
  } catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


  // posix version
  fs.realpath = function realpath(p, cache, cb) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
    if (typeof cb !== 'function') {
      cb = cache;
      cache = null;
    }

    // make p is absolute
    p = path.resolve(p);

    if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
      return cb(null, cache[p]);
    }

    var original = p,
        seenLinks = {},
        knownHard = {};

    // current character position in p
    var pos = 0;
    // the partial path so far, including a trailing slash if any
    var current = '';
    // the partial path without a trailing slash
    var base = '';
    // the partial path scanned in the previous round, with slash
    var previous = '';

    // walk down the path, swapping out linked pathparts for their real
    // values
    LOOP();
    function LOOP() {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
      // stop if scanned past end of path
      if (pos >= p.length) {
        if (cache) cache[original] = p;
        return cb(null, p);
      }

      // find the next part
      nextPartRe.lastIndex = pos;
      var result = nextPartRe.exec(p);
      previous = current;
      current += result[0];
      base = previous + result[1];
      pos = nextPartRe.lastIndex;

      // continue if known to be hard or if root or in cache already.
      if (!base || knownHard[base] || (cache && cache[base] === base)) {
        return process.nextTick(LOOP);
      }

      if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
        // known symbolic link.  no need to stat again.
        return gotResolvedLink(cache[base]);
      }

      return fs.lstat(base, gotStat);
    } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}}

    function gotStat(err, stat) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
      if (err) return cb(err);

      // if not a symlink, skip to the next path part
      if (!stat.isSymbolicLink()) {
        knownHard[base] = true;
        if (cache) cache[base] = base;
        return process.nextTick(LOOP);
      }

      // stat & read the link if not read before
      // call gotTarget as soon as the link target is known
      var id = stat.dev.toString(32) + ':' + stat.ino.toString(32);
      if (seenLinks[id]) {
        return gotTarget(null, seenLinks[id], base);
      }
      fs.stat(base, function(err) {var _trace3=_enterFunction(_trace2, this);try {if (this&&!this._trace) {this._trace=_trace3;}
        if (err) return cb(err);

        fs.readlink(base, function(err, target) {var _trace4=_enterFunction(_trace3, this);try {if (this&&!this._trace) {this._trace=_trace4;}
          gotTarget(err, seenLinks[id] = target);
        } catch (_err) { throw _enhanceError(_err, _trace4); } finally {_leaveFunction(_trace4);}});
      } catch (_err) { throw _enhanceError(_err, _trace3); } finally {_leaveFunction(_trace3);}});
    } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}}

    function gotTarget(err, target, base) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
      if (err) return cb(err);

      var resolvedLink = path.resolve(previous, target);
      if (cache) cache[base] = resolvedLink;
      gotResolvedLink(resolvedLink);
    } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}}

    function gotResolvedLink(resolvedLink) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}

      // resolve the link, then start over
      p = path.resolve(resolvedLink, p.slice(pos));
      pos = 0;
      previous = base = current = '';

      return process.nextTick(LOOP);
    } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}}
  } catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

}


var pool;

function allocNewPool() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  pool = new Buffer(kPoolSize);
  pool.used = 0;
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}}



fs.createReadStream = function(path, options) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  return new ReadStream(path, options);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

var ReadStream = fs.ReadStream = function(path, options) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (!(this instanceof ReadStream)) return new ReadStream(path, options);

  Stream.call(this);

  var self = this;

  this.path = path;
  this.fd = null;
  this.readable = true;
  this.paused = false;

  this.flags = 'r';
  this.mode = parseInt('0666', 8);
  this.bufferSize = 64 * 1024;

  options = options || {};

  // Mixin options into this
  var keys = Object.keys(options);
  for (var index = 0, length = keys.length; index < length; index++) {
    var key = keys[index];
    this[key] = options[key];
  }

  if (this.encoding) this.setEncoding(this.encoding);

  if (this.start !== undefined) {
    if (this.end === undefined) {
      this.end = Infinity;
    }

    if (this.start > this.end) {
      this.emit('error', new Error('start must be <= end'));
    } else {
      this._firstRead = true;
    }
  }

  if (this.fd !== null) {
    return;
  }

  fs.open(this.path, this.flags, this.mode, function(err, fd) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    if (err) {
      self.emit('error', err);
      self.readable = false;
      return;
    }

    self.fd = fd;
    self.emit('open', fd);
    self._read();
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};
util.inherits(ReadStream, Stream);

fs.FileReadStream = fs.ReadStream; // support the legacy name

ReadStream.prototype.setEncoding = function(encoding) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var StringDecoder = require('string_decoder').StringDecoder; // lazy load
  this._decoder = new StringDecoder(encoding);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


ReadStream.prototype._read = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var self = this;
  if (!self.readable || self.paused || self.reading) return;

  self.reading = true;

  if (!pool || pool.length - pool.used < kMinPoolSpace) {
    // discard the old pool. Can't add to the free list because
    // users might have refernces to slices on it.
    pool = null;
    allocNewPool();
  }

  if (self.start !== undefined && self._firstRead) {
    self.pos = self.start;
    self._firstRead = false;
  }

  // Grab another reference to the pool in the case that while we're in the
  // thread pool another read() finishes up the pool, and allocates a new
  // one.
  var thisPool = pool;
  var toRead = Math.min(pool.length - pool.used, this.bufferSize);
  var start = pool.used;

  if (this.pos !== undefined) {
    toRead = Math.min(this.end - this.pos + 1, toRead);
  }

  function afterRead(err, bytesRead) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    self.reading = false;
    if (err) {
      self.emit('error', err);
      self.readable = false;
      return;
    }

    if (bytesRead === 0) {
      self.emit('end');
      self.destroy();
      return;
    }

    var b = thisPool.slice(start, start + bytesRead);

    // Possible optimizition here?
    // Reclaim some bytes if bytesRead < toRead?
    // Would need to ensure that pool === thisPool.

    // do not emit events if the stream is paused
    if (self.paused) {
      self.buffer = b;
      return;
    }

    // do not emit events anymore after we declared the stream unreadable
    if (!self.readable) return;

    self._emitData(b);
    self._read();
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}}

  fs.read(self.fd, pool, pool.used, toRead, self.pos, afterRead);

  if (self.pos !== undefined) {
    self.pos += toRead;
  }
  pool.used += toRead;
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


ReadStream.prototype._emitData = function(d) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (this._decoder) {
    var string = this._decoder.write(d);
    if (string.length) this.emit('data', string);
  } else {
    this.emit('data', d);
  }
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


ReadStream.prototype.destroy = function(cb) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var self = this;
  this.readable = false;

  function close() {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    fs.close(self.fd, function(err) {var _trace3=_enterFunction(_trace2, this);try {if (this&&!this._trace) {this._trace=_trace3;}
      if (err) {
        if (cb) cb(err);
        self.emit('error', err);
        return;
      }

      if (cb) cb(null);
      self.emit('close');
    } catch (_err) { throw _enhanceError(_err, _trace3); } finally {_leaveFunction(_trace3);}});
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}}

  if (this.fd) {
    close();
  } else {
    this.addListener('open', close);
  }
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


ReadStream.prototype.pause = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  this.paused = true;
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};


ReadStream.prototype.resume = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  this.paused = false;

  if (this.buffer) {
    this._emitData(this.buffer);
    this.buffer = null;
  }

  // hasn't opened yet.
  if (null == this.fd) return;

  this._read();
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};



fs.createWriteStream = function(path, options) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  return new WriteStream(path, options);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

var WriteStream = fs.WriteStream = function(path, options) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (!(this instanceof WriteStream)) return new WriteStream(path, options);

  Stream.call(this);

  this.path = path;
  this.fd = null;
  this.writable = true;

  this.flags = 'w';
  this.encoding = 'binary';
  this.mode = parseInt('0666', 8);

  options = options || {};

  // Mixin options into this
  var keys = Object.keys(options);
  for (var index = 0, length = keys.length; index < length; index++) {
    var key = keys[index];
    this[key] = options[key];
  }

  this.busy = false;
  this._queue = [];

  if (this.fd === null) {
    this._queue.push([fs.open, this.path, this.flags, this.mode, undefined]);
    this.flush();
  }
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};
util.inherits(WriteStream, Stream);

fs.FileWriteStream = fs.WriteStream; // support the legacy name

WriteStream.prototype.flush = function() {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (this.busy) return;
  var self = this;

  var args = this._queue.shift();
  if (!args) {
    if (this.drainable) { self.emit('drain'); }
    return;
  }

  this.busy = true;

  var method = args.shift(),
      cb = args.pop();

  var self = this;

  args.push(function(err) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    self.busy = false;

    if (err) {
      self.writable = false;
      if (cb) {
        cb(err);
      }
      self.emit('error', err);
      return;
    }

    // stop flushing after close
    if (method === fs.close) {
      if (cb) {
        cb(null);
      }
      self.emit('close');
      return;
    }

    // save reference for file pointer
    if (method === fs.open) {
      self.fd = arguments[1];
      self.emit('open', self.fd);
    } else if (cb) {
      // write callback
      cb(null, arguments[1]);
    }

    self.flush();
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});

  // Inject the file pointer
  if (method !== fs.open) {
    args.unshift(self.fd);
  }

  method.apply(this, args);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

WriteStream.prototype.write = function(data) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (!this.writable) {
    throw new Error('stream not writable');
  }

  this.drainable = true;

  var cb;
  if (typeof(arguments[arguments.length - 1]) == 'function') {
    cb = arguments[arguments.length - 1];
  }

  if (Buffer.isBuffer(data)) {
    this._queue.push([fs.write, data, 0, data.length, null, cb]);
  } else {
    var encoding = 'utf8';
    if (typeof(arguments[1]) == 'string') encoding = arguments[1];
    this._queue.push([fs.write, data, undefined, encoding, cb]);
  }


  this.flush();

  return false;
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

WriteStream.prototype.end = function(data, encoding, cb) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  if (typeof(data) === 'function') {
    cb = data;
  } else if (typeof(encoding) === 'function') {
    cb = encoding;
    this.write(data);
  } else if (arguments.length > 0) {
    this.write(data, encoding);
  }
  this.writable = false;
  this._queue.push([fs.close, cb]);
  this.flush();
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

WriteStream.prototype.destroy = function(cb) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var self = this;
  this.writable = false;

  function close() {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}
    fs.close(self.fd, function(err) {var _trace3=_enterFunction(_trace2, this);try {if (this&&!this._trace) {this._trace=_trace3;}
      if (err) {
        if (cb) { cb(err); }
        self.emit('error', err);
        return;
      }

      if (cb) { cb(null); }
      self.emit('close');
    } catch (_err) { throw _enhanceError(_err, _trace3); } finally {_leaveFunction(_trace3);}});
  } catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}}

  if (this.fd) {
    close();
  } else {
    this.addListener('open', close);
  }
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}};

// There is no shutdown() for files.
WriteStream.prototype.destroySoon = WriteStream.prototype.end;

} catch (_err) { throw _enhanceError(_err, _trace0); } finally {_leaveFunction(_trace0);}