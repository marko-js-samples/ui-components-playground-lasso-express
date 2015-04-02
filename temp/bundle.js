(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// when used in node, this will actually load the util module we depend on
// versus loading the builtin util module as happens otherwise
// this is a bug in node module loading as far as I am concerned
var util = require('util/');

var pSlice = Array.prototype.slice;
var hasOwn = Object.prototype.hasOwnProperty;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
  else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = stackStartFunction.name;
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && !isFinite(value)) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  // if one is a primitive, the other must be same
  if (util.isPrimitive(a) || util.isPrimitive(b)) {
    return a === b;
  }
  var aIsArgs = isArguments(a),
      bIsArgs = isArguments(b);
  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
    return false;
  if (aIsArgs) {
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  var ka = objectKeys(a),
      kb = objectKeys(b),
      key, i;
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

},{"util/":8}],3:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
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

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],4:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],5:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
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

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":6}],6:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],7:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],8:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
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

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":7,"_process":6,"inherits":4}],9:[function(require,module,exports){
/*
 * Copyright 2011 eBay Software Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var inherit = require('raptor-util/inherit');
var raptorDom = require('raptor-dom');
var markoWidgets = require('./');
var raptorRenderer = require('raptor-renderer');
var EventEmitter = require('events').EventEmitter;
var listenerTracker = require('listener-tracker');
var arrayFromArguments = require('raptor-util/arrayFromArguments');
var extend = require('raptor-util/extend');
var updateManager = require('./update-manager');
var emit = EventEmitter.prototype.emit;

var idRegExp = /\#(\w+)( .*)?/;

function removeListener(eventListenerHandle) {
    eventListenerHandle.remove();
}

function _destroyRecursive(el) {
    raptorDom.forEachChildEl(el, function (childEl) {
        if (childEl.id) {
            var descendentWidget = markoWidgets.get(childEl.id);
            if (descendentWidget) {
                _destroy(descendentWidget, false, false);
            }
        }
        _destroyRecursive(childEl);
    });
}

/**
 * This method handles invoking a widget's event handler method
 * (if present) while also emitting the event through
 * the standard EventEmitter.prototype.emit method.
 *
 * Special events and their corresponding handler methods
 * include the following:
 *
 * beforeDestroy --> onBeforeDestroy
 * destroy       --> onDestroy
 * beforeUpdate  --> onBeforeUpdate
 * afterUpdate   --> onAfterUpdate
 */
function emitLifecycleEvent(widget, eventType, eventArg) {


    var eventMethod = 'on' +
        eventType.charAt(0).toUpperCase() +
        eventType.substring(1);


    var listenerMethod = widget[eventMethod];

    if (listenerMethod) {
        listenerMethod.call(widget, eventArg);
    }

    widget.emit.apply(widget, [eventType, eventArg]);
}

function _destroy(widget, removeNode, recursive) {
    if (widget.isDestroyed()) {
        return;
    }

    var isRerender = widget.__lifecycleState === 'rerender';

    var message = { widget: widget };
    var rootEl = widget.getEl();

    if (isRerender) {
        emitLifecycleEvent(widget, 'beforeUpdate', message);
    } else {
        emitLifecycleEvent(widget, 'beforeDestroy', message);
        widget.__lifecycleState = 'destroyed';
    }

    if (rootEl) {
        if (recursive) {
            _destroyRecursive(rootEl);
        }

        if (removeNode && rootEl.parentNode) {
            //Remove the widget's DOM nodes from the DOM tree if the root element is known
            rootEl.parentNode.removeChild(rootEl);
        }
    }

    // Unsubscribe from all DOM events
    var eventListenerHandles = widget.__evHandles;
    if (eventListenerHandles) {
        eventListenerHandles.forEach(removeListener);
        widget.__evHandles = null;
    }

    if (!isRerender) {
        emitLifecycleEvent(widget, 'destroy', message);
    }
}

var widgetProto;
function Widget(id) {
    EventEmitter.call(this);
    this.id = id;
    this.el = null;
    this.bodyEl = null;
    this.state = null;
    this.__subscriptions = null;
    this.__evHandles = null;
    this.__lifecycleState = null;
    this.__customEvents = null;
    this.__scope = null;
    this.__dirty = false;
    this.__oldState = null;
    this.__stateChanges = null;
    this.__updateQueued = false;
}

Widget.prototype = widgetProto = {
    _isWidget: true,

    subscribeTo: function(target) {

        var tracker = this.__subscriptions;
        if (!tracker) {
            var _this = this;
            this.__subscriptions = tracker = listenerTracker.createTracker();
            this.once('destroy', function() {
                tracker.removeAllListeners();
                delete _this.__subscriptions;
            });
        }

        return tracker.subscribeTo(target);
    },

    emit: function(eventType) {
        var customEvents = this.__customEvents;
        var targetMethodName;
        var args;

        if (customEvents && (targetMethodName = customEvents[eventType])) {
            args = args || arrayFromArguments(arguments, 1);
            args.push(this);

            var targetWidget = markoWidgets.getWidgetForEl(this.__scope);
            var targetMethod = targetWidget[targetMethodName];
            if (!targetMethod) {
                throw new Error('Method not found for widget ' + targetWidget.id + ': ' + targetMethodName);
            }

            targetMethod.apply(targetWidget, args);
        }

        return emit.apply(this, arguments);
    },
    getElId: function (widgetElId, index) {
        var elId = widgetElId != null ? this.id + '-' + widgetElId : this.id;

        if (index != null) {
            elId += '[' + index + ']';
        }

        return elId;
    },
    getEl: function (widgetElId, index) {
        if (widgetElId != null) {
            return document.getElementById(this.getElId(widgetElId, index));
        } else {
            return this.el || document.getElementById(this.getElId());
        }
    },
    getEls: function(id) {
        var els = [];
        var i=0;
        while(true) {
            var el = this.getEl(id, i);
            if (!el) {
                break;
            }
            els.push(el);
            i++;
        }
        return els;
    },
    getWidget: function(id, index) {
        var targetWidgetId = this.getElId(id, index);
        return markoWidgets.getWidgetForEl(targetWidgetId);
    },
    getWidgets: function(id) {
        var widgets = [];
        var i=0;
        while(true) {
            var widget = this.getWidget(id, i);
            if (!widget) {
                break;
            }
            widgets.push(widget);
            i++;
        }
        return widgets;
    },
    destroy: function (options) {
        options = options || {};
        _destroy(this, options.removeNode !== false, options.recursive !== false);
    },
    isDestroyed: function () {
        return this.__lifecycleState === 'destroyed';
    },
    getBodyEl: function() {
        return this.bodyEl;
    },
    // setWidgetBody: function(content) {
    //     var bodyEl = this.bodyEl;
    //
    //     if (typeof content === 'function') {
    //         raptorRenderer.render(content).replaceChildrenOf(bodyEl);
    //     } else {
    //         bodyEl.innerHTML = content;
    //     }
    // },
    shouldUpdate: function(stateChanges, oldState) {
        for (var propName in stateChanges) {
            if (stateChanges.hasOwnProperty(propName)) {
                var newValue = stateChanges[propName];
                var oldValue = oldState[propName];

                if (oldValue !== newValue) {
                    return true;
                }
            }
        }
        return false;
    },
    setState: function(name, value) {
        if (typeof name === 'object') {
            // Merge in the new state with the old state
            var newState = name;
            for (var k in newState) {
                if (newState.hasOwnProperty(k)) {
                    this.setState(k, newState[k]);
                }
            }
            return;
        }


        if (this.state[name] === value) {
            return;
        }

        if (this.__dirty) {
            this.__stateChanges[name] = this.state[name] = value;
        } else {
            var currentState = this.state;
            this.__dirty = true;
            this.__oldState = currentState;
            this.state = extend({}, currentState);
            this.__stateChanges = {};
            // Update "this.state" before queuing up the update in
            // case the update applied immediately.
            this.__stateChanges[name] = this.state[name] = value;
            updateManager.queueWidgetUpdate(this);
        }
    },

    replaceState: function(newState) {
        var k;

        for (k in this.state) {
            if (this.state.hasOwnProperty(k) && !newState.hasOwnProperty(k)) {
                this.setState(k, null);
            }
        }

        for (k in newState) {
            if (newState.hasOwnProperty(k)) {
                this.setState(k, newState[k]);
            }
        }
    },

    /**
     * Recalculate the new state from the given props using the widget's
     * getInitialState(props) method. If the widget does not have a
     * getInitialState(props) then it is re-rendered with the new props
     * as input.
     *
     * @param {Object} props The widget's new props
     */
    setProps: function(newProps) {
        if (this.getInitialState) {
            var state = this.getInitialState(newProps);
            this.replaceState(state);
        } else {
            if (!this.__newProps) {
                updateManager.queueWidgetUpdate(this);
            }

            this.__newProps = newProps;
        }
    },

    update: function() {
        var newProps = this.__newProps;
        if (newProps) {
            delete this.__newProps;
            this.rerender(newProps);
            return;
        }

        if (!this.__dirty) {
            // console.log('Skipping widget update (not dirty): ' + this.id);
            return;
        }

        var stateChanges = this.__stateChanges;
        var oldState = this.__oldState;

        if (this.shouldUpdate(stateChanges, oldState) !== false) {
            this.doUpdate(stateChanges, oldState);
        }

        this.__reset();
    },

    __reset: function() {
        this.__oldState = null;
        this.__dirty = false;
        this.__stateChanges = null;
    },

    // forceUpdate: function() {
    //     var stateChanges = this.__stateChanges || this.state;
    //     var oldState = this.__oldState || this.state;
    //
    //     this.doUpdate(stateChanges, oldState);
    //     this.__reset();
    // },

    doUpdate: function (stateChanges, oldState) {
        if (this.isDestroyed()) {
            return;
        }

        var handlerMethod;
        var handlers = [];

        for (var k in stateChanges) {
            if (stateChanges.hasOwnProperty(k)) {
                // checked --> updateChecked
                var handlerMethodName = 'update_' + k;

                handlerMethod = this[handlerMethodName];
                if (handlerMethod) {
                    handlers.push([k, handlerMethod]);
                } else {
                    this.rerender();
                    return;
                }
            }
        }

        // Otherwise, there are handlers for all of the changed properties
        // so apply the updates using those handlers

        for (var i=0, len=handlers.length; i<len; i++) {
            var handler = handlers[i];
            var propertyName = handler[0];
            handlerMethod = handler[1];

            var newValue = stateChanges[propertyName];
            var oldValue = oldState[propertyName];
            handlerMethod.call(this, newValue, oldValue);
        }

        emitLifecycleEvent(this, 'afterUpdate');

        this.__reset();
    },

    shouldReuseWidget: true,
    rerender: function(props) {
        if (!this.renderer) {
            throw new Error('Widget does not have a "renderer" property');
        }

        var elToReplace = document.getElementById(this.id);
        var self = this;

        var renderer = this.renderer || this;
        this.__lifecycleState = 'rerender';

        var templateData = extend({}, props || this.state);

        var global = templateData.$global = {};

        global.__rerenderWidget = this;
        global.__rerenderEl = this.el;

        global.__rerender = true;

        if (!props) {
            global.__rerenderState = props ? null : this.state;
        }

        updateManager.batchUpdate(function() {
            var renderResult = raptorRenderer
                .render(renderer, templateData);

            renderResult.replace(elToReplace);
            self.__lifecycleState = null;
            emitLifecycleEvent(self, 'afterUpdate');

            if (!props) {
                // We have re-rendered with the new state so our state
                // is no longer dirty. Before updating a widget
                // we check if a widget is dirty. If a widget is not
                // dirty then we abort the update. Therefore, if the
                // widget was queued for update and the re-rendered
                // before the update occurred then nothing will happen
                // at the time of the update.
                self.__reset();
            }
        });
    },

    detach: function () {
        raptorDom.detach(this.el);

    },
    appendTo: function (targetEl) {
        raptorDom.appendTo(this.el, targetEl);
    },
    replace: function (targetEl) {
        raptorDom.replace(this.el, targetEl);
    },
    replaceChildrenOf: function (targetEl) {
        raptorDom.replaceChildrenOf(this.el, targetEl);
    },
    insertBefore: function (targetEl) {
        raptorDom.insertBefore(this.el, targetEl);
    },
    insertAfter: function (targetEl) {
        raptorDom.insertAfter(this.el, targetEl);
    },
    prependTo: function (targetEl) {
        raptorDom.prependTo(this.el, targetEl);
    },
    ready: function (callback) {
        markoWidgets.ready(callback, this);
    },
    $: function (arg) {
        var jquery = markoWidgets.$;

        var args = arguments;
        if (args.length === 1) {
            //Handle an "ondomready" callback function
            if (typeof arg === 'function') {
                var _this = this;
                _this.ready(function() {
                    arg.call(_this);
                });
            } else if (typeof arg === 'string') {
                var match = idRegExp.exec(arg);
                //Reset the search to 0 so the next call to exec will start from the beginning for the new string
                if (match != null) {
                    var widgetElId = match[1];
                    if (match[2] == null) {
                        return jquery(this.getEl(widgetElId));
                    } else {
                        return jquery('#' + this.getElId(widgetElId) + match[2]);
                    }
                } else {
                    var rootEl = this.getEl();
                    if (!rootEl) {
                        throw new Error('Root element is not defined for widget');
                    }
                    if (rootEl) {
                        return jquery(arg, rootEl);
                    }
                }
            }
        } else if (args.length === 2 && typeof args[1] === 'string') {
            return jquery(arg, this.getEl(args[1]));
        } else if (args.length === 0) {
            return jquery(this.el);
        }
        return jquery.apply(window, arguments);
    }
};

widgetProto.elId = widgetProto.getElId;

inherit(Widget, EventEmitter);

module.exports = Widget;
},{"./":18,"./update-manager":22,"events":3,"listener-tracker":23,"raptor-dom":31,"raptor-renderer":57,"raptor-util/arrayFromArguments":62,"raptor-util/extend":67,"raptor-util/inherit":70}],10:[function(require,module,exports){
require('raptor-polyfill/string/endsWith');

var repeatedId = require('../lib/repeated-id');

function WidgetDef(config, endFunc, out) {
    this.module = config.module;
    this.id = config.id;
    this.config = config.config;
    this.state = config.state;
    this.scope = config.scope;
    this.domEvents = config.domEvents;
    this.customEvents = config.customEvents;
    this.bodyElId = config.bodyElId;
    this.children = [];
    this.end = endFunc;
    this.extend = config.extend;
    this.existingWidget = config.existingWidget;
    this.out = out;
}

WidgetDef.prototype = {
    addChild: function (widgetDef) {
        this.children.push(widgetDef);
    },
    elId: function (nestedId) {
        if (nestedId == null) {
            return this.id;
        } else {
            if (typeof nestedId === 'string' && nestedId.endsWith('[]')) {
                nestedId = repeatedId.nextId(this.out, this.id, nestedId);
            }

            return this.id + '-' + nestedId;
        }
    }
};

module.exports = WidgetDef;
},{"../lib/repeated-id":20,"raptor-polyfill/string/endsWith":52}],11:[function(require,module,exports){
var WidgetDef = require('./WidgetDef');
var uniqueId = require('./uniqueId');
var initWidgets = require('./init-widgets');
var EventEmitter = require('events').EventEmitter;
var inherit = require('raptor-util/inherit');
var helpers = require('../taglib/helpers');
var raptorRenderer = require('raptor-renderer');

function widgetBodyRenderer(input, out) {
    var widget = input.widget;

    var widgetDef = new WidgetDef({
        id: widget.id
    }, null, out);

    helpers.widgetBody(out, null, input.widgetBody, widgetDef);
}

function WidgetsContext(out) {
    EventEmitter.call(this);
    this.out = out;
    this.widgets = [];
    this.widgetStack = [];
    this.reusableNodes = null;
    this.reusableWidgets = null;
}

WidgetsContext.prototype = {
    getWidgets: function () {
        return this.widgets;
    },

    getWidgetStack: function() {
        return this.widgetStack;
    },

    beginWidget: function (widgetInfo, callback) {
        var _this = this;
        var widgetStack = _this.widgetStack;
        var origLength = widgetStack.length;
        var parent = origLength ? widgetStack[origLength - 1] : null;
        if (!widgetInfo.id) {
            widgetInfo.id = _this._nextWidgetId();
        }

        widgetInfo.parent = parent;

        function end() {
            widgetStack.length = origLength;
        }

        var widgetDef = new WidgetDef(widgetInfo, end, this.out);
        if (parent) {
            //Check if it is a top-level widget
            parent.addChild(widgetDef);
        } else {
            _this.widgets.push(widgetDef);
        }
        widgetStack.push(widgetDef);

        this.emit('beginWidget', widgetDef);

        return widgetDef;
    },
    hasWidgets: function () {
        return this.widgets.length !== 0;
    },
    clearWidgets: function () {
        this.widgets = [];
        this.widgetStack = [];
    },
    _nextWidgetId: function () {
        return uniqueId(this.out);
    },
    initWidgets: function () {
        var widgetDefs = this.widgets;
        initWidgets.initClientRendered(widgetDefs);
        this.clearWidgets();
    },
    onBeginWidget: function(listener) {
        this.on('beginWidget', listener);
    },

    addReusableDOMNode: function(existingEl, bodyOnly) {
        var reusableNodes = this.reusableNodes || (this.reusableNodes = []);
        reusableNodes.push(existingEl);
        reusableNodes.push(bodyOnly);

        if (existingEl !== this.out.global.__rerenderEl) {
            // Remove it out of the DOM so that it does not get destroyed
            existingEl.parentNode.removeChild(existingEl);
        }
    },

    addReusableWidget: function(existingWidget, newState, newProps, widgetBody) {
        var reusableWidgets = this.reusableWidgets || (this.reusableWidgets = []);

        // Remove this widget out of the DOM so that it does not get destroyed
        existingWidget.detach();
        reusableWidgets.push({
            widget: existingWidget,
            state: newState,
            props: newProps,
            body: widgetBody
        });
    },

    reuseDOMNodes: function() {
        var reusableNodes = this.reusableNodes;
        if (reusableNodes) {
            for (var i=0, len=reusableNodes.length; i<len; i+=2) {
                var oldEl = reusableNodes[i];
                var bodyOnly = reusableNodes[i+1];
                var id = oldEl.id;
                var newEl = document.getElementById(id);

                // console.log('Reusing DOM node ', id, 'bodyOnly: ', bodyOnly);

                if (bodyOnly) {

                    var fragment = document.createDocumentFragment();
                    var curChild = oldEl.firstChild;
                    while(curChild) {
                        var nextChild = curChild.nextSibling;
                        fragment.appendChild(curChild);
                        curChild = nextChild;
                    }

                    newEl.appendChild(fragment);
                } else {
                    newEl.parentNode.replaceChild(oldEl, newEl);
                }
            }
        }
    },

    reuseWidgets: function() {
        var reusableWidgets = this.reusableWidgets;
        if (reusableWidgets) {
            for (var i=0, len=reusableWidgets.length; i<len; i++) {
                var reusableWidgetInfo = reusableWidgets[i];

                var existingWidget = reusableWidgetInfo.widget;
                var newState = reusableWidgetInfo.state;
                var newProps = reusableWidgetInfo.props;
                var widgetBody = reusableWidgetInfo.body;
                var id = existingWidget.id;
                var placeholderEl = document.getElementById(id);

                // console.log('Reusing existing widget ', id, 'new state: ', newState);
                placeholderEl.parentNode.replaceChild(existingWidget.el, placeholderEl);

                if (newState) {
                    existingWidget.replaceState(newState);
                } else if (newProps) {
                    existingWidget.setProps(newProps);
                }

                if (widgetBody) {
                    raptorRenderer.render(widgetBodyRenderer, {
                            widget: existingWidget,
                            widgetBody: widgetBody
                        })
                        .replaceChildrenOf(existingWidget.getBodyEl());
                }
            }
        }
    }
};

inherit(WidgetsContext, EventEmitter);

WidgetsContext.getWidgetsContext = function (out) {
    var global = out.global;

    return out.data.widgets ||
        global.widgets ||
        (global.widgets = new WidgetsContext(out));
};


module.exports = WidgetsContext;
},{"../taglib/helpers":77,"./WidgetDef":10,"./init-widgets":16,"./uniqueId":21,"events":3,"raptor-renderer":57,"raptor-util/inherit":70}],12:[function(require,module,exports){
var testEl = document.body || document.createElement('div');

function IEListenerHandle(el, eventType, listener) {
    this._info = [el, eventType, listener];
}

IEListenerHandle.prototype = {
    remove: function() {
        var info = this._info;
        var el = info[0];
        var eventType = info[1];
        var listener = info[2];
        el.detachEvent(eventType, listener);
    }
};


function ListenerHandle(el, eventType, listener) {
    this._info = [el, eventType, listener];
}

ListenerHandle.prototype = {
    remove: function() {
        var info = this._info;
        var el = info[0];
        var eventType = info[1];
        var listener = info[2];
        el.removeEventListener(eventType, listener);
    }
};


function getIEEvent() {
    var event = window.event;
    // add event.target
    event.target = event.target || event.srcElement;

    event.preventDefault = event.preventDefault || function() {
        event.returnValue = false;
    };

    event.stopPropagation = event.stopPropagation || function() {
        event.cancelBubble = true;
    };

	event.key = (event.which + 1 || event.keyCode + 1) - 1 || 0;

    return event;
}

if (testEl.attachEvent) {
    module.exports = function(el, eventType, listener) {
        function wrappedListener() {
            var event = getIEEvent();
            listener(event);
        }

        eventType = 'on' + eventType;

        el.attachEvent(eventType, wrappedListener);
        return new IEListenerHandle(el, eventType, wrappedListener);
    };
} else {
    module.exports = function(el, eventType, listener) {
        el.addEventListener(eventType, listener, false);
        return new ListenerHandle(el, eventType, listener);
    };
}

},{}],13:[function(require,module,exports){
module.exports = [
    /* Mouse Events */
    'click',
    'dblclick',
    'mousedown',
    'mouseup',
    // 'mouseover',
    // 'mousemove',
    // 'mouseout',
    'dragstart',
    'drag',
    // 'dragenter',
    // 'dragleave',
    // 'dragover',
    'drop',
    'dragend',

    /* Keyboard Events */
    'keydown',
    'keypress',
    'keyup',

    /* Form Events */
    'select',
    'change',
    'submit',
    'reset'
    // 'focus', <-- Does not bubble
    // 'blur', <-- Does not bubble
    // 'focusin', <-- Not supported in all browsers
    // 'focusout' <-- Not supported in all browsers
];
},{}],14:[function(require,module,exports){
var marko = require('marko');
var raptorRenderer = require('raptor-renderer');
var extend = require('raptor-util/extend');
var markoWidgets = require('../');

function shouldReuseWidget(existingWidget, widgetProps, widgetState) {
    if (existingWidget.shouldReuseWidget === true) {
        return true;
    }

    if (typeof existingWidget.shouldReuseWidget === 'function') {
        return existingWidget.shouldReuseWidget(widgetState, widgetProps);
    }

    return false;
}

function getExistingWidget(out, widgetArgs) {
    var id = widgetArgs.id;
    if (id) {
        var existingEl = document.getElementById(id);
        if (existingEl) {
            return existingEl.__widget;
        }
    }

    return null;
}

function mergeExtendState(widgetState, widgetArgs) {
    var extendState = widgetArgs.extendState;

    if (extendState) {
        delete widgetArgs.extendState;

        if (widgetState) {
            return extend(widgetState, extendState);
        } else {
            return extendState;
        }
    }
}

module.exports = function defineRenderer(def) {
    var template = def.template;
    var getTemplateData = def.getTemplateData;
    var getInitialState = def.getInitialState;
    var getWidgetConfig = def.getWidgetConfig;
    var getInitialBody = def.getInitialBody;
    var extendWidget = def.extendWidget;
    var renderer = def.renderer;

    var loadedTemplate;


    if (!renderer) {
        renderer = function renderer(input, out) {
            var global = out.global;
            if (!input) {
                input = {};
            }

            if (!loadedTemplate) {
                loadedTemplate = template.render ? template : marko.load(template);
            }

            var widgetState;
            var widgetArgs = out.data.widgetArgs;
            var widgetBody;

            if (getInitialBody) {
                widgetBody = getInitialBody(input);
            }

            if (getInitialState) {
                // var isBeingExtend = widgetArgs && widgetArgs.extend;
                var isFirstWidget = !global.__firstWidgetFound;

                if (global.__rerenderWidget && global.__rerenderState) {
                    if (!isFirstWidget || extendWidget) {
                        // We are the not first top-level widget or we are being extended
                        // so use the merged rerender state as defaults for the input
                        // and use that to rebuild the new state
                        for (var k in global.__rerenderState) {
                            if (global.__rerenderState.hasOwnProperty(k) && !input.hasOwnProperty(k)) {
                                input[k] = global.__rerenderState[k];
                            }
                        }
                        widgetState = getInitialState(input);
                    } else {
                        // We are the first widget and we are not being extended
                        // and we are not extending so use the input as the state
                        widgetState = input;
                    }
                } else {
                    // We are not the top-level widget so we need to rebuild the state
                    // from the provided input properties
                    widgetState = getInitialState(input);
                }
            }

            // The logic below allows stateful widgets that already existing in the DOM to be reused
            // if we are rerendering a UI component.
            //
            // We can only reuse an existing widget if we were given an assigned ID. We can lookup the existing
            // widget using the assigned ID. If an existing widget is found then we temporarily remove it out of
            // the DOM and render a new placeholder with the same ID. After the parent UI component is
            // added to the DOM we then move the existing widget into place by replacing the placeholder
            // element with the old node and then we update the existing widget with its new state (which
            // may or may not have changed).
            if (widgetArgs && global.__rerender === true && !global.__rerenderWidget && !extendWidget) {

                if (widgetState) {
                    mergeExtendState(widgetState, widgetArgs);
                }

                var existingWidget = getExistingWidget(out, widgetArgs);
                
                if (existingWidget && (existingWidget.constructor === def.constructor) && shouldReuseWidget(existingWidget, widgetState, input)) {
                    // console.log(module.id, 'Reusing existing widget ', existingWidget.id, 'New state: ', widgetState);
                    // Render a placeholder element as a marker that we can use to splice back in the existing
                    // widget that is being reused
                    out.write('<span id="' + existingWidget.id + '"></span>');
                    var widgetsContext = markoWidgets.getWidgetsContext(out);
                    widgetsContext.addReusableWidget(existingWidget, widgetState, input, widgetBody);
                    return;
                }
            }


            global.__firstWidgetFound = true;

            var templateData = getTemplateData ? getTemplateData(widgetState, input) || {} : widgetState || input;

            if (widgetState) {
                templateData.widgetState = widgetState;
            }

            if (widgetBody) {
                templateData.widgetBody = widgetBody;
            }

            if (getWidgetConfig) {
                templateData.widgetConfig = getWidgetConfig(input);
            }

            loadedTemplate.render(templateData, out);
        };
    }

    renderer.render = raptorRenderer.createRenderFunc(renderer);

    return renderer;
};


},{"../":17,"marko":28,"raptor-renderer":57,"raptor-util/extend":67}],15:[function(require,module,exports){
module.exports = function defineWidget(def) {
    if (def._isWidget) {
        return def;
    }


    var renderer;

    if (def.template || def.renderer) {
        renderer = defineRenderer(def);
    }

    var extendWidget = def.extendWidget;
    if (extendWidget) {
        return {
            renderer: renderer,
            render: renderer.render,
            extendWidget: function(widget) {
                extendWidget(widget);
                widget.renderer = renderer;
            }
        };
    }

    var WidgetClass;
    var proto;

    if (typeof def === 'function') {
        WidgetClass = def;
        proto = WidgetClass.prototype;
    } else if (typeof def === 'object') {
        WidgetClass = def.init || function() {};
        proto = WidgetClass.prototype = def;
    } else {
        throw new Error('Invalid widget');
    }

    var WidgetClassWithMixins = function(id) {
        Widget.call(this, id);
    };

    if (!proto._isWidget) {
        inherit(WidgetClass, Widget);
    }

    //This will be a reference to the original prorotype
    proto = WidgetClassWithMixins.prototype = WidgetClass.prototype;

    proto.initWidget = WidgetClass;

    proto.constructor = def.constructor = WidgetClassWithMixins;

    WidgetClassWithMixins = WidgetClassWithMixins;

    WidgetClassWithMixins._isWidget = true;

    if (renderer) {
        WidgetClassWithMixins.renderer = proto.renderer = renderer;
        WidgetClassWithMixins.render = renderer.render;
    }

    return WidgetClassWithMixins;
};

var Widget = require('./Widget');
var inherit = require('raptor-util/inherit');
var defineRenderer = require('./defineRenderer');


},{"./Widget":9,"./defineRenderer":14,"raptor-util/inherit":70}],16:[function(require,module,exports){
// The server-side implementation of this module is intentionally empty
},{}],17:[function(require,module,exports){
/*
 * Copyright 2011 eBay Software Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var raptorPubsub = require('raptor-pubsub');
var ready = require('raptor-dom').ready;
var EMPTY_OBJ = {};
var Widget = require('./Widget');
var initWidgets = require('./init-widgets');
var _addEventListener = require('./addEventListener');
var raptorRenderer = require('raptor-renderer');
var updateManager = require('./update-manager');

// Exports:
exports.getWidgetsContext = require('./WidgetsContext').getWidgetsContext;
exports.Widget = Widget;
exports.ready = ready;
exports.onInitWidget = function(listener) {
    raptorPubsub.on('marko-widgets/initWidget', listener);
};
exports.attrs = function() {
    return EMPTY_OBJ;
};

function getWidetForEl(id) {
    if (!id) {
        return undefined;
    }

    var node = typeof id === 'string' ? document.getElementById(id) : id;
    return (node && node.__widget) || undefined;
}

exports.get = exports.getWidgetForEl = getWidetForEl;

exports.initAllWidgets = function() {
    initWidgets.initServerRendered(true /* scan DOM */);
};

// Subscribe to DOM manipulate events to handle creating and destroying widgets
raptorPubsub
    .on('dom/beforeRemove', function(eventArgs) {
        var el = eventArgs.el;
        var widget = el.id ? getWidetForEl(el) : null;
        if (widget) {
            widget.destroy({
                removeNode: false,
                recursive: true
            });
        }
    })
    .on('raptor-renderer/renderedToDOM', function(eventArgs) {
        var out = eventArgs.out || eventArgs.context;
        var widgetsContext = out.global.widgets;
        if (widgetsContext) {
            // Reuse the existing DOM nodes
            widgetsContext.reuseDOMNodes();
            widgetsContext.reuseWidgets();
            widgetsContext.initWidgets();
        }
    });



window.$rwidgets = function(ids) {
    initWidgets.initServerRendered(ids);
};

var JQUERY = 'jquery';
var jquery = window.$;

if (!jquery) {
    try {
        jquery = require(JQUERY);
    }
    catch(e) {}
}

exports.$ = jquery;

ready(function() {
    var body = document.body;
    // Here's where we handle event delegation using our own mechanism
    // for delegating events. For each event that we have white-listed
    // as supporting bubble, we will attach a listener to the root
    // document.body element. When we get notified of a triggered event,
    // we again walk up the tree starting at the target associated
    // with the event to find any mappings for event. Each mapping
    // is from a DOM event type to a method of a widget.
    require('./bubble').forEach(function addBubbleHandler(eventType) {
        _addEventListener(body, eventType, function(event) {
            updateManager.batchUpdate(function() {
                var curNode = event.target;
                if (!curNode) {
                    return;
                }

                // Search up the tree looking DOM events mapped to target
                // widget methods
                var attrName = 'data-w-on' + eventType;
                var targetMethod;
                var targetWidget;

                // Attributes will have the following form:
                // w-on<event_type>="<target_method>|<widget_id>"

                do {
                    if ((targetMethod = curNode.getAttribute(attrName))) {
                        var separator = targetMethod.lastIndexOf('|');
                        targetWidget = targetMethod.substring(separator+1);
                        targetWidget = document.getElementById(targetWidget).__widget;
                        targetMethod = targetMethod.substring(0, separator);

                        // Invoke the widget method
                        targetWidget[targetMethod](event, curNode);
                    }
                } while((curNode = curNode.parentNode) && curNode.getAttribute);
            });
        });
    });
});

exports.registerWidget = require('./registry').register;

exports.getDynamicClientWidgetPath = function(targetModuleFile) {
    return targetModuleFile;
};

exports.makeRenderable = exports.renderable = raptorRenderer.renderable;
exports.render = raptorRenderer.render;
exports.defineWidget = require('./defineWidget');
exports.defineRenderer = require('./defineRenderer');
exports.batchUpdate = updateManager.batchUpdate;
exports.onAfterUpdate = updateManager.onAfterUpdate;
},{"./Widget":9,"./WidgetsContext":11,"./addEventListener":12,"./bubble":13,"./defineRenderer":14,"./defineWidget":15,"./init-widgets":16,"./registry":19,"./update-manager":22,"raptor-dom":31,"raptor-pubsub":54,"raptor-renderer":57}],18:[function(require,module,exports){
/*
 * Copyright 2011 eBay Software Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
* Module to manage the lifecycle of widgets
*
*/

/*
 * Copyright 2011 eBay Software Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var stringify = require('raptor-json/stringify');
var raptorModulesResolver = require('raptor-modules/resolver');
var raptorModulesUtil = require('raptor-modules/util');
var raptorRenderer = require('raptor-renderer');

var WidgetsContext = require('./WidgetsContext');
var TAG_START = '<span id="rwidgets" data-ids="';
var TAG_END = '" style="display:none;"></span>';
var STRINGIFY_OPTIONS = {
    special: /([^ -~]|(["'\\<&%]))/g,
    replace: {
        '"': '\\u0022',
        '\n': '\\n'
    },
    useSingleQuote: true
};

function WrappedString(val) {
    this.html = val;
}

WrappedString.prototype = {
    toString: function() {
        return this.html;
    }
};

var bubbleEventsLookup = {};

require('./bubble').forEach(function(eventType) {
    bubbleEventsLookup[eventType] = true;
});

exports.isBubbleEvent = function(eventType) {
    return bubbleEventsLookup.hasOwnProperty(eventType);
};

exports.WidgetsContext = WidgetsContext;
exports.getWidgetsContext = WidgetsContext.getWidgetsContext;
exports.uniqueId = require('./uniqueId');
exports.attrs = function(widgetDef) {
    var attrs = {
        'data-widget': widgetDef.module
    };

    var widgetConfig = widgetDef.config;
    if (widgetConfig) {
        attrs['data-w-config'] = new WrappedString(stringify(widgetConfig, STRINGIFY_OPTIONS));
    }

    var widgetState = widgetDef.state;
    if (widgetState) {
        attrs['data-w-state'] = new WrappedString(stringify(widgetState, STRINGIFY_OPTIONS));
    }

    var domEvents = widgetDef.domEvents;
    if (domEvents) {
        attrs['data-w-on'] = domEvents.join(',');
    }

    var customEvents = widgetDef.customEvents;
    if (customEvents) {
        attrs['data-w-events'] = widgetDef.scope + ',' + customEvents.join(',');
    }

    var extend = widgetDef.extend;

    if (extend && extend.length) {
        attrs['data-w-extend'] = new WrappedString(extend.join(','));
    }

    var bodyElId = widgetDef.bodyElId;
    if (bodyElId != null) {
        attrs['data-w-body'] = bodyElId;
    }

    return attrs;
};

exports.writeInitWidgetsCode = function(widgetsContext, out, options) {
    var clearWidgets = true;
    var scanDOM = false;
    var immediate = false;

    if (options) {
        clearWidgets = options.clearWidgets !== false;
        scanDOM = options.scanDOM === true;
        immediate = options.immediate === true;
    }

    if (scanDOM) {
        out.write(TAG_START + '*' + TAG_END);
    } else {
        var widgets = widgetsContext.getWidgets();

        if (!widgets || !widgets.length) {
            return;
        }

        var ids = '';

        var commaRequired = false;

        var writeWidget = function(widget) {

            if (widget.children.length) {
                // Depth-first search (children should be initialized before parent)
                writeWidgets(widget.children);
            }

            if (commaRequired) {
                ids += ',';
            } else {
                commaRequired = true;
            }

            ids += widget.id;
        };

        var writeWidgets = function(widgets) {
            for (var i = 0, len = widgets.length; i < len; i++) {
                writeWidget(widgets[i]);
            }
        };

        writeWidgets(widgets);

        if (immediate) {
            out.write('<script type="text/javascript">$rwidgets("' + ids + '")</script>');
        } else {
            out.write(TAG_START + ids + TAG_END);
        }
    }

    if (clearWidgets !== false) {
        widgetsContext.clearWidgets();
    }
};

exports.getInitWidgetsCode = function(widgetsContext) {
    if (!widgetsContext) {
        throw new Error('"widgetsContext" is required');
    }

    if (!(widgetsContext instanceof WidgetsContext)) {
        // Assume that the provided "widgetsContext" argument is
        // actually an AsyncWriter
        var asyncWriter = widgetsContext;
        if (!asyncWriter.global) {
            throw new Error('Invalid argument: ' + widgetsContext);
        }

        widgetsContext = WidgetsContext.getWidgetsContext(asyncWriter);
    }

    var widgets = widgetsContext.getWidgets();

    if (!widgets || !widgets.length) {
        return;
    }

    var ids = '';

    var commaRequired = false;

    function writeWidget(widget) {

        if (widget.children.length) {
            // Depth-first search (children should be initialized before parent)
            writeWidgets(widget.children);
        }

        if (commaRequired) {
            ids += ',';
        } else {
            commaRequired = true;
        }

        ids += widget.id;
    }

    function writeWidgets(widgets) {
        for (var i = 0, len = widgets.length; i < len; i++) {
            writeWidget(widgets[i]);
        }
    }

    writeWidgets(widgets);

    return '$rwidgets("' + ids + '");';
};

exports.getClientWidgetPath = function(targetModuleFile, from) {
    var resolved = raptorModulesResolver.resolveRequire(targetModuleFile, from);
    return resolved.logicalPath;
};

var dynamicClientWidgetPathCache = {};

exports.getDynamicClientWidgetPath = function(targetModuleFile) {
    var clientPath = dynamicClientWidgetPathCache[targetModuleFile];
    if (!clientPath) {
        var resolved = raptorModulesUtil.getPathInfo(targetModuleFile);
        clientPath = dynamicClientWidgetPathCache[targetModuleFile] = resolved.logicalPath;
    }
    return clientPath;
};

exports.makeRenderable = exports.renderable = raptorRenderer.renderable;
exports.render = raptorRenderer.render;

exports.defineWidget = require('./defineWidget');
exports.defineRenderer = require('./defineRenderer');
},{"./WidgetsContext":11,"./bubble":13,"./defineRenderer":14,"./defineWidget":15,"./uniqueId":21,"raptor-json/stringify":33,"raptor-modules/resolver":38,"raptor-modules/util":49,"raptor-renderer":57}],19:[function(require,module,exports){

var registered = {};

exports.register = function(path, type) {
    registered[path] = type;
};

var loaded = {};
var widgetTypes = {};

function load(path) {
    var target = loaded[path];
    if (target === undefined) {
        target = registered[path];
        if (!target) {
            target = require(path); // Assume the path has been fully resolved already
        }
        loaded[path] = target || null;
    }

    if (target == null) {
        throw new Error('Unable to load: ' + path);
    }
    return target;
}

function getWidgetClass(path) {
    var WidgetClass = widgetTypes[path];

    if (WidgetClass) {
        return WidgetClass;
    }

    WidgetClass = load(path);

    var renderer;


    if (WidgetClass.Widget) {
        WidgetClass = WidgetClass.Widget;
        renderer = WidgetClass.renderer;
    }

    WidgetClass = defineWidget(WidgetClass);

    if (renderer) {
        WidgetClass.renderer = WidgetClass.prototype.renderer = renderer;
    }

    widgetTypes[path] = WidgetClass;

    return WidgetClass;
}

exports.load = load;

exports.createWidget = function(path, id) {
    var WidgetClass = getWidgetClass(path);
    var widget;
    if (typeof WidgetClass === 'function') {
        // The widget is a constructor function that we can invoke to create a new instance of the widget
        widget = new WidgetClass(id);
    } else if (WidgetClass.initWidget) {
        widget = WidgetClass;
    }
    return widget;
};

var defineWidget = require('./defineWidget');
},{"./defineWidget":15}],20:[function(require,module,exports){
function RepeatedId() {
    this.nextIdLookup = {};
}

RepeatedId.prototype = {
    nextId: function(parentId, id) {
        var indexLookupKey = parentId + '-' + id;
        var currentIndex = this.nextIdLookup[indexLookupKey];
        if (currentIndex == null) {
            currentIndex = this.nextIdLookup[indexLookupKey] = 0;
        } else {
            currentIndex = ++this.nextIdLookup[indexLookupKey];
        }
        return id.slice(0, -2) + '[' + currentIndex + ']';
    }
};

exports.nextId = function(out, parentId, id) {
    var repeatedId = out.global.__repeatedId;
    if (repeatedId == null) {
        repeatedId = out.global.__repeatedId = new RepeatedId();
    }

    return repeatedId.nextId(parentId, id);
};

},{}],21:[function(require,module,exports){
function IdProvider(out) {
    var global = this.global = out.global;
    this.prefix = global.widgetIdPrefix || 'w';

    if (global._nextWidgetId == null) {
        global._nextWidgetId = 0;
    }
}

IdProvider.prototype.nextId = function() {
    return this.prefix + (this.global._nextWidgetId++);
};

module.exports = function (out) {
    var global = out.global;
    var idProvider = global._widgetIdProvider ||
        (global._widgetIdProvider = new IdProvider(out));

    return idProvider.nextId();
};
},{}],22:[function(require,module,exports){
(function (process){
var DataHolder = require('raptor-async/DataHolder');

var afterUpdateDataHolder = null;

var widgetUpdateQueue = null;
var batchUpdateStarted = false;
var afterUpdateDataHolder = null;
var updatesScheduled = false;

function scheduleUpdates() {
    if (updatesScheduled || batchUpdateStarted) {
        return;
    }

    updatesScheduled = true;

    process.nextTick(function() {
        updateWidgets();
    });
}

function onAfterUpdate(callback) {
    scheduleUpdates();

    if (!afterUpdateDataHolder) {
        afterUpdateDataHolder = new DataHolder();
    }

    afterUpdateDataHolder.done(callback);
}

function updateWidgets() {
    // console.log('Updating widgets BEGIN - ', widgetUpdateQueue ? widgetUpdateQueue.length : 0);
    try {
        if (widgetUpdateQueue) {
            for (var i=0; i<widgetUpdateQueue.length; i++) {
                var widget = widgetUpdateQueue[i];
                widget.__updateQueued = false;
                // console.log('Updating widget: ' + widget.id);
                widget.update();
            }
        }
    } finally {
        // console.log('Updating widgets END');
        widgetUpdateQueue = null;
        updatesScheduled = false;
        batchUpdateStarted = false;

        if (afterUpdateDataHolder) {
            afterUpdateDataHolder.resolve();
            afterUpdateDataHolder = null;
        }
    }
}

function batchUpdate(func) {
    var isOuter = updatesScheduled === false && batchUpdateStarted === false;
    batchUpdateStarted = true;

    // if (isOuter) {
    //     console.log('Batch update BEGIN');
    // }

    try {
        func();
    } finally {
        if (isOuter) {
            updateWidgets();
        }
    }
}

function queueWidgetUpdate(widget) {
    if (widget.__updateQueued) {
        return;
    }

    widget.__updateQueued = true;


    scheduleUpdates();

    // console.log('Queuing widget update: ', widget.id);

    if (widgetUpdateQueue) {
        widgetUpdateQueue.push(widget);
    } else {
        widgetUpdateQueue = [widget];
    }
}

exports.queueWidgetUpdate = queueWidgetUpdate;
exports.batchUpdate = batchUpdate;
exports.onAfterUpdate = onAfterUpdate;
}).call(this,require('_process'))
},{"_process":6,"raptor-async/DataHolder":29}],23:[function(require,module,exports){
var INDEX_EVENT = 0;
var INDEX_LISTENER = 1;

function EventEmitterWrapper(target) {
    this._target = target;
    this._listeners = [];
}

EventEmitterWrapper.prototype = {
    _proxy: function(type, event, listener) {
        this._target[type](event, listener);
        this._listeners.push([event, listener]);
        return this;
    },

    _remove: function(test) {
        var target = this._target;
        var listeners = this._listeners;

        this._listeners = listeners.filter(function(listener) {
            var event = listener[INDEX_EVENT];
            var listenerFunc = listener[INDEX_LISTENER];

            if (test(event, listenerFunc)) {
                target.removeListener(event, listenerFunc);
                return false;

            } else {
                return true;
            }
        });
    },

    on: function(event, listener) {
        return this._proxy('on', event, listener);
    },

    once: function(event, listener) {
        return this._proxy('once', event, listener);
    },

    removeListener: function(event, listener) {
        if (typeof event === 'function') {
            listener = event;
            event = null;
        }

        if (listener && event) {
            this._remove(function(curEvent, curListener) {
                return event === curEvent && listener === curListener;
            });
        } else if (listener) {
            this._remove(function(curEvent, curListener) {
                return listener === curListener;
            });
        } else if (event) {
            this.removeAllListeners(event);
        }

        return this;
    },

    removeAllListeners: function(event) {

        var listeners = this._listeners;
        var target = this._target;

        if (event) {
            this._remove(function(curEvent, curListener) {
                return event === curEvent;
            });
        } else {
            for (var i = listeners.length - 1; i >= 0; i--) {
                var cur = listeners[i];
                target.removeListener(cur[INDEX_EVENT], cur[INDEX_LISTENER]);
            }
            this._listeners.length = 0;
        }

        return this;
    }
};

EventEmitterWrapper.prototype.addListener = EventEmitterWrapper.prototype.on;

function SubscriptionTracker() {
    this._subscribeToList = [];
}

SubscriptionTracker.prototype = {

    subscribeTo: function(target) {
        var wrapper;
        var subscribeToList = this._subscribeToList;

        for (var i=0, len=subscribeToList.length; i<len; i++) {
            var cur = subscribeToList[i];
            if (cur._target === target) {
                wrapper = cur;
                break;
            }
        }

        if (!wrapper) {
            wrapper = new EventEmitterWrapper(target);
            wrapper.once('destroy', function() {
                wrapper.removeAllListeners();

                for (var i = subscribeToList.length - 1; i >= 0; i--) {
                    if (subscribeToList[i]._target === target) {
                        subscribeToList.splice(i, 1);
                        break;
                    }
                }
            });
            subscribeToList.push(wrapper);
        }

        return wrapper;
    },

    removeAllListeners: function(target, event) {
        var subscribeToList = this._subscribeToList;
        var i;

        if (target) {
            for (i = subscribeToList.length - 1; i >= 0; i--) {
                var cur = subscribeToList[i];
                if (cur._target === target) {
                    cur.removeAllListeners(event);

                    if (!cur._listeners.length) {
                        // Do some cleanup if we removed all
                        // listeners for the target event emitter
                        subscribeToList.splice(i, 1);
                    }

                    break;
                }
            }
        } else {

            for (i = subscribeToList.length - 1; i >= 0; i--) {
                subscribeToList[i].removeAllListeners();
            }
            subscribeToList.length = 0;
        }
    }
};

exports.wrap = function(targetEventEmitter) {
    var wrapper = new EventEmitterWrapper(targetEventEmitter);
    targetEventEmitter.once('destroy', function() {
        wrapper._listeners.length = 0;
    });
    return wrapper;
};

exports.createTracker = function() {
    return new SubscriptionTracker();
};
},{}],24:[function(require,module,exports){
(function (process){
/*
 * Copyright 2011 eBay Software Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function StringBuilder() {
    this.str = '';
}

StringBuilder.prototype = {
    write: function(str) {
        this.str += str;
        return this;
    },

    /**
     * Converts the string buffer into a String.
     *
     * @returns {String} The built String
     */
    toString: function() {
        return this.str;
    }
};

/**
 * Simple wrapper that can be used to wrap a stream
 * to reduce the number of write calls. In Node.js world,
 * each stream.write() becomes a chunk. We can avoid overhead
 * by reducing the number of chunks by buffering the output.
 */
function BufferedWriter(wrappedStream) {
    this._buffer = '';
    this._wrapped = wrappedStream;
}

BufferedWriter.prototype = {
    write: function(str) {
        this._buffer += str;
    },

    flush: function() {
        if (this._buffer.length !== 0) {
            this._wrapped.write(this._buffer);
            this._buffer = '';
            if (this._wrapped.flush) {
                this._wrapped.flush();
            }
        }
    },

    end: function() {
        this.flush();
        if(!this._wrapped.isTTY) {
            this._wrapped.end();
        }
    },
    on: function(event, callback) {
        return this._wrapped.on(event, callback);
    },
    once: function(event, callback) {
        return this._wrapped.once(event, callback);
    },
    emit: function() {
        var wrappedStream = this._wrapped;
        return wrappedStream.emit.apply(wrappedStream);
    }
};

var EventEmitter = require('events').EventEmitter;

var includeStack = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

var voidWriter = {
    write: function() {}
};

function onProxy(asyncWriter, type, event, callback) {
    var global = asyncWriter.global;
    var events = asyncWriter._events;
    var async = asyncWriter._async;

    // Writable streams are only suppose to emit "finish" but
    // "through" streams (from the "through" module) only output
    // "end" event. Therefore, we need to normalize "end" and "finish"
    // events
    if (event === 'finish') {
        if (async.finished) {
            callback();
            return asyncWriter;
        }

        var emitted = false;

        var onFinish = function() {
            if (emitted) {
                return;
            }

            emitted = true;
            callback();
        };

        events[type]('end', onFinish);
        events[type]('finish', onFinish);
    } else {
        events[type](event, callback);
    }

    return asyncWriter;
}

function Fragment(asyncWriter) {
    this.asyncWriter = asyncWriter;
    // The asyncWriter that this async fragment is associated with
    this.writer = asyncWriter.writer;
    // The original writer this fragment was associated with
    this.finished = false;
    // Used to keep track if this async fragment was ended
    this.flushed = false;
    // Set to true when the contents of this async fragment have been
    // flushed to the original writer
    this.next = null;
    // A link to the next sibling async fragment (if any)
    this.ready = true;    // Will be set to true if this fragment is ready to be flushed
                          // (i.e. when there are no async fragments preceeding this fragment)
}
function flushNext(fragment, writer) {
    var next = fragment.next;
    if (next) {
        next.ready = true;
        // Since we have flushed the next fragment is ready
        next.writer = next.asyncWriter.writer = writer;
        // Update the next fragment to use the original writer
        next.flush();    // Now flush the next fragment (if it is not finish then it will just do nothing)
    }
}
function BufferedFragment(asyncWriter, buffer) {
    Fragment.call(this, asyncWriter);
    this.buffer = buffer;
}
BufferedFragment.prototype = {
    flush: function () {
        var writer = this.writer;
        var bufferedString = this.buffer.toString();

        if (bufferedString.length !== 0) {
            writer.write(bufferedString);
        }

        this.flushed = true;
        flushNext(this, writer);
    }
};

function AsyncFragment(asyncWriter) {
    Fragment.call(this, asyncWriter);
}

AsyncFragment.prototype = {
    end: function () {
        if (!this.finished) {
            // Make sure end is only called once by the user
            this.finished = true;

            if (this.ready) {
                // There are no nested asynchronous fragments that are
                // remaining and we are ready to be flushed then let's do it!
                this.flush();
            }
        }
    },
    flush: function () {
        if (!this.finished) {
            // Skipped Flushing since not finished
            return;
        }
        this.flushed = true;
        var writer = this.writer;
        this.writer = this.asyncWriter.writer = voidWriter; // Prevent additional out-of-order writes
        flushNext(this, writer);
    }
};

function AsyncWriter(writer, global, async, buffer) {
    this.data = {};
    this.global = this.attributes /* legacy */ = global || (global = {});
    this._af = this._prevAF = this._parentAF = null;
    this._isSync = false;
    this._last = null;

    if (!global.events) {
        // Use the underlying stream as the event emitter if available.
        // Otherwise, create a new event emitter
        global.events = writer && writer.on ? writer : new EventEmitter();
    }

    this._events = global.events;

    if (async) {
        this._async = async;
    } else {
        this._async = global.async || (global.async = {
            remaining: 0,
            ended: false,
            last: 0,
            finished: false
        });
    }

    var stream;

    if (!writer) {
        writer = new StringBuilder();
    } else if (buffer) {
        stream = writer;
        writer = new BufferedWriter(writer);
    }

    this.stream = stream || writer;
    this.writer = this._stream = writer;
}

AsyncWriter.DEFAULT_TIMEOUT = 10000;

AsyncWriter.prototype = {
    constructor: AsyncWriter,

    isAsyncWriter: AsyncWriter,

    sync: function() {
        this._isSync = true;
    },
    getAttributes: function () {
        return this.global;
    },
    getAttribute: function (name) {
        return this.global[name];
    },
    write: function (str) {
        if (str != null) {
            this.writer.write(str.toString());
        }
        return this;
    },
    getOutput: function () {
        return this.writer.toString();
    },
    captureString: function (func, thisObj) {
        var sb = new StringBuilder();
        this.swapWriter(sb, func, thisObj);
        return sb.toString();
    },
    swapWriter: function (newWriter, func, thisObj) {
        var oldWriter = this.writer;
        this.writer = newWriter;
        func.call(thisObj);
        this.writer = oldWriter;
    },
    createNestedWriter: function (writer) {
        var _this = this;
        var child = new AsyncWriter(writer, _this.global);
        // Keep a reference to the original stream. This was done because when
        // rendering to a response stream we can get access to the request/response
        // to figure out the locale and other information associated with the
        // client. Without this we would have to rely on the request being
        // passed around everywhere or rely on something like continuation-local-storage
        // which has shown to be unreliable in some situations.
        child._stream = _this._stream; // This is the original stream or the stream wrapped with a BufferedWriter
        child.stream = _this.stream; // HACK: This is the user assigned stream and not the stream
                                     //       that was wrapped with a BufferedWriter.
        return child;
    },
    beginAsync: function (options) {
        if (this._isSync) {
            throw new Error('beginAsync() not allowed when using renderSync()');
        }

        var ready = true;

        // Create a new asyncWriter that the async fragment can write to.
        // The new async asyncWriter will use the existing writer and
        // the writer for the current asyncWriter (which will continue to be used)
        // will be replaced with a string buffer writer
        var asyncOut = this.createNestedWriter(this.writer);
        var buffer = this.writer = new StringBuilder();
        var asyncFragment = new AsyncFragment(asyncOut);
        var bufferedFragment = new BufferedFragment(this, buffer);
        asyncFragment.next = bufferedFragment;
        asyncOut._af = asyncFragment;
        asyncOut._parentAF = asyncFragment;
        var prevAsyncFragment = this._prevAF || this._parentAF;
        // See if we are being buffered by a previous asynchronous
        // fragment
        if (prevAsyncFragment) {
            // Splice in our two new fragments and add a link to the previous async fragment
            // so that it can let us know when we are ready to be flushed
            bufferedFragment.next = prevAsyncFragment.next;
            prevAsyncFragment.next = asyncFragment;
            if (!prevAsyncFragment.flushed) {
                ready = false;    // If we are preceeded by another async fragment then we aren't ready to be flushed
            }
        }
        asyncFragment.ready = ready;
        // Set the ready flag based on our earlier checks above
        this._prevAF = bufferedFragment;
        // Record the previous async fragment for linking purposes


        asyncOut.handleBeginAsync(options, this);

        return asyncOut;
    },

    handleBeginAsync: function(options, parent) {
        var _this = this;

        var async = _this._async;

        var timeout;
        var name;

        async.remaining++;

        if (options != null) {
            if (typeof options === 'number') {
                timeout = options;
            } else {
                timeout = options.timeout;

                if (options.last === true) {
                    if (timeout == null) {
                        // Don't assign a timeout to last flush fragments
                        // unless it is explicitly given a timeout
                        timeout = 0;
                    }

                    async.last++;
                }

                name = options.name;
            }
        }

        if (timeout == null) {
            timeout = AsyncWriter.DEFAULT_TIMEOUT;
        }

        _this.stack = includeStack ? new Error().stack : null;
        _this.name = name;

        if (timeout > 0) {
            _this._timeoutId = setTimeout(function() {
                _this.error(new Error('Async fragment ' + (name ? '(' + name + ') ': '') + 'timed out after ' + timeout + 'ms'));
            }, timeout);
        }

        this._events.emit('beginAsync', {
            writer: this,
            parentWriter: parent
        });
    },
    on: function(event, callback) {
        return onProxy(this, 'on', event, callback);
    },

    once: function(event, callback) {
        return onProxy(this, 'once', event, callback);
    },

    onLast: function(callback) {
        var lastArray = this._last;

        if (!lastArray) {
            lastArray = this._last = [];
            var i = 0;
            var next = function next() {
                if (i === lastArray.length) {
                    return;
                }
                var _next = lastArray[i++];
                _next(next);
            };

            this.once('last', function() {
                next();
            });
        }

        lastArray.push(callback);
    },

    emit: function(arg) {
        var events = this._events;
        switch(arguments.length) {
            case 0:
                events.emit();
                break;
            case 1:
                events.emit(arg);
                break;
            default:
                events.emit.apply(events, arguments);
                break;
        }

        return this;
    },

    removeListener: function() {
        var events = this._events;
        events.removeListener.apply(events, arguments);
        return this;
    },

    pipe: function(stream) {
        this._stream.pipe(stream);
        return this;
    },

    error: function(e) {
        try {
            var stack = this.stack;
            var name = this.name;
            e = new Error('Async fragment failed' + (name ? ' (' + name + ')': '') + '. Exception: ' + (e.stack || e) + (stack ? ('\nCreation stack trace: ' + stack) : ''));
            this.emit('error', e);
        } finally {
             this.end();
        }
    },

    end: function(data) {
        if (data) {
            this.write(data);
        }

        var asyncFragment = this._af;

        if (asyncFragment) {
            asyncFragment.end();
            this.handleEnd(true);
        } else {
            this.handleEnd(false);
        }

        return this;
    },

    handleEnd: function(isAsync) {
        var async = this._async;


        if (async.finished) {
            return;
        }

        var remaining;

        if (isAsync) {
            var timeoutId = this._timeoutId;
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            remaining = --async.remaining;
        } else {
            remaining = async.remaining;
            async.ended = true;
        }

        if (async.ended) {
            if (!async.lastFired && async.remaining - async.last === 0) {
                async.lastFired = true;
                async.last = 0;
                this._events.emit('last');
            }

            if (remaining === 0) {
                async.finished = true;
                this._finish();
            }
        }
    },

    _finish: function() {
        if (this._stream.end) {
            this._stream.end();
        } else {
            this._events.emit('finish');
        }
    },

    flush: function() {
        if (!this._async.finished) {
            var stream = this._stream;
            if (stream && stream.flush) {
                stream.flush();
            }
        }
    }
};

AsyncWriter.prototype.w = AsyncWriter.prototype.write;

AsyncWriter.enableAsyncStackTrace = function() {
    includeStack = true;
};

module.exports = AsyncWriter;

}).call(this,require('_process'))
},{"_process":6,"events":3}],25:[function(require,module,exports){
/*
 * Copyright 2011 eBay Software Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * This module provides the runtime for rendering compiled templates.
 *
 *
 * <p>The code for the Marko compiler is kept separately
 * in the {@link raptor/templating/compiler} module.
 */
var AsyncWriter = require('./AsyncWriter');

exports.create = function (writer, options) {
    var global;
    var buffer;

    if (options) {
        global = options.global;
        buffer = options.buffer === true;
    }

    var asyncWriter = new AsyncWriter(writer, null, null, buffer);    //Create a new context using the writer provided
    if (global) {
        asyncWriter.global = asyncWriter.attributes = global;
    }
    return asyncWriter;
};

exports.enableAsyncStackTrace = function() {
    AsyncWriter.INCLUDE_STACK = true;
};

exports.AsyncWriter = AsyncWriter;

},{"./AsyncWriter":24}],26:[function(require,module,exports){
var escapeXml = require('raptor-util/escapeXml');
var escapeXmlAttr = escapeXml.attr;
var runtime = require('./'); // Circular dependnecy, but that is okay
var extend = require('raptor-util/extend');
var attr = require('raptor-util/attr');
var attrs = require('raptor-util/attrs');
var forEach = require('raptor-util/forEach');
var markoRegExp = /\.marko(.xml|.html)?$/;
var req = require;
var arrayFromArguments = require('raptor-util/arrayFromArguments');
var logger = require('raptor-logging').logger(module);

function notEmpty(o) {
    if (o == null) {
        return false;
    } else if (Array.isArray(o)) {
        return !!o.length;
    } else if (o === '') {
        return false;
    }

    return true;
}

var WARNED_INVOKE_BODY = 0;

module.exports = {
    s: function(str) {
        return (str == null) ? '' : str;
    },

    fv: function (array, callback) {
        if (!array) {
            return;
        }
        if (!array.forEach) {
            array = [array];
        }
        var i = 0;
        var len = array.length;
        var loopStatus = {
                getLength: function () {
                    return len;
                },
                isLast: function () {
                    return i === len - 1;
                },
                isFirst: function () {
                    return i === 0;
                },
                getIndex: function () {
                    return i;
                }
            };
        for (; i < len; i++) {
            var o = array[i];
            callback(o || '', loopStatus);
        }
    },
    f: forEach,
    fl: function (array, func) {
        if (array != null) {
            if (!Array.isArray(array)) {
                array = [array];
            }
            func(array, 0, array.length);
        }
    },
    fp: function (o, func) {
        if (!o) {
            return;
        }
        for (var k in o) {
            if (o.hasOwnProperty(k)) {
                func(k, o[k]);
            }
        }
    },
    e: function (o) {
        return !notEmpty(o);
    },
    ne: notEmpty,
    x: escapeXml,
    xa: escapeXmlAttr,
    nx: function (str) {
        return {
            toString: function () {
                return str;
            }
        };
    },
    a: attr,

    as: attrs,

    /**
     * Loads a template
     */
    l: function(path) {
        if (typeof path === 'string') {
            if (markoRegExp.test(path)) {
                return runtime.load(path);
            } else {
                return req('view-engine').load(path);
            }
        } else if (path.render) {
            // Assume it is already a pre-loaded template
            return path;
        } else {
            return runtime.load(path);
        }
    },
    /**
     * Returns the render function for a tag handler
     */
    r: function(handler) {
        var renderFunc = handler.renderer || handler.render || handler;

        if (typeof renderFunc !== 'function') {
            throw new Error('Invalid tag handler: ' + handler);
        }

        return renderFunc;
    },

    // ----------------------------------
    // Helpers that require an out below:
    // ----------------------------------


    /**
     * Invoke a tag handler render function
     */
    t: function (out, renderFunc, input, body, hasOutParam) {
        if (!input) {
            input = {};
        }

        if (body) {
            input.renderBody = body;
            input.invokeBody = function() {
                if (!WARNED_INVOKE_BODY) {
                    WARNED_INVOKE_BODY = 1;
                    logger.warn('invokeBody(...) deprecated. Use renderBody(out) instead.', new Error().stack);
                }

                if (!hasOutParam) {
                    var args = arrayFromArguments(arguments);
                    args.unshift(out);
                    body.apply(this, args);
                } else {
                    body.apply(this, arguments);
                }
            };
        }

        renderFunc(input, out);
    },
    c: function (out, func) {
        var output = out.captureString(func);
        return {
            toString: function () {
                return output;
            }
        };
    },
    i: function(out, path, data) {
        if (!path) {
            return;
        }

        if (data.body) {
            data.invokeBody = function() {
                if (!WARNED_INVOKE_BODY) {
                    WARNED_INVOKE_BODY = 1;
                    logger.warn('data.invokeBody() deprecated. Use data.body instead.', new Error().stack);
                }
                return data.body;
            };
        }

        if (typeof path === 'string') {
            runtime.render(path, data, out);
        } else if (typeof path.render === 'function') {
            path.render(data, out);
        } else {
            throw new Error('Invalid template');
        }

        return this;
    },
    xt: extend
};

},{"./":28,"raptor-logging":34,"raptor-util/arrayFromArguments":62,"raptor-util/attr":63,"raptor-util/attrs":64,"raptor-util/escapeXml":66,"raptor-util/extend":67,"raptor-util/forEach":68}],27:[function(require,module,exports){
module.exports = function load(templatePath) {
    // We make the assumption that the template path is a 
    // fully resolved module path and that the module exists
    // as a CommonJS module
    return require(templatePath);
};
},{}],28:[function(require,module,exports){
/*
 * Copyright 2011 eBay Software Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * This module provides the lightweight runtime for loading and rendering
 * templates. The compilation is handled by code that is part of the
 * [marko/compiler](https://github.com/raptorjs/marko/tree/master/compiler)
 * module. If rendering a template on the client, only the runtime is needed
 * on the client and not the compiler
 */

// async-writer provides all of the magic to support asynchronous
// rendering to a stream
var asyncWriter = require('async-writer');

// helpers can the core set of utility methods
// that are available in every template (empty, notEmpty, etc.)
var helpers = require('./helpers');

var loader;

// If the optional "stream" module is available
// then Readable will be a readable stream
var Readable;

var AsyncWriter = asyncWriter.AsyncWriter;
var extend = require('raptor-util/extend');

exports.AsyncWriter = AsyncWriter;

var stream;
var STREAM = 'stream';

var streamPath;
try {
    streamPath = require.resolve(STREAM);
} catch(e) {}

if (streamPath) {
    stream = require(streamPath);
}

function Template(renderFunc, options) {
    this._ = renderFunc;
    this.buffer = !options || options.buffer !== false;
}

Template.prototype = {
    renderSync: function(data) {
        var out = new AsyncWriter();
        out.sync();

        if (data.$global) {
            out.global = extend(out.global, data.$global);
            delete data.$global;
        }

        this._(data, out);
        out.end();
        return out.getOutput();
    },
    /**
     * Renders a template to either a stream (if the last
     * argument is a Stream instance) or
     * provides the output to a callback function (if the last
     * argument is a Function).
     *
     * @param  {Object} data The view model data for the template
     * @param  {AsyncWriter} out A Stream or an AsyncWriter instance
     * @param  {Function} callback A callback function
     * @return {AsyncWriter} Returns the AsyncWriter instance that the template is rendered to
     */
    render: function(data, out) {
        // NOTE: We create new vars here to avoid a V8 de-optimization due
        //       to the following:
        //       Assignment to parameter in arguments object
        var finalOut = out;
        var finalData = data || {};

        var renderFunc = this._;

        // callback is last argument if provided
        var callback = arguments[arguments.length - 1];

        var shouldEnd = false;

        if (typeof callback === 'function') {
            if (arguments.length === 2) {
                // render called with data and callback,
                // we need to create the "out"
                finalOut = null;
            }

            if (!finalOut || !finalOut.isAsyncWriter) {
                finalOut = new AsyncWriter(finalOut);
                shouldEnd = true;
            }

            finalOut.on('finish', function() {
                callback(null, finalOut.getOutput(), finalOut);
            });

            finalOut.once('error', callback);
        } else if (!finalOut || !finalOut.isAsyncWriter) {
            var stream = finalOut;
            // Assume the "finalOut" is really a stream
            //
            // By default, we will buffer rendering to a stream to prevent
            // the response from being "too chunky".
            var options = this.buffer ? { buffer: true } : null;
            finalOut = asyncWriter.create(stream, options);
            shouldEnd = true;
        }

        if (finalData.$global) {
            finalOut.global = extend(finalOut.global, finalData.$global);
            delete finalData.$global;
        }

        renderFunc(finalData, finalOut);

        // Automatically end output stream (the writer) if we
        // had to create an async writer (which might happen
        // if the caller did not provide a writer/out or the
        // writer/out was not an AsyncWriter).
        //
        // If out parameter was originally an AsyncWriter then
        // we assume that we are writing to output that was
        // created in the context of another rendering job.
        if (shouldEnd) {
            finalOut.end();
        }

        return finalOut;
    },
    stream: function(data) {
        if (!stream) {
            throw new Error('Module not found: stream');
        }

        return new Readable(this, data, this.buffer);
    }
};

if (stream) {
    Readable = function(template, data, buffer) {
        Readable.$super.call(this);
        this._t = template;
        this._d = data;
        this._buffer = buffer;
        this._rendered = false;
    };

    Readable.prototype = {
        write: function(data) {
            if (data != null) {
                this.push(data);
            }
        },
        end: function() {
            this.push(null);
        },
        _read: function() {
            if (this._rendered) {
                return;
            }

            this._rendered = true;

            var template = this._t;
            var data = this._d;

            var out = asyncWriter.create(this, this._buffer ? { buffer: true } : null);
            template.render(data, out);
            out.end();
        }
    };

    require('raptor-util/inherit')(Readable, stream.Readable);
}

function load(templatePath, options) {
    var cache = exports.cache;

    if (!templatePath) {
        throw new Error('"templatePath" is required');
    }

    var template;

    if (typeof templatePath === 'string') {
        template = cache[templatePath];
        if (!template) {
            // The template has not been loaded, load the template to get
            // access to the factory function that is used to produce
            // the actual compiled template function. We pass the helpers
            // as the first argument to the factory function to produce
            // the compiled template function
            template = cache[templatePath] = new Template(
                loader(templatePath).create(helpers), // Load the template factory and invoke it
                options);
        }
    } else {
        // Instead of a path, assume we got a compiled template module
        // We store the loaded template with the factory function that was
        // used to get access to the compiled template function
        template = templatePath._ || (templatePath._ = new Template(templatePath.create(helpers), options));
    }

    return template;
}

exports.load = load;

exports.render = function (templatePath, data, out) {
    return load(templatePath).render(data, out);
};

exports.stream = function(templatePath, data) {
    return load(templatePath).stream(data);
};

exports.cache = {};

exports.createWriter = function(writer) {
    return new AsyncWriter(writer);
};

exports.helpers = helpers;

exports.Template = Template;

// The loader is used to load templates that have not already been
// loaded and cached. On the server, the loader will use
// the compiler to compile the template and then load the generated
// module file using the Node.js module loader
loader = require('./loader');
},{"./helpers":26,"./loader":27,"async-writer":25,"raptor-util/extend":67,"raptor-util/inherit":70}],29:[function(require,module,exports){
// NOTE: Be careful if these numeric values are changed
//       because some of the logic is based on an assumed
//       sequencial order.
var STATE_INITIAL = 0;
var STATE_LOADING = 1;
var STATE_RESOLVED = 2;
var STATE_REJECTED = 3;

var now = Date.now || function() {
    return (new Date()).getTime();
};

function DataHolder(options) {

    /**
     * The data that was provided via call to resolve(data).
     * This property is assumed to be public and available for inspection.
     */
    this.data = undefined;

    /**
     * The data that was provided via call to reject(err)
     * This property is assumed to be public and available for inspection.
     */
    this.error = undefined;

    /**
     * The queue of callbacks that are waiting for data
     */
    this._callbacks = undefined;

    /**
     * The state of the data holder (STATE_INITIAL, STATE_RESOLVED, or STATE_REJECTED)
     */
    this._state = STATE_INITIAL;

    /**
     * The point in time when this data provider was settled.
     */
    this._timestamp = undefined;

    if (options) {
        /**
         * An optional function that will be invoked to load the data
         * the first time data is requested.
         */
        this._loader = options.loader;

        /**
         * The "this" object that will be used when invoking callbacks and loaders.
         * NOTE: Some callbacks may have provided their own scope and that will be used
         *       instead of this scope.
         */
        this._scope = options.scope;

        /**
         * Time-to-live (in milliseconds).
         * A data holder can automatically invalidate it's held data or error after a preset period
         * of time. This should be used in combination of a loader. This is helpful in cases
         * where a data holder is used for caching purposes.
         */
        this._ttl = options.ttl || undefined;
    }
}

function notifyCallbacks(dataHolder, err, data) {
    var callbacks = dataHolder._callbacks;
    if (callbacks !== undefined) {
        // clear out the registered callbacks (we still have reference to the original value)
        dataHolder._callbacks = undefined;

        // invoke all of the callbacks and use their scope
        for (var i = 0; i < callbacks.length; i++) {
            // each callback is actually an object with "scope and "callback" properties
            var callbackInfo = callbacks[i];
            callbackInfo.callback.call(callbackInfo.scope, err, data);
        }
    }
}

function invokeLoader(dataProvider) {
    // transition to the loading state
    dataProvider._state = STATE_LOADING;

    // call the loader
    dataProvider._loader.call(dataProvider._scope || dataProvider, function (err, data) {
        if (err) {
            // reject with error
            dataProvider.reject(err);
        } else {
            // resolve with data
            dataProvider.resolve(data);
        }
    });
}

function addCallback(dataProvider, callback, scope) {
    if (dataProvider._callbacks === undefined) {
        dataProvider._callbacks = [];
    }

    dataProvider._callbacks.push({
        callback: callback,
        scope: scope || dataProvider._scope || dataProvider
    });
}

function isExpired(dataProvider) {
    var timeToLive = dataProvider._ttl;
    if ((timeToLive !== undefined) && ((now() - dataProvider._timestamp) > timeToLive)) {
        // unsettle the data holder if we find that it is expired
        dataProvider.unsettle();
        return true;
    } else {
        return false;
    }
}

DataHolder.prototype = {

    /**
     * Has resolved function been called?
     */
    isResolved: function() {

        return (this._state === STATE_RESOLVED) && !isExpired(this);
    },

    /**
     * Has reject function been called?
     */
    isRejected: function() {
        return (this._state === STATE_REJECTED) && !isExpired(this);
    },

    /**
     * Is there an outstanding request to load data via loader?
     */
    isLoading: function() {
        return (this._state === STATE_LOADING);
    },

    /**
     * Has reject or resolve been called?
     *
     * This method will also do time-to-live checks if applicable.
     * If this data holder was settled prior to calling this method
     * but the time-to-live has been exceeded then the state will
     * returned to unsettled state and this method will return false.
     */
    isSettled: function() {
        // are we in STATE_RESOLVED or STATE_REJECTED?
        return (this._state > STATE_LOADING) && !isExpired(this);
    },

    /**
     * Trigger loading data if we have a loader and we are not already loading.
     * Even if a data holder is in a resolved or rejected state, load can be called
     * to get a new value.
     *
     * @return the resolved data (if loader synchronously calls resolve)
     */
    load: function(callback, scope) {
        if (!this._loader) {
            throw new Error('Cannot call load when loader is not configured');
        }

        if (this.isSettled()) {
            // clear out the old data and error
            this.unsettle();
        }

        // callback is optional for load call
        if (callback) {
            addCallback(this, callback, scope);
        }

        if (this._state !== STATE_LOADING) {
            // trigger the loading
            invokeLoader(this);
        }

        return this.data;
    },

    /**
     * Adds a callback to the queue. If there is not a pending request to load data
     * and we have a "loader" then we will use that loader to request the data.
     * The given callback will be invoked when there is an error or resolved data
     * available.
     */
    done: function (callback, scope) {
        if (!callback || (callback.constructor !== Function)) {
            throw new Error('Invalid callback: ' + callback);
        }

        // Do we already have data or error?
        if (this.isSettled()) {
            // invoke the callback immediately
            return callback.call(scope || this._scope || this, this.error, this.data);
        }

        addCallback(this, callback, scope);

        // only invoke loader if we have loader and we are not currently loading value
        if (this._loader && (this._state !== STATE_LOADING)) {
            invokeLoader(this);
        }
    },

    /**
     * This method will trigger any callbacks to be notified of rejection (error).
     * If this data holder has a loader then the data holder will be returned to
     * its initial state so that any future requests to load data will trigger a
     * new load call.
     */
    reject: function(err) {
        // remember the error
        this.error = err;

        // clear out the data
        this.data = undefined;

        // record timestamp of when we were settled
        if (this._ttl !== undefined) {
            this._timestamp = now();
        }

        // Go to the rejected state if we don't have a loader.
        // If we do have a loader then return to the initial state
        // (we do this so that next call to done() will trigger load
        // again in case the error was transient).
        this._state = this._loader ? STATE_INITIAL : STATE_REJECTED;
        
        // always notify callbacks regardless of whether or not we return to the initial state
        notifyCallbacks(this, err, null);
    },

    /**
     * This method will trigger any callbacks to be notified of data.
     */
    resolve: function (data) {
        // clear out the error
        this.error = undefined;

        // remember the state
        this.data = data;

        // record timestamp of when we were settled
        if (this._ttl !== undefined) {
            this._timestamp = now();
        }

        // go to the resolved state
        this._state = STATE_RESOLVED;

        // notify callbacks
        notifyCallbacks(this, null, data);
    },

    /**
     * Clear out data or error and return this data holder to initial state.
     * If the are any pending callbacks then those will be removed and not invoked.
     */
    reset: function () {
        // return to the initial state and clear error and data
        this.unsettle();

        // remove any callbacks
        this.callbacks = undefined;
    },

    /**
     * Return to the initial state and clear stored error or data.
     * If there are any callbacks still waiting for data, then those
     * will be retained.
     */
    unsettle: function () {
        // return to initial state
        this._state = STATE_INITIAL;
        
        // reset error value
        this.error = undefined;
        
        // reset data value
        this.data = undefined;

        // clear the timestamp of when we were settled
        this._timestamp = undefined;
    }
};

module.exports = DataHolder;

},{}],30:[function(require,module,exports){
'use strict';

var tryRequire = function tryRequire(id, req) {
    var path;
    var _req = req || require;

    try {
        path = _req.resolve(id);
    } catch (e) {}

    if (path) {
        return _req(path);
    }

    return undefined;
}

var resolve = function tryRequireResolve(id, req) {
    var path;
    var _req = req || require;

    try {
        path = _req.resolve(id);
    } catch (e) {}

    return path;
}

tryRequire.resolve = resolve;
module.exports = tryRequire;

},{}],31:[function(require,module,exports){
var tryRequire = require('try-require');
var raptorPubsub = tryRequire('raptor-pubsub', require);

function getNode(el) {
    if (typeof el === 'string') {
        var elId = el;
        el = document.getElementById(elId);
        if (!el) {
            throw new Error('Target element not found: "' + elId + '"');
        }
    }
    return el;
}

function _beforeRemove(referenceEl) {
    if (raptorPubsub) {
        raptorPubsub.emit('dom/beforeRemove', { el: referenceEl });
    }
}

var dom = {
    forEachChildEl: function (node, callback, scope) {
        dom.forEachChild(node, callback, scope, 1);
    },
    forEachChild: function (node, callback, scope, nodeType) {
        if (!node) {
            return;
        }
        var i = 0;
        var childNodes = node.childNodes;
        var len = childNodes.length;
        for (; i < len; i++) {
            var childNode = childNodes[i];
            if (childNode && (nodeType == null || nodeType == childNode.nodeType)) {
                callback.call(scope, childNode);
            }
        }
    },
    detach: function (child) {
        child = getNode(child);
        child.parentNode.removeChild(child);
    },
    appendTo: function (newChild, referenceParentEl) {
        getNode(referenceParentEl).appendChild(getNode(newChild));
    },
    remove: function (el) {
        el = getNode(el);
        _beforeRemove(el);
        if (el.parentNode) {
            el.parentNode.removeChild(el);
        }
    },
    removeChildren: function (parentEl) {
        parentEl = getNode(parentEl);

        var i = 0;
        var childNodes = parentEl.childNodes;
        var len = childNodes.length;
        for (; i < len; i++) {
            var childNode = childNodes[i];
            if (childNode && childNode.nodeType === 1) {
                _beforeRemove(childNode);
            }
        }
        parentEl.innerHTML = '';
    },
    replace: function (newChild, replacedChild) {
        replacedChild = getNode(replacedChild);
        _beforeRemove(replacedChild);
        replacedChild.parentNode.replaceChild(getNode(newChild), replacedChild);
    },
    replaceChildrenOf: function (newChild, referenceParentEl) {
        referenceParentEl = getNode(referenceParentEl);
        dom.forEachChildEl(referenceParentEl, function (childEl) {
            _beforeRemove(childEl);
        });
        referenceParentEl.innerHTML = '';
        referenceParentEl.appendChild(getNode(newChild));
    },
    insertBefore: function (newChild, referenceChild) {
        referenceChild = getNode(referenceChild);
        referenceChild.parentNode.insertBefore(getNode(newChild), referenceChild);
    },
    insertAfter: function (newChild, referenceChild) {
        referenceChild = getNode(referenceChild);
        newChild = getNode(newChild);
        var nextSibling = referenceChild.nextSibling;
        var parentNode = referenceChild.parentNode;
        if (nextSibling) {
            parentNode.insertBefore(newChild, nextSibling);
        } else {
            parentNode.appendChild(newChild);
        }
    },
    prependTo: function (newChild, referenceParentEl) {
        referenceParentEl = getNode(referenceParentEl);
        referenceParentEl.insertBefore(getNode(newChild), referenceParentEl.firstChild || null);
    }
};

/*
var jquery = window.$;
if (!jquery) {
    try {
        jquery = require('jquery');
    }
    catch(e) {}
}

if (jquery) {
    dom.ready = function(callback, thisObj) {
        jquery(function() {
            callback.call(thisObj);
        });
    };
} else {
    dom.ready = require('./raptor-dom_documentReady');
}
*/
dom.ready = require('./ready');

module.exports = dom;

},{"./ready":32,"try-require":30}],32:[function(require,module,exports){
/*
    jQuery's doc.ready/$(function(){}) should
    you wish to use a cross-browser domReady solution
    without opting for a library.

    Demo: http://jsfiddle.net/zKLpb/

    usage:
    $(function(){
        // your code
    });

    Parts: jQuery project, Diego Perini, Lucent M.
    Previous version from Addy Osmani (https://raw.github.com/addyosmani/jquery.parts/master/jquery.documentReady.js)

    This version: Patrick Steele-Idem
    - Converted to CommonJS module
    - Code cleanup
    - Fixes for IE <=10
*/

var isReady = false;
var readyBound = false;

var win = window;
var doc = document;

var listeners = [];

function domReadyCallback() {
    for (var i=0, len=listeners.length; i<len; i++) {
        var listener = listeners[i];
        listener[0].call(listener[1]);
    }
    listeners = null;
}



// Handle when the DOM is ready
function domReady() {
    // Make sure that the DOM is not already loaded
    if (!isReady) {
        // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
        if ( !doc.body ) {
            return setTimeout( domReady, 1 );
        }
        // Remember that the DOM is ready
        isReady = true;
        // If there are functions bound, to execute
        domReadyCallback();
        // Execute all of them
    }
} // /ready()

// The ready event handler
function domContentLoaded() {
    if ( doc.addEventListener ) {
        doc.removeEventListener( "DOMContentLoaded", domContentLoaded, false );
    } else {
        // we're here because readyState !== "loading" in oldIE
        // which is good enough for us to call the dom ready!
        doc.detachEvent( "onreadystatechange", domContentLoaded );
    }
    domReady();
}

// The DOM ready check for Internet Explorer
function doScrollCheck() {
    if (isReady) {
        return;
    }

    try {
        // If IE is used, use the trick by Diego Perini
        // http://javascript.nwbox.com/IEContentLoaded/
        doc.documentElement.doScroll("left");
    } catch ( error ) {
        setTimeout( doScrollCheck, 1 );
        return;
    }
    // and execute any waiting functions
    domReady();
}

function bindReady() {
    var toplevel = false;

    // Catch cases where $ is called after the
    // browser event has already occurred. IE <= 10 has a bug that results in 'interactive' being assigned
    // to the readyState before the DOM is really ready
    if ( document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading" ) {
        // We will get here if the browser is IE and the readyState === 'complete' or the browser
        // is not IE and the readyState === 'interactive' || 'complete'
		domReady();
	} else if ( doc.addEventListener ) { // Standards-based browsers support DOMContentLoaded
        // Use the handy event callback
        doc.addEventListener( "DOMContentLoaded", domContentLoaded, false );
        // A fallback to win.onload, that will always work
        win.addEventListener( "load", domContentLoaded, false );
        // If IE event model is used
    } else if ( doc.attachEvent ) {
        // ensure firing before onload,
        // maybe late but safe also for iframes
        doc.attachEvent( "onreadystatechange", domContentLoaded );
        // A fallback to win.onload, that will always work
        win.attachEvent( "onload", domContentLoaded );
        // If IE and not a frame
        // continually check to see if the document is ready
        try {
            toplevel = win.frameElement == null;
        } catch (e) {}
        if ( doc.documentElement.doScroll && toplevel ) {
            doScrollCheck();
        }
    }
}

module.exports = function(callback, thisObj) {
    if (isReady) {
        return callback.call(thisObj);
    }

    listeners.push([callback, thisObj]);

    if (!readyBound) {
        readyBound = true;
        bindReady();
    }
};
},{}],33:[function(require,module,exports){
/*
 * Copyright 2011 eBay Software Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Defines a "stringify" function that can be pulled in using require.
 *
 * Example:
 * <js>
 * var stringify = require('raptor/json/stringify');
 * var json = stringify({hello: "world"});
 * //Output: {"hello":"world"}
 * </js>
 *
 * The Raptor stringify function supports additional options not provided
 * by the builtin JSON object:
 * <b>special</b>: A regular expression to indicate "special" characters that must be escaped
 * <b>useSingleQuote</b>: If true, then single quotes will be used for strings instead of double quotes (helpful if the the string values contain a lot of double quotes)
 *
 */

var raptorStrings = require('raptor-strings');
var unicodeEncode = raptorStrings.unicodeEncode; //Pick up the unicodeEncode method from the strings module
var COMMA = ',';
var NULL = 'null';
var ARRAY = Array;
var SPECIAL = /([^ -~]|(["'\\]))/g;
var REPLACE_CHARS = {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '\\': '\\\\'
};

function stringify(o, options) {
    if (!options) {
        options = {};
    }

    var specialRegExp = options.special || SPECIAL;
    var replace = options.replace || REPLACE_CHARS;

    var buffer = raptorStrings.createStringBuilder();

    function append(str) {
        buffer.append(str);
    }

    var useSingleQuote = options.useSingleQuote === true;
    var strChar = useSingleQuote === true ? "'" : '"';
    function encodeString(s) {
        return strChar +
            s.replace(specialRegExp, function(c) {
                var replacement = replace[c];

                if (replacement) {
                    return replacement;
                }

                if (c === '"') {
                    return useSingleQuote ? '"' : '\\"';
                } else if (c === "'") {
                    return useSingleQuote ? "\\'" : "'";
                } else {
                    return unicodeEncode(c);
                }
            }) +
            strChar;
    }

    function serialize(o) {
        if (o == null) {
            append(NULL);
            return;
        }

        var constr = o.constructor, i, len;

        if (typeof o.toJSON === 'function') {
            if (constr !== Date) { // Dates are handled later
                o = o.toJSON();
                if (o == null) {
                    append(NULL);
                    return;
                }
                
                constr = o.constructor;
            }
        }

        if (o === true || o === false || constr === Boolean) {
            append(o.toString());
        } else if (constr === ARRAY) {
            append('[');

            len = o.length;
            for (i=0; i<len; i++) {
                if (i !== 0) {
                    append(COMMA);
                }

                serialize(o[i]);
            }

            append(']');
        } else if (constr === Date) {
            append(o.getTime());
        } else {
            var type = typeof o;
            switch(type) {
                case 'string':
                    append(encodeString(o));
                    break;
                case 'number':
                    append(isFinite(o) ? o + '' : NULL);
                    break;
                case 'object':
                    append('{');
                    var first = true, v;
                    for (var k in o) {
                        if (o.hasOwnProperty(k)) {
                            v = o[k];
                            if (v == null || typeof v === 'function') continue;

                            if (first === false)
                            {
                                append(COMMA);
                            } else {
                                first = false;
                            }

                            append(encodeString(k));
                            append(":");
                            serialize(v);
                        }
                    }
                    append('}');
                    break;
                default:
                    append(NULL);
            }
        }
    }

    serialize(o);

    return buffer.toString();
}

module.exports = stringify;
},{"raptor-strings":61}],34:[function(require,module,exports){
(function (global){
var g = typeof window === 'undefined' ? global : window;
// Make this module a true singleton
module.exports = g.__RAPTOR_LOGGING || (g.__RAPTOR_LOGGING = require('./raptor-logging'));
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./raptor-logging":35}],35:[function(require,module,exports){
var raptorLoggingImpl = './raptor-logging-impl';

try {
    raptorLoggingImpl = require.resolve(raptorLoggingImpl);
} catch(e) {
    raptorLoggingImpl = null;
}

var EMPTY_FUNC = function() {
        return false;
    },
    /**
     * @name raptor/logging/voidLogger
     */
    voidLogger = {
        
        /**
         *
         */
        isTraceEnabled: EMPTY_FUNC,

        /**
         *
         */
        isDebugEnabled: EMPTY_FUNC,
        
        /**
         *
         */
        isInfoEnabled: EMPTY_FUNC,
        
        /**
         *
         */
        isWarnEnabled: EMPTY_FUNC,
        
        /**
         *
         */
        isErrorEnabled: EMPTY_FUNC,
        
        /**
         *
         */
        isFatalEnabled: EMPTY_FUNC,
        
        /**
         *
         */
        dump: EMPTY_FUNC,
        
        /**
         *
         */
        trace: EMPTY_FUNC,

        /**
         *
         */
        debug: EMPTY_FUNC,
        
        /**
         *
         */
        info: EMPTY_FUNC,
        
        /**
         *
         */
        warn: EMPTY_FUNC,
        
        /**
         *
         */
        error: EMPTY_FUNC,
        
        /**
         *
         */
        fatal: EMPTY_FUNC
    };

var stubs = {
    /**
     *
     * @param className
     * @returns
     */
    logger: function() {
        return voidLogger;
    },
    
    configure: EMPTY_FUNC,
    
    voidLogger: voidLogger
};

module.exports = raptorLoggingImpl ? require(raptorLoggingImpl) : stubs;
},{}],36:[function(require,module,exports){
(function (process,global,__dirname){
var GLOBAL_KEY = 'app-root-dir';
var _rootDir;

exports.get = function() {
    var dir = global[GLOBAL_KEY];
    if (dir) {
        return dir;
    }

    if (_rootDir === undefined) {
        var fs = require('fs');
        var path = require('path');

        var cwd = process.cwd();
        if (fs.existsSync(path.join(cwd, 'package.json'))) {
            _rootDir = cwd;
        } else {
            var pos = __dirname.indexOf('/node_modules/');
            if (pos === -1) {
                _rootDir = path.normalize(__dirname, '..');
            } else {
                _rootDir = __dirname.substring(0, pos);
            }
        }
    }

    return _rootDir;
};

exports.set = function(dir) {
    global[GLOBAL_KEY] = _rootDir = dir;
};
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},"/../node_modules/marko-widgets/node_modules/raptor-modules/node_modules/app-root-dir/lib")
},{"_process":6,"fs":1,"path":5}],37:[function(require,module,exports){

/*

Examples:
deresolve('/my-project/node_modules/foo/index.js', '/my-project/src') -->
	'foo'

deresolve('/my-project/node_modules/foo/hello.js', '/my-project/src') -->
	'foo/hello'

deresolve('/my-project/src/bar.js', '/my-project/src/index.js') -->
	'./bar'
*/


var nodePath = require('path');
var Module = require('module').Module;
var raptorModulesUtil = require('../../util');
var nodeModulesPrefixRegExp = /^node_modules[\\\/](.+)/;

function removeRegisteredExt(path) {
    var basename = nodePath.basename(path);
    var ext = nodePath.extname(basename);

    if (require.extensions[ext]) {
        return path.slice(0, 0-ext.length);
    } else {
        return path;
    }
}

function getModuleDirnameFromSearchPath(path, searchPath) {
	var dirname = nodePath.dirname(path);
	var parentDirname = nodePath.dirname(dirname);

	do {

		if (parentDirname === searchPath) {
			return dirname;
		}

		parentDirname = nodePath.dirname(parentDirname);
		dirname = nodePath.dirname(dirname);

	} while (dirname !== searchPath);

	throw new Error('Illegal state for getModuleDirnameFromSearchPath. path=' + path + ', searchPath=' + searchPath);
}

function relPath(path, from) {
	var dirname = nodePath.dirname(path);
	var main = raptorModulesUtil.findMain(dirname);
	if (main === path) {
		path = nodePath.dirname(path); // We only need to walk to the parent directory if the target is the main file for the directory
	}

	// Didn't find the target path on the search path so construct a relative path
	var relativePath = removeRegisteredExt(nodePath.relative(from, path));
	if (relativePath.charAt(0) !== '.') {
		relativePath = './' + relativePath;
	}
	return relativePath;
	// var relPathParts = relPath.split(/[\\\/]/);
	// if (relPathParts.indexOf('node_modules') === -1) {
	//	// Only use the relative path if we *not* are crossing into a
	// }
}

function deresolve(path, from) {
	var targetRootDir = raptorModulesUtil.getModuleRootDir(path);
	var fromRootDir = raptorModulesUtil.getModuleRootDir(from);

	if (targetRootDir && fromRootDir && targetRootDir === fromRootDir) {
		return relPath(path, from);
	}

	var paths = Module._nodeModulePaths(from);

	var fromSearchPath = null;

	for (var i=0, len=paths.length; i<len; i++) {
		var searchPath = paths[i];

		if (path.startsWith(searchPath)) {
			// Example:
			// searchPath: '/my-project/node_modules
			// path:       '/my-project/node_modules/foo/lib/index.js'

			var moduleDirname = getModuleDirnameFromSearchPath(path, searchPath);
			var main = raptorModulesUtil.findMain(moduleDirname);
			if (main === path) {
				// The target path is the main file for the module in the search path
				return nodePath.basename(moduleDirname);
			}

			fromSearchPath = path.substring(searchPath.length+1); // Example: foo/index.js
			fromSearchPath = removeRegisteredExt(fromSearchPath); // Remove the file extension if well-known

            var matches = nodeModulesPrefixRegExp.exec(fromSearchPath);
            if (matches) {
                return matches[1];
            }

            return fromSearchPath;
		}
	}

	return relPath(path, from);

}

module.exports = deresolve;
},{"../../util":49,"module":1,"path":5}],38:[function(require,module,exports){
exports.find = require('./search-path').find;
exports.resolveRequire = require('./resolveRequire');
exports.serverResolveRequire = require('./serverResolveRequire');
exports.deresolve = require('./deresolve');
},{"./deresolve":37,"./resolveRequire":39,"./search-path":40,"./serverResolveRequire":41}],39:[function(require,module,exports){
var ok = require('assert').ok;
var nodePath = require('path');
var searchPath = require('./search-path');
var moduleUtil = require('../../util');
var cachingFs = moduleUtil.cachingFs;

function getParentModuleLogicalPath(path) {
    var lastDollar = path.lastIndexOf('$');
    if (lastDollar === -1) {
        return '';
    } else {
        var parentModuleNameEnd = path.indexOf('/', lastDollar+2);
        if (parentModuleNameEnd === -1) {
            parentModuleNameEnd = path.length;
        }

        return path.substring(0, parentModuleNameEnd);
    }
}

function resolveRequire(target, from, options) {
    ok(target, '"target" is required');
    ok(typeof target === 'string', '"target" must be a string');
    ok(from, '"from" is required');
    ok(typeof from === 'string', '"from" must be a string');

    var resolvedPath;

    if (target.charAt(0) === '/' || target.indexOf(':\\') !== -1) {
        var stat = cachingFs.statSync(target);
        if (stat.exists()) {
            resolvedPath = target;

            // We need "from" to be accurate for looking up browser overrides:
            from = stat.isDirectory() ? resolvedPath : nodePath.dirname(resolvedPath);
        }
    }

    var browserOverrides = moduleUtil.getBrowserOverrides(from);
    var browserOverride;

    if (!resolvedPath) {

        if (browserOverrides && (target.charAt(0) !== '.' && target.charAt(0) !== '/')) {
            // This top-level module might be mapped to a completely different module
            // based on the module metadata in package.json

            var remappedModule = browserOverrides.getRemappedModuleInfo(target, from);

            if (remappedModule) {
                if (remappedModule.name) {
                    browserOverride = resolveRequire(remappedModule.name, remappedModule.from, options);
                    browserOverride.dep.childName = target;
                    browserOverride.dep.remap = remappedModule.name;
                    browserOverride.isBrowserOverride = true;
                    return browserOverride;
                } else if (remappedModule.filePath) {
                    // We are in a situation where an installed module is remapped to a local file
                    var fromPathInfo = moduleUtil.getPathInfo(from, options);
                    var overridePathInfo = moduleUtil.getPathInfo(remappedModule.filePath, options);

                    var parentPath = getParentModuleLogicalPath(fromPathInfo.logicalPath);

                    // We need to calculate a relative path from the root of the module
                    // to the nested module
                    var relPath = parentPath === '' ?
                        '.' + overridePathInfo.logicalPath :
                        nodePath.relative(parentPath, overridePathInfo.logicalPath);

                    // Make sure the path always starts with './' to indicate that it is relative
                    if (relPath.charAt(0) !== '.') {
                        relPath = './' + relPath;
                    }

                    // Since the user is trying to require an installed module we will add a
                    // dep that remaps to the calculated child path that will be considered relative
                    // to the root of the containing module

                    overridePathInfo.dep = {
                        parentPath: parentPath,
                        childName: target,
                        childVersion: null,
                        remap: relPath
                    };

                    overridePathInfo.isBrowserOverride = true;

                    return overridePathInfo;
                } else {
                    throw new Error('Illegal state');
                }
            }
        }

        var hasExt = nodePath.extname(target) !== '';

        resolvedPath = searchPath.find(target, from, function(path) {

            var dirname = nodePath.dirname(path);

            if (nodePath.basename(dirname) !== 'node_modules' && cachingFs.isDirectorySync(dirname)) {

                if (hasExt) {
                    if (cachingFs.existsSync(path)) {
                        return path;
                    }
                }

                // Try with the extensions
                var extensions = require.extensions;
                for (var ext in extensions) {
                    if (extensions.hasOwnProperty(ext) && ext !== '.node') {
                        var pathWithExt = path + ext;

                        if (cachingFs.existsSync(pathWithExt)) {
                            return pathWithExt;
                        }
                    }
                }
            }

            if (cachingFs.existsSync(path)) {
                return path;
            }

            return null;
        });
    }

    if (resolvedPath) {
        var pathInfo = moduleUtil.getPathInfo(resolvedPath, options);
        return pathInfo;
    } else {
        var e = new Error('Module not found: ' + target + ' (from: ' + from + ')');
        e.moduleNotFound = true;
        throw e;
    }
}

module.exports = resolveRequire;
},{"../../util":49,"./search-path":40,"assert":2,"path":5}],40:[function(require,module,exports){
require('raptor-polyfill/string/endsWith');
var nodePath = require('path');
var Module = require('module').Module;
var util = require('../../util')
var sep = nodePath.sep;

function find(path, from, callback, thisObj) {
    if (util.isAbsolute(path)) {
        return callback.call(thisObj, path);
    }

    if (path.startsWith('./') || path.startsWith('../')) {
        // Don't go through the search paths for relative paths
        var joined = callback.call(thisObj, nodePath.join(from, path));
        if (joined && joined.endsWith(sep)) {
            joined = joined.slice(0, -1);
        }
        return joined;
    }
    else {
        var paths = Module._nodeModulePaths(from);

        for (var i=0, len=paths.length; i<len; i++) {
            var searchPath = paths[i];
            if (!util.cachingFs.isDirectorySync(searchPath)) {
                continue;
            }

            var result = callback.call(thisObj, nodePath.join(searchPath, path));
            if (result) {
                return result;
            }
        }
    }
}

exports.find = find;
},{"../../util":49,"module":1,"path":5,"raptor-polyfill/string/endsWith":52}],41:[function(require,module,exports){
var ok = require('assert').ok;
var nodePath = require('path');
var searchPath = require('./search-path');
var util = require('../../util');

function serverResolveRequire(target, from) {
    ok(target, '"target" is required');
    ok(typeof target === 'string', '"target" must be a string');
    ok(from, '"from" is required');
    ok(typeof from === 'string', '"from" must be a string');

    if (util.isAbsolute(target)) {
        // Assume absolute paths have already been resolved...
        // Newer versions of Node.js will have a better test for isAbsolute()
        return target;
    }

    var result = searchPath.find(target, from, function(path) {

        var dirname = nodePath.dirname(path);
        if (nodePath.basename(dirname) !== 'node_modules' && util.cachingFs.isDirectorySync(dirname)) {
            // Try with the extensions
            var extensions = require.extensions;
            for (var ext in extensions) {
                if (extensions.hasOwnProperty(ext)) {
                    var pathWithExt = path + ext;
                    if (util.cachingFs.isDirectorySync(nodePath.dirname()) && util.cachingFs.existsSync(pathWithExt)) {
                        return pathWithExt;
                    }
                }
            }
        }

        if (util.cachingFs.existsSync(path)) {
            return path;
        }

        return null;
    });

    if (!result) {
        var err = new Error('Module not found: ' + target + ' (from: ' + from + ')');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
    }

    return result;
}

module.exports = serverResolveRequire;

},{"../../util":49,"./search-path":40,"assert":2,"path":5}],42:[function(require,module,exports){
require('raptor-polyfill/string/startsWith');
var ok = require('assert').ok;
var nodePath = require('path');
var tryPackage = require('../../util').tryPackage;
var findMain = require('../../util').findMain;
var resolver = require('../../resolver');
var browserOverridesByDir = {};

function BrowserOverrides(dirname) {
    this.overrides = {};
    this.dirname = dirname;
    this.parent = null;
    this.resolveCache = {};
    this.targetCache = {};
}

BrowserOverrides.prototype = {
    load: function(pkg) {
        this.dirname = pkg.__dirname;
        var browser = pkg.browser || pkg.browserify;
        var extname;

        if (browser) {
            if (typeof browser === 'string') {


                var defaultMain = findMain(this.dirname);
                extname = nodePath.extname(browser);
                if (extname) {
                    // Avoid an infinite loop if the browser override has no effect
                    // (this was seen in some of the browserify packages)
                    var absolutePath = nodePath.join(this.dirname, browser);
                    if (absolutePath === defaultMain) {
                        return;
                    }
                }

                this.overrides[defaultMain] = browser;
            } else {
                for (var source in browser) {
                    if (browser.hasOwnProperty(source)) {
                        var resolvedSource = source;
                        var target = browser[source];

                        if (source.startsWith('./')) {
                            resolvedSource = nodePath.join(this.dirname, source);
                        }

                        this.overrides[resolvedSource] = target;
                    }
                }
            }
        }
    },

    getRemappedModuleInfo: function(requested, options) {

        // console.log(module.id, 'getRemappedModuleInfo', requested, new Error().stack);
        var targetModuleInfo = this.targetCache[requested];
        var target;

        if (targetModuleInfo === undefined) {

            var current = this;

            while (current) {
                target = current.overrides[requested];
                if (target) {
                    if (target.startsWith('.')) {
                        var resolved = resolver.resolveRequire(target, current.dirname, options);
                        targetModuleInfo = {
                            filePath: resolved.filePath
                        };
                    } else {



                        if (!targetModuleInfo) {
                            targetModuleInfo = {
                                name: target,
                                from: current.dirname
                            };
                        }
                    }

                    break;
                }

                current = current.parent;
            }

            if (!targetModuleInfo) {
                targetModuleInfo = null;
            }


            this.targetCache[requested] = targetModuleInfo;
        }

        return targetModuleInfo;
    }
};

var getBrowserOverrides;

function loadBrowserOverridesHelper(dirname) {
    var packagePath = nodePath.join(dirname, 'package.json');
    var pkg = tryPackage(packagePath);
    var browserOverrides = new BrowserOverrides(dirname);

    if (pkg) {
        browserOverrides.load(pkg);
        if (pkg.name) {
            return browserOverrides;
        }
    }

    // We are not the root package so try moving up a directory
    // to attach a parent to these browser overrides
    var parentDirname = nodePath.dirname(dirname);
    if (parentDirname && parentDirname !== dirname) {
        browserOverrides.parent = getBrowserOverrides(parentDirname);
    }

    return browserOverrides;

}

getBrowserOverrides = function(dirname) {
    ok(dirname, '"dirname" is required');
    ok(typeof dirname === 'string', '"dirname" must be a string');

    var browserOverrides = browserOverridesByDir[dirname];

    if (browserOverrides === undefined) {
        browserOverrides = loadBrowserOverridesHelper(dirname);
        browserOverridesByDir[dirname] = browserOverrides;
    }

    return browserOverrides;
};

exports.getBrowserOverrides = getBrowserOverrides;
},{"../../resolver":38,"../../util":49,"assert":2,"path":5,"raptor-polyfill/string/startsWith":53}],43:[function(require,module,exports){
var fs = require('fs');
var DataHolder = require('raptor-async/DataHolder');

var cache = {};

function Stat() {

}

Stat.prototype.isDirectory = function() {
    return (this._directory === true);
};

Stat.prototype.exists = function() {
    return (this._exists === true);
};

Stat.prototype.lastModified = function() {
    return this._lastModified;
};

function createStat(fsStat) {
    var stat = new Stat();
    if (fsStat) {
        stat._exists = true;
        stat._lastModified = fsStat.mtime ? fsStat.mtime.getTime() : -1;
        stat._directory = fsStat.isDirectory();
    } else {
        stat._exists = false;
    }

    return stat;
}

function stat(filePath, callback) {
    var dataHolder = cache[filePath];
    if (dataHolder === undefined) {
        cache[filePath] = dataHolder = new DataHolder();
        fs.stat(filePath, function(err, stat) {
            dataHolder.resolve(createStat(stat));
        });
    }

    dataHolder.done(callback);
}

function statSync(filePath, callback) {
    var dataHolder = cache[filePath];
    var stat;

    if ((dataHolder === undefined) || !dataHolder.isSettled()) {
        if (dataHolder === undefined) {
            cache[filePath] = dataHolder = new DataHolder();
        }

        try {
            stat = createStat(fs.statSync(filePath));
        } catch(err) {
            stat = createStat(null);
        }

        dataHolder.resolve(stat);
    } else {
        stat = dataHolder.data;
    }

    return stat;
}

exports.stat = stat;
exports.statSync = statSync;

exports.lastModified = function(filePath, callback) {
    stat(filePath, function(err, stat) {
        callback(null, stat.lastModified());
    });
};

exports.exists = function(filePath, callback) {
    stat(filePath, function(err, stat) {
        callback(null, stat.exists());
    });
};

exports.existsSync = function(filePath) {
    return statSync(filePath).exists();
};

exports.isDirectorySync = function(filePath) {
    return statSync(filePath).isDirectory();
};

exports.clear = function() {
    cache = {};
};
},{"fs":1,"raptor-async/DataHolder":29}],44:[function(require,module,exports){
var fs = require('fs');
var cachingFs = require('./caching-fs');

var nodePath = require('path');
var packageReader = require('./package-reader');
var ok = require('assert').ok;

function findMainForFilename(dir, main) {
    var filenames = fs.readdirSync(dir);
    for (var i=0, len=filenames.length; i<len; i++) {
        var curFilename = filenames[i];
        var lastDot = curFilename.lastIndexOf('.');
        if (lastDot === -1) {
            lastDot = curFilename.length;
        }

        if (curFilename.substring(0, lastDot) === main) {
            var ext = curFilename.substring(lastDot);
            var handler = require.extensions[ext];
            if (handler) {
                return nodePath.join(dir, curFilename);
            }
        }
    }

    return null;
}

function findMain(path) {
    ok(typeof path === 'string', 'path should be a string');

    var packagePath = nodePath.join(path, 'package.json');
    var main;
    var pkg = packageReader.tryPackage(packagePath);
    if (pkg) {
        main = pkg.main;
    }

    if (!main) {
        main = findMainForFilename(path, 'index');
    } else {

        main = nodePath.resolve(path, main);
        var stat = cachingFs.statSync(main);

        if (!stat.exists() || stat.isDirectory()) {
            var dirname = nodePath.dirname(main);
            var filename = nodePath.basename(main);

            // The main file might be lacking a file extension
            main = findMainForFilename(dirname, filename);
        }
    }

    return main;
}

module.exports = findMain;
},{"./caching-fs":43,"./package-reader":50,"assert":2,"fs":1,"path":5}],45:[function(require,module,exports){
(function (process){
require('raptor-polyfill/string/startsWith');

var nodePath = require('path');
var packageReader = require('./package-reader');
var cwd = process.cwd();
var cachedModuleRootDirs = {};


function findRootDirHelper(dirname) {
    if (dirname === '' || dirname === '/') {
        return null;
    }

    var parentDirname = nodePath.dirname(dirname);

    if (nodePath.basename(parentDirname) === 'node_modules') {
        return dirname;
    }

    var packagePath = nodePath.join(dirname, 'package.json');
    var pkg = packageReader.tryPackage(packagePath);
    if (pkg && pkg.name) {
        // Only consider packages that have a name to avoid
        // intermediate packages that might only be used to
        // define a main script
        return dirname;    
    }

    
    if (parentDirname !== dirname) {
        return findRootDirHelper(parentDirname);
    }
    else {
        return null;
    }
}

function getModuleRootDir(dirname) {

    var rootDir = cachedModuleRootDirs[dirname];
    if (rootDir) {
        return rootDir;
    }


    rootDir = findRootDirHelper(dirname);
    if (!rootDir) {
        if (dirname.startsWith(cwd)) {
            rootDir = cwd;
        } else {
            throw new Error('Unable to determine module root for path "' + dirname + '"');    
        }
    }

    cachedModuleRootDirs[dirname] = rootDir;

    return rootDir;
}

module.exports = getModuleRootDir;
}).call(this,require('_process'))
},{"./package-reader":50,"_process":6,"path":5,"raptor-polyfill/string/startsWith":53}],46:[function(require,module,exports){
var nodePath = require('path');
var packageReader = require('./package-reader');

var cachedModuleRootPackages = {};


function findRootPackageHelper(dirname) {
    if (dirname === '' || dirname === '/') {
        return null;
    }

    var packagePath = nodePath.join(dirname, 'package.json');
    var pkg = packageReader.tryPackage(packagePath);
    if (pkg && pkg.name) {
        // Only consider packages that have a name to avoid
        // intermediate packages that might only be used to
        // define a main script
        return pkg;    
    }

    var parentDirname = nodePath.dirname(dirname);
    if (parentDirname !== dirname) {
        return findRootPackageHelper(parentDirname);
    }
    else {
        return null;
    }
}

function getModuleRootPackage(dirname) {

    var rootPkg = cachedModuleRootPackages[dirname];
    if (rootPkg) {
        return rootPkg;
    }


    rootPkg = findRootPackageHelper(dirname);
    if (!rootPkg) {
        throw new Error('Unable to determine module root for path "' + dirname + '"');
    }

    cachedModuleRootPackages[dirname] = rootPkg;

    return rootPkg;
}

module.exports = getModuleRootPackage;
},{"./package-reader":50,"path":5}],47:[function(require,module,exports){
require('raptor-polyfill/string/startsWith');
var nodePath = require('path');
var ok = require('assert').ok;

var raptorModulesUtil = require('../../util');
var cachingFs = raptorModulesUtil.cachingFs;
var raptorModulesResolver = require('../../resolver');
var getProjectRootDir = raptorModulesUtil.getProjectRootDir;
var getModuleRootPackage = raptorModulesUtil.getModuleRootPackage;
var findMain = raptorModulesUtil.findMain;
var getBrowserOverrides = require('./browser-overrides').getBrowserOverrides;
var sep = nodePath.sep;

function normalizeDepDirnames(path) {
    var parts = path.split(/[\\/]/);
    for (var i=0, len=parts.length; i<len; i++) {
        if (parts[i] === 'node_modules') {
            parts[i] = '$';
        }
    }

    return parts.join('/');
}

function removeRegisteredExt(path) {
    var basename = nodePath.basename(path);
    var ext = nodePath.extname(basename);

    if (ext === '.js' || ext === '.json') {
        return path.slice(0, 0-ext.length);
    } else {
        return path;
    }
}

function getPathInfo(path, options) {
    ok(typeof path === 'string', 'path should be a string');
    options = options || {};

    var removeExt = options.removeExt !== false;

    var root = options.root || getProjectRootDir(path);
    var additionalRemaps = options.remap;

    var lastNodeModules = path.lastIndexOf('node_modules' + sep);
    var logicalPath;
    var realPath;
    var dep;
    var stat = cachingFs.statSync(path);

    if (!stat.exists(path)) {
        throw new Error('File does not exist: ' + path);
    }

    var name;
    var version;
    var basePath;

    if (!options.makeRoot && path.startsWith(root)) {
        logicalPath = normalizeDepDirnames(path.substring(root.length));
        if (logicalPath === '') {
            logicalPath = '/';
        }

        if (lastNodeModules !== -1) {
            var nodeModulesDir = path.substring(0, lastNodeModules + ('node_modules' + sep).length);

            var moduleNameEnd = path.indexOf(sep, nodeModulesDir.length);
            if (moduleNameEnd === -1) {
                moduleNameEnd = path.length;
            }

            var pkg = getModuleRootPackage(path);
            name = pkg.name;
            version = pkg.version;

            basePath = '/' + name + '@' + version;
            realPath = normalizeDepDirnames(basePath + path.substring(moduleNameEnd));

            dep = {
                parentPath: normalizeDepDirnames(nodePath.dirname(nodeModulesDir).substring(root.length)),
                childName: name,
                childVersion: version
            };
        } else {
            realPath = logicalPath;
        }
    } else {

        // The module must be linked in so treat it as a top-level installed
        // dependency since we have no way of knowing which dependency this module belongs to
        // based on the given path
        var moduleRootPkg = getModuleRootPackage(path);
        name = moduleRootPkg.name;
        version = moduleRootPkg.version;


        basePath = '/' + name + '@' + version;
        realPath = normalizeDepDirnames(basePath + path.substring(moduleRootPkg.__dirname.length));
        logicalPath = name + path.substring(moduleRootPkg.__dirname.length);

        dep = {
            parentPath: '',
            childName: name,
            childVersion: version
        };

        // console.log('RESOLVE LINKED MODULE: ', '\npath: ', path, '\nrealPath: ', realPath, '\nlogicalPath: ', logicalPath, '\ndep: ', dep, '\nmoduleRootPkg.__dirname: ', moduleRootPkg.__dirname);
    }

    if (sep !== '/') {
        realPath = realPath.replace(/[\\]/g, '/');
        logicalPath = logicalPath.replace(/[\\]/g, '/');
    }

    if (realPath.endsWith('/')) {
        realPath = realPath.slice(0, -1);
    }

    if (logicalPath.endsWith('/')) {
        logicalPath = logicalPath.slice(0, -1);
    }

    var isDir = stat.isDirectory();
    var main;
    var remap;

    if (isDir) {
        var mainFilePath = findMain(path);
        if (mainFilePath) {
            var mainRelPath = removeRegisteredExt(nodePath.relative(path, mainFilePath));

            if (sep !== '/') {
                mainRelPath = mainRelPath.replace(/[\\]/g, '/');
            }

            main = {
                filePath: mainFilePath,
                path: mainRelPath
            };
        }
    } else {
        var overridePathInfo;
        var remapTo;
        var targetFile = additionalRemaps && additionalRemaps[path];
        var dirname = nodePath.dirname(path);

        if (targetFile) {
            // First handle "remap" passed from the options
            ok(targetFile, 'targetFile is null');

            remapTo = normalizeDepDirnames(nodePath.relative(dirname, targetFile));

            if (sep !== '/') {
                remapTo = remapTo.replace(/[\\]/g, '/');
            }

            overridePathInfo = getPathInfo(targetFile, options);
            overridePathInfo.isBrowserOverride = true;
            overridePathInfo.remap = {
                from: realPath,
                to: removeExt ? removeRegisteredExt(remapTo) : remapTo
            };
            return overridePathInfo;
        }

        if (removeExt) {
            logicalPath = removeRegisteredExt(logicalPath);
            realPath = removeRegisteredExt(realPath);
        }

        var browserOverrides = getBrowserOverrides(dirname);
        if (browserOverrides) {

            var browserOverride = browserOverrides.getRemappedModuleInfo(path, options);

            if (browserOverride) {


                if (browserOverride.filePath) {
                    targetFile = browserOverride.filePath;

                } else if (browserOverride.name) {
                    ok(browserOverride.from, 'browserOverride.from expected');

                    var targetModule = raptorModulesResolver.resolveRequire(browserOverride.name, browserOverride.from);
                    ok(targetModule.main && targetModule.main.filePath, 'Invalid target module');
                    targetFile = targetModule.main.filePath;

                } else {
                    throw new Error('Invalid browser override for "' + path + '": ' + require('util').inspect(path));
                }

                remapTo = normalizeDepDirnames(nodePath.relative(dirname, targetFile));

                remap = {
                    from: realPath,
                    to: removeExt ? removeRegisteredExt(remapTo) : remapTo
                };

                ok(targetFile, 'targetFile is null');

                overridePathInfo = getPathInfo(targetFile, options);
                overridePathInfo.isBrowserOverride = true;
                overridePathInfo.remap = remap;
                return overridePathInfo;
            }
        }
    }

    var result = {
        filePath: path,
        logicalPath: logicalPath,
        realPath: realPath,
        isDir: isDir
    };

    if (dep) {
        result.dep = dep;
    }

    if (main) {
        result.main = main;
    }

    return result;
}

module.exports = getPathInfo;

},{"../../resolver":38,"../../util":49,"./browser-overrides":42,"assert":2,"path":5,"raptor-polyfill/string/startsWith":53,"util":8}],48:[function(require,module,exports){
var appRootDir = require('app-root-dir');

module.exports = function getProjectRootDir() {
    return appRootDir.get();
};

},{"app-root-dir":36}],49:[function(require,module,exports){
function removeExt(path) {
    var lastDot = path.lastIndexOf('.');
    if (lastDot !== -1) {
        return path.substring(0, lastDot);
    }
    else {
        return path;
    }
}

exports.cachingFs = require('./caching-fs');
exports.removeExt = removeExt;
exports.tryPackage = require('./package-reader').tryPackage;
exports.findMain = require('./findMain');
exports.getProjectRootDir = require('./getProjectRootDir');
exports.getModuleRootPackage = require('./getModuleRootPackage');
exports.getModuleRootDir = require('./getModuleRootDir');
exports.getBrowserOverrides = require('./browser-overrides').getBrowserOverrides;
exports.getPathInfo = require('./getPathInfo');
exports.isAbsolute = require('./path').isAbsolute;
},{"./browser-overrides":42,"./caching-fs":43,"./findMain":44,"./getModuleRootDir":45,"./getModuleRootPackage":46,"./getPathInfo":47,"./getProjectRootDir":48,"./package-reader":50,"./path":51}],50:[function(require,module,exports){
var nodePath = require('path');
var pkgCache = {};

function tryPackage(path) {
    var pkg = pkgCache[path];

    if (pkg !== undefined) {
        return pkg;
    }

    try {
        pkg = require(path);
        
        if (pkg.__filename && pkg.__filename !== path) {
            pkg = require('raptor-util').extend({}, pkg);
        }

        pkg.__filename = path;
        pkg.__dirname = nodePath.dirname(path);
        
        pkgCache[path] = pkg;
        return pkg;
    }
    catch(e) {
        if (e.code === 'MODULE_NOT_FOUND') {
            pkgCache[path] = null;    
        }
        else {
            throw e;
        }
        
    }
}

exports.tryPackage = tryPackage;
},{"path":5,"raptor-util":74}],51:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
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


// The following code was adapted from: https://github.com/joyent/node/blob/master/lib/path.js
// Older versions of Node.js do not export isAbsolute() so we added it here
function absUnix (p) {
  return p.charAt(0) === "/" || p === "";
}

function absWin (p) {
  if (absUnix(p)) return true;
  // pull off the device/UNC bit from a windows path.
  // from node's lib/path.js
  var splitDeviceRe = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/,
    result = splitDeviceRe.exec(p),
    device = result[1] || '',
    isUnc = device && device.charAt(1) !== ':',
    isAbsolute = !!result[2] || isUnc; // UNC paths are always absolute

  return isAbsolute;
}

var isAbsolute = process.platform === "win32" ? absWin : absUnix;

exports.isAbsolute = isAbsolute;
}).call(this,require('_process'))
},{"_process":6}],52:[function(require,module,exports){
if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(suffix, position) {
        var str = this;
        
        if (position) {
            str = str.substring(position);
        }
        
        if (str.length < suffix.length) {
            return false;
        }
        
        return str.slice(0 - suffix.length) == suffix;
    };
}
},{}],53:[function(require,module,exports){
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(prefix, position) {
        var str = this;
        
        if (position) {
            str = str.substring(position);
        }
        
        if (str.length < prefix.length) {
            return false;
        }
        
        return str.substring(0, prefix.length) == prefix;
    };
}
},{}],54:[function(require,module,exports){
(function (global){
var g = typeof window === 'undefined' ? global : window;
// Make this module a true singleton
module.exports = g.__RAPTOR_PUBSUB || (g.__RAPTOR_PUBSUB = require('./raptor-pubsub'));
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./raptor-pubsub":55}],55:[function(require,module,exports){
var EventEmitter = require('events').EventEmitter;

var channels = {};

var globalChannel = new EventEmitter();

globalChannel.channel = function(name) {
    var channel;
    if (name) {
        channel = channels[name] || (channels[name] = new EventEmitter());
    } else {
        channel = new EventEmitter();
    }
    return channel;
};

globalChannel.removeChannel = function(name) {
    delete channels[name];
};

module.exports = globalChannel;

},{"events":3}],56:[function(require,module,exports){
'use strict';
var dom = require('raptor-dom');
var raptorPubsub = require('raptor-pubsub');

function checkAddedToDOM(renderResult, method) {
    if (!renderResult._added) {
        throw new Error('Cannot call ' + method + '() until after HTML fragment is added to DOM.');
    }
}

function RenderResult(html, out) {
    this.html = html;
    this.out = out;
    this._node = undefined;

    var widgetsContext = out.global.widgets;
    this._widgetDefs = widgetsContext ? widgetsContext.widgets : null;
}

RenderResult.prototype = {

    getWidget: function () {
        checkAddedToDOM(this, 'getWidget');

        var rerenderWidget = this.out.__rerenderWidget;
        if (rerenderWidget) {
            return rerenderWidget;
        }

        var widgetDefs = this._widgetDefs;
        if (!widgetDefs) {
            throw new Error('No widget rendered');
        }
        return widgetDefs.length ? widgetDefs[0].widget : undefined;
    },
    getWidgets: function (selector) {
        checkAddedToDOM(this, 'getWidgets');

        var widgetDefs = this._widgetDefs;

        if (!widgetDefs) {
            throw new Error('No widget rendered');
        }

        var widgets;
        var i;
        if (selector) {
            // use the selector to find the widgets that the caller wants
            widgets = [];
            for (i = 0; i < widgetDefs.length; i++) {
                var widget = widgetDefs[i].widget;
                if (selector(widget)) {
                    widgets.push(widget);
                }
            }
        } else {
            // return all widgets
            widgets = new Array(widgetDefs.length);
            for (i = 0; i < widgetDefs.length; i++) {
                widgets[i] = widgetDefs[i].widget;
            }
        }
        return widgets;
    },
    _afterInsert: function () {
        this._added = true;
        raptorPubsub.emit('raptor-renderer/renderedToDOM', {
            node: this.getNode(),
            context: this.out,
            out: this.out
        });    // NOTE: This will trigger widgets to be initialized if there were any

        return this;
    },
    appendTo: function (referenceEl) {
        dom.appendTo(this.getNode(), referenceEl);
        return this._afterInsert();
    },
    replace: function (referenceEl) {
        dom.replace(this.getNode(), referenceEl);
        return this._afterInsert();
    },
    replaceChildrenOf: function (referenceEl) {
        dom.replaceChildrenOf(this.getNode(), referenceEl);
        return this._afterInsert();
    },
    insertBefore: function (referenceEl) {
        dom.insertBefore(this.getNode(), referenceEl);
        return this._afterInsert();
    },
    insertAfter: function (referenceEl) {
        dom.insertAfter(this.getNode(), referenceEl);
        return this._afterInsert();
    },
    prependTo: function (referenceEl) {
        dom.prependTo(this.getNode(), referenceEl);
        return this._afterInsert();
    },
    getNode: function () {
        var node = this._node;
        var curEl;
        var newBodyEl;
        if (node === undefined) {
            if (this.html) {
                newBodyEl = document.createElement('body');
                newBodyEl.innerHTML = this.html;
                if (newBodyEl.childNodes.length == 1) {
                    // If the rendered component resulted in a single node then just use that node
                    node = newBodyEl.childNodes[0];
                } else {
                    // Otherwise, wrap the nodes in a document fragment node
                    node = document.createDocumentFragment();
                    while ((curEl = newBodyEl.firstChild)) {
                        node.appendChild(curEl);
                    }
                }
            } else {
                // empty HTML so use empty document fragment (so that we're returning a valid DOM node)
                node = document.createDocumentFragment();
            }
            this._node = node;
        }
        return node;
    },
    toString: function() {
        return this.html;
    }
};
module.exports = RenderResult;
},{"raptor-dom":31,"raptor-pubsub":54}],57:[function(require,module,exports){
'use strict';
var asyncWriter = require('async-writer');
var RenderResult = require('./RenderResult');
var extend = require('raptor-util/extend');

 function createRenderFunc(renderer) {
    return function render(input, out, callback) {
        // NOTE: we avoid using Function.apply for performance reasons
        switch (arguments.length) {
            case 0:
                // Arguments: input
                return exports.render(renderer);
            case 1:
                // Arguments: input
                return exports.render(renderer, input);
            case 2:
                // Arguments: input, out|callback
                return exports.render(renderer, input, out);
            case 3:
                // Arguments: input, out, callback
                return exports.render(renderer, input, out, callback);
            default:
                throw new Error('Illegal arguments');
        }
    };
}

exports.render = function (renderer, input, out) {
    var numArgs = arguments.length;
    var callback = arguments[numArgs - 1];
    var actualOut = out;
    var actualData = input || {};

    if (typeof callback === 'function') {
        // found a callback
        if (numArgs === 3) {
            actualOut = asyncWriter.create();
        }
    } else {
        callback = null;
        if (!actualOut) {
            actualOut = asyncWriter.create();
        }
    }

    var $global = actualData.$global;
    if ($global) {
        extend(actualOut.global, $global);
        delete actualData.$global;
    }

    if (typeof renderer !== 'function') {
        var renderFunc = renderer.renderer || renderer.render || renderer.process;

        if (typeof renderFunc !== 'function') {
            throw new Error('Invalid renderer');
        }

        renderFunc.call(renderer, actualData, actualOut);
    } else {
        renderer(actualData, actualOut);
    }

    if (callback) {
        actualOut
            .on('finish', function() {
                callback(null, new RenderResult(actualOut.getOutput(), actualOut));
            })
            .on('error', callback);
        actualOut.end();
    } else {
        // NOTE: If no callback is provided then it is assumed that no asynchronous rendering occurred.
        //       Might want to add some checks in the future to ensure the actualOut is really done
        actualOut.end();
        return new RenderResult(actualOut.getOutput(), actualOut);
    }
};

exports.renderable = function(target, renderer) {
    target.renderer = renderer;
    target.render = createRenderFunc(renderer);
};

exports.createRenderFunc = createRenderFunc;
},{"./RenderResult":56,"async-writer":59,"raptor-util/extend":67}],58:[function(require,module,exports){
arguments[4][24][0].apply(exports,arguments)
},{"_process":6,"dup":24,"events":3}],59:[function(require,module,exports){
arguments[4][25][0].apply(exports,arguments)
},{"./AsyncWriter":58,"dup":25}],60:[function(require,module,exports){
/*
 * Copyright 2011 eBay Software Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


    
/**
 * Used to build a string by using an array of strings as a buffer.
 * When it is ready to be converted to a string the array elements
 * are joined together with an empty space.
 * 
 * @constructs
 * @constructor Initializes an empty StringBuilder
 * @class
 */
function StringBuilder() {
    /**
     * @type Array
     */
    this.array = [];
    /**
     * The length of the string
     * @type Number
     */
    this.length = 0;

}

StringBuilder.prototype = {
        /**
         * Appends a string to the string being constructed.
         * 
         * @param {Object} obj The string or object to append
         * @returns {raptor/strings/StringBuilder} Returns itself
         */
        append: function(obj)
        {
            if (typeof obj !== 'string') {
                obj = obj.toString();
            }
            this.array.push(obj);
            this.length += obj.length;
            
            return this;
        },
        
        /**
         * Converts the string buffer into a String.
         * 
         * @returns {String} The built String
         */
        toString: function()
        {
            return this.array.join('');
        },
        
        /**
         * Clears the string
         * 
         * @returns {raptor/strings/StringBuilder} Returns itself
         */
        clear: function()
        {
            this.array = [];
            this.length = 0;
            return this;
        }
};

StringBuilder.prototype.write = StringBuilder.prototype.append;

module.exports = StringBuilder;
},{}],61:[function(require,module,exports){
/*
 * Copyright 2011 eBay Software Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

require('raptor-polyfill/string/startsWith');
require('raptor-polyfill/string/endsWith');

var EMPTY_STRING = '';
function trim(s){
    return s ? s.trim() : EMPTY_STRING;
}
var StringBuilder = require('./StringBuilder');
var varRegExp = /\$\{([A-Za-z0-9_\.]+)\}/g;

module.exports = {

    compare: function(s1, s2)
    {
        return s1 < s2 ? -1 : (s1 > s2 ? 1 : 0);
    },

    /**
     * @param {string} s The string to operate on
     * @return {boolean} Returns true if the string is null or only consists of whitespace
     *
     * @static
     */
    isEmpty: function(s)
    {
        return s == null || trim(s).length === 0;
    },

    /**
     * @param {string} s The string to operate on
     * @return {integer} Returns the length of the string or 0 if the string is null
     *
     * @static
     */
    length: function(s)
    {
        return s == null ? 0 : s.length;
    },

    /**
     * @param {object} o The object to test
     * @return {boolean} Returns true if the object is a string, false otherwise.
     *
     * @static
     */
    isString: function(s) {
        return typeof s === 'string';
    },

    /**
     * Tests if two strings are equal
     *
     * @param s1 {string} The first string to compare
     * @param s2 {string} The second string to compare
     * @param shouldTrim {boolean} If true the string is trimmed, otherwise the string is not trimmed (optional, defualts to true)
     * @return {boolean} Returns true if the strings are equal, false otherwise
     *
     * @static
     */
    equals: function(s1, s2, shouldTrim)
    {
        if (shouldTrim !== false)
        {
            s1 = trim(s1);
            s2 = trim(s2);
        }
        return s1 == s2;
    },

    /**
     * Tests if two strings are not equal
     *
     * @param s1 {string} The first string to compare
     * @param s2 {string} The second string to compare
     * @param trim {boolean} If true the string is trimmed, otherwise the string is not trimmed (optional, defualts to true)
     * @return {boolean} Returns true if the strings are equal, false otherwise
     *
     * @see {@link #equals}
     * @static
     */
    notEquals: function(s1, s2, shouldTrim)
    {
        return this.equals(s1, s2, shouldTrim) === false;
    },

    trim: trim,

    ltrim: function(s){
        return s ? s.replace(/^\s\s*/,'') : EMPTY_STRING;
    },

    rtrim: function(s){
        return s ? s.replace(/\s\s*$/,'') : EMPTY_STRING;
    },

    startsWith: function(s, prefix) {
        return s == null ? false : s.startsWith(prefix);
    },

    endsWith: function(s, suffix) {
        return s == null ? false : s.endsWith(suffix);
    },

    /**
     *
     * @param c
     * @returns
     */
    unicodeEncode: function(c) {
        return '\\u'+('0000'+(+(c.charCodeAt(0))).toString(16)).slice(-4);
    },

    merge: function(str, data) {
        var varMatches,
            replacement,
            parts = [],
            lastIndex = 0;

        varRegExp.lastIndex = 0;

        while ((varMatches = varRegExp.exec(str))) {
            parts.push(str.substring(lastIndex, varMatches.index));
            replacement = data[varMatches[1]];
            parts.push(replacement !== undefined ? replacement : varMatches[0]);
            lastIndex = varRegExp.lastIndex;
        }

        parts.push(str.substring(lastIndex));
        return parts.join('');
    },

    StringBuilder: StringBuilder,

    createStringBuilder: function() {
        return new StringBuilder();
    }

};

},{"./StringBuilder":60,"raptor-polyfill/string/endsWith":52,"raptor-polyfill/string/startsWith":53}],62:[function(require,module,exports){
var slice = [].slice;

module.exports = function(args, startIndex) {
    if (!args) {
        return [];
    }
    
    if (startIndex) {
        return startIndex < args.length ? slice.call(args, startIndex) : [];
    }
    else
    {
        return slice.call(args);
    }
};
},{}],63:[function(require,module,exports){
var escapeXmlAttr = require('./escapeXml').attr;

module.exports = function(name, value, escapeXml) {
    if (value === true) {
        value = '';
    } else if (value == null || value === '' || value === false) {
        return '';
    } else {
        value = '="' + (escapeXml === false ? value : escapeXmlAttr(value)) + '"';
    }
    return ' ' + name + value;
};
},{"./escapeXml":66}],64:[function(require,module,exports){
var attr = require('./attr');

module.exports = function(_attrs) {
    var out = '';
    for (var attrName in _attrs) {
        if (_attrs.hasOwnProperty(attrName)) {
            out += attr(attrName, _attrs[attrName]);
        }
    }
    return out;
};
},{"./attr":63}],65:[function(require,module,exports){
module.exports = function(message, cause) {
    var error;
    var argsLen = arguments.length;
    var E = Error;
    
    if (argsLen == 2) {
        error = message instanceof E ? message : new E(message);
        if (error.stack) {
            error.stack += '\nCaused by: ' + (cause.stack || cause);
        } else {
            error._cause = cause;    
        }
    } else if (argsLen == 1) {
        error = message instanceof E ? message : new E(message);
    }
    
    return error;
};
},{}],66:[function(require,module,exports){
var elTest = /[&<]/;
var elTestReplace = /[&<]/g;
var attrTest = /[&<>\"\'\n]/;
var attrReplace = /[&<>\"\'\n]/g;
var replacements = {
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    '\'': '&#39;',
    '\n': '&#10;' //Preserve new lines so that they don't get normalized as space
};

function replaceChar(match) {
    return replacements[match];
}

function escapeXml(str) {
    // check for most common case first
    if (typeof str === 'string') {
        return elTest.test(str) ? str.replace(elTestReplace, replaceChar) : str;
    }

    return (str == null) ? '' : str.toString();
}

function escapeXmlAttr(str) {
    if (typeof str === 'string') {
        return attrTest.test(str) ? str.replace(attrReplace, replaceChar) : str;
    }

    return (str == null) ? '' : str.toString();
}


module.exports = escapeXml;
escapeXml.attr = escapeXmlAttr;
},{}],67:[function(require,module,exports){
module.exports = function extend(target, source) { //A simple function to copy properties from one object to another
    if (!target) { //Check if a target was provided, otherwise create a new empty object to return
        target = {};
    }

    if (source) {
        for (var propName in source) {
            if (source.hasOwnProperty(propName)) { //Only look at source properties that are not inherited
                target[propName] = source[propName]; //Copy the property
            }
        }
    }

    return target;
};
},{}],68:[function(require,module,exports){
/**
 * Utility method to iterate over elements in an Array that
 * internally uses the "forEach" property of the array.
 *
 * <p>
 * If the input Array is null/undefined then nothing is done.
 *
 * <p>
 * If the input object does not have a "forEach" method then
 * it is converted to a single element Array and iterated over.
 *
 *
 * @param  {Array|Object} a An Array or an Object
 * @param  {Function} fun The callback function for each property
 * @param  {Object} thisp The "this" object to use for the callback function
 * @return {void}
 */
module.exports = function(a, func, thisp) {
    if (a != null) {
        (a.forEach ? a : [a]).forEach(func, thisp);
    }
};
},{}],69:[function(require,module,exports){
/**
 * Invokes a provided callback for each name/value pair
 * in a JavaScript object.
 *
 * <p>
 * <h2>Usage</h2>
 * <js>
 * raptor.forEachEntry(
 *     {
 *         firstName: "John",
 *         lastName: "Doe"
 *     },
 *     function(name, value) {
 *         console.log(name + '=' + value);
 *     },
 *     this);
 * )
 * // Output:
 * // firstName=John
 * // lastName=Doe
 * </js>
 * @param  {Object} o A JavaScript object that contains properties to iterate over
 * @param  {Function} fun The callback function for each property
 * @param  {Object} thisp The "this" object to use for the callback function
 * @return {void}
 */
module.exports = function(o, fun, thisp) {
    for (var k in o)
    {
        if (o.hasOwnProperty(k))
        {
            fun.call(thisp, k, o[k]);
        }
    }
};
},{}],70:[function(require,module,exports){
var extend = require('./extend');

function _inherit(clazz, superclass, copyProps) { //Helper function to setup the prototype chain of a class to inherit from another class's prototype
    
    var proto = clazz.prototype;
    var F = function() {};
    
    F.prototype = superclass.prototype;

    clazz.prototype = new F();
    clazz.$super = superclass;

    if (copyProps !== false) {
        extend(clazz.prototype, proto);
    }

    clazz.prototype.constructor = clazz;
    return clazz;
}

function inherit(clazz, superclass) {
    return _inherit(clazz, superclass, true);
}


module.exports = inherit;

inherit._inherit = _inherit;
},{"./extend":67}],71:[function(require,module,exports){
module.exports = function isObjectEmpty(o) {
    if (!o) {
        return true;
    }
    
    for (var k in o) {
        if (o.hasOwnProperty(k)) {
            return false;
        }
    }
    return true;
};
},{}],72:[function(require,module,exports){
var inherit = require('./inherit');

module.exports = function(clazz) {
    var superclass;

    if (typeof clazz === 'function') {
        superclass = clazz.$super;
    }
    else {
        var o = clazz;
        clazz = o.$init || function() {};
        superclass = o.$super;

        delete o.$super;
        delete o.$init;

        clazz.prototype = o;
    }
    
    if (superclass) {
        inherit(clazz, superclass);
    }

    var proto = clazz.prototype;
    proto.constructor = clazz;
    
    return clazz;
};
},{"./inherit":70}],73:[function(require,module,exports){
var makeClass = require('./makeClass');
var extend = require('./extend');
var forEachEntry = require('./forEachEntry');

module.exports = function(enumValues, Ctor) {
    if (Ctor) {
        Ctor = makeClass(Ctor);
    } else {
        Ctor = function () {};
    }

    var proto = Ctor.prototype;
    var count = 0;

    function _addEnumValue(name, EnumCtor) {
        var ordinal = count++;
        return extend(Ctor[name] = new EnumCtor(), {
            ordinal: ordinal,
            compareTo: function(other) {
                return ordinal - other.ordinal;
            },
            name: name
        });
    }

    function EnumCtor() {}

    if (Array.isArray(enumValues)) {
        enumValues.forEach(function (name) {
            _addEnumValue(name, Ctor);
        });
    } else if (enumValues) {
        EnumCtor.prototype = proto;
        forEachEntry(enumValues, function (name, args) {
            Ctor.apply(_addEnumValue(name, EnumCtor), args || []);
        });
    }

    Ctor.valueOf = function (name) {
        return Ctor[name];
    };


    if (proto.toString == Object.prototype.toString) {
        proto.toString = function() {
            return this.name;
        };
    }

    return Ctor;
};
},{"./extend":67,"./forEachEntry":69,"./makeClass":72}],74:[function(require,module,exports){
module.exports = {
    tryRequire: require('./tryRequire'),
    inherit: require('./inherit'),
    makeClass: require('./makeClass'),
    makeEnum: require('./makeEnum'),
    extend: require('./extend'),
    forEachEntry: require('./forEachEntry'),
    forEach: require('./forEach'),
    createError: require('./createError'),
    arrayFromArguments: require('./arrayFromArguments'),
    escapeXml: require('./escapeXml'),
    escapeXmlAttr: require('./escapeXml').attr,
    attr: require('./attr'),
    attrs: require('./attrs'),
    isObjectEmpty: require('./isObjectEmpty'),
    toArray: require('./toArray')
};
},{"./arrayFromArguments":62,"./attr":63,"./attrs":64,"./createError":65,"./escapeXml":66,"./extend":67,"./forEach":68,"./forEachEntry":69,"./inherit":70,"./isObjectEmpty":71,"./makeClass":72,"./makeEnum":73,"./toArray":75,"./tryRequire":76}],75:[function(require,module,exports){
var slice = [].slice;

module.exports = function toArray(o) {
    if (o == null || Array.isArray(o)) {
        return o;
    }

    if (typeof o === 'string') {
        return o.split('');
    }

    if (o.length) {
        return slice.call(o, 0);
    }

    return [o];
};
},{}],76:[function(require,module,exports){

module.exports = function(id, require) {
    var path;
    
    try {
        path = require.resolve(id);
    }
    catch(e) {}

    if (path) {
        return require(path);
    }
};
},{}],77:[function(require,module,exports){
require('raptor-polyfill/string/endsWith');
var widgets = require('../');
var repeatedId = require('../lib/repeated-id');
var extend = require('raptor-util/extend');
var escapeXml = require('raptor-util/escapeXml');

exports.widgetArgs = function (out, scope, assignedId, customEvents, extendModule, extendConfig, extendState) {
    var data = out.data;
    var widgetArgs = data.widgetArgs;

    if (!widgetArgs) {
        if (assignedId != null) {
            assignedId = assignedId.toString();

            if (assignedId.endsWith('[]')) {
                assignedId = repeatedId.nextId(out, scope, assignedId);
            }
        }

        widgetArgs = data.widgetArgs = {
            id: assignedId != null ? scope + '-' + assignedId : null,
            scope: scope,
            customEvents: customEvents
        };
    }

    if (extendModule) {
        if (widgetArgs.extend) {
            // The nested extends should come before the outer extends
            // since the extends are applied from left to right and the
            // outer widget will expect for the inner widget to have been
            // patched
            widgetArgs.extend.push(extendModule);
        } else {
            widgetArgs.extend = [extendModule];
        }
    }

    // Merge in the extend config...
    if (extendConfig) {
        widgetArgs.extendConfig = widgetArgs.extendConfig ?
            extend(extendConfig, widgetArgs.extendConfig) :
            extendConfig;
    }

    // Merge in the extend state...
    if (extendState) {
        widgetArgs.extendState = widgetArgs.extendState ?
            extend(extendState, widgetArgs.extendState) :
            extendState;
    }
};

exports.cleanupWidgetArgs = function (out) {
    delete out.data.widgetArgs;
};

exports.widgetBody = function (out, id, content, widget) {
    if (id != null && content == null) {
        // There is no body content so let's see if we should reuse
        // the existing body content in the DOM
        var existingEl = document.getElementById(id);
        if (existingEl) {
            var widgetsContext = widgets.getWidgetsContext(out);
            widgetsContext.addReusableDOMNode(existingEl, true /* body only */);
        }
    } else if (typeof content === 'function') {
        content(out, widget);
    } else {
        if (typeof content === 'string') {
            content = escapeXml(content);
        }
        out.write(content);
    }
};
},{"../":17,"../lib/repeated-id":20,"raptor-polyfill/string/endsWith":52,"raptor-util/escapeXml":66,"raptor-util/extend":67}],78:[function(require,module,exports){
require('marko-widgets');
},{"marko-widgets":17}]},{},[78]);
