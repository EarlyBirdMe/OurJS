/**
 * @fileOverview 提供 JavaScript 原生对象的补缺及扩展。
 * @version 20111101
 * @author: sundongguo@gmail.com
 */
(function() {
  // 内置对象的原型方法。
  var HAS_OWN_PROPERTY = Object.prototype.hasOwnProperty;
  var TO_STRING = Object.prototype.toString;

  // 空白字符。
  var WHITESPACES = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u200B\u2028\u2029\u202F\u205F\u3000\uFEFF';

  // 辅助解决遍历 bug。
  // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys
  var hasDontEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var DONT_ENUM_PROPERTIES = [
    'toString',
    'toLocaleString',
    'valueOf',
    'hasOwnProperty',
    'isPrototypeOf',
    'propertyIsEnumerable',
    'constructor'
  ];
  var DONT_ENUM_PROPERTIES_LENGTH = DONT_ENUM_PROPERTIES.length;

  // 将提供的值转化为整数。
  // http://es5.github.com/#x9.4
  var toInteger = function(value) {
    value = Number(value) || 0;
    value = Math[value < 0 ? 'ceil' : 'floor'](value);
    return value;
  };

  // 将提供的值转化为对象。
  // http://es5.github.com/#x9.9
  var stringIsIndexable = 'x'[0] === 'x';
  var toObject = function(value) {
    if (value == null) {
      throw new TypeError();
    }
    if (!stringIsIndexable && typeof value == 'string') {
      return value.split('');
    }
    return Object(value);
  };

//==================================================[ES5 补缺]
  /*
   * 为旧浏览器添加 ES5 中引入的部分常用方法。
   *
   * 补缺方法：
   *   Object.keys
   *   Array.isArray
   *   Array.prototype.forEach
   *   Array.prototype.map
   *   Array.prototype.filter
   *   Array.prototype.every
   *   Array.prototype.some
   *   Array.prototype.indexOf
   *   Array.prototype.lastIndexOf
   *   Array.prototype.reduce  // TODO: pending
   *   Array.prototype.reduceRight  // TODO: pending
   *   String.prototype.trim
   *   Date.now
   *
   * 参考：
   *   https://github.com/kriskowal/es5-shim/
   */

//--------------------------------------------------[Object.keys]
  /**
   * 获取对象的键列表。
   * @name Object.keys
   * @function
   * @param {Object} object 要获取键列表的对象。
   * @returns {Array} 对象的键列表。
   * @example
   *   Object.keys({a: 97, b: 98, c: 99});
   *   // ['a', 'b', 'c']
   * @see http://es5.github.com/#x15.2.3.14
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys
   * @see http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
   */
  if (!Object.keys) {
    Object.keys = function(object) {
      if (typeof object != 'object' && typeof object != 'function' || object === null) {
        throw new TypeError('Object.keys called on non-object');
      }
      var keys = [];
      for (var name in object) {
        if (HAS_OWN_PROPERTY.call(object, name)) {
          keys.push(name);
        }
      }
      if (hasDontEnumBug) {
        var i = 0;
        while (i < DONT_ENUM_PROPERTIES_LENGTH) {
          var dontEnumProperty = DONT_ENUM_PROPERTIES[i];
          if (HAS_OWN_PROPERTY.call(object, dontEnumProperty)) {
            keys.push(dontEnumProperty);
          }
          i++;
        }
      }
      return keys;
    };
  }

//--------------------------------------------------[Array.isArray]
  /**
   * 检查提供的值是否为数组。
   * @name Array.isArray
   * @function
   * @param {*} value 提供的值。
   * @returns {boolean} 检查结果。
   * @example
   *   Array.isArray([]);
   *   // true
   * @see http://es5.github.com/#x15.4.3.2
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
   */
  if (!Array.isArray) {
    Array.isArray = function(value) {
      return TO_STRING.call(value) === '[object Array]';
    };
  }

//--------------------------------------------------[Array.prototype.indexOf]
  /**
   * 返回数组中第一次出现指定的值的索引。
   * @name Array.prototype.indexOf
   * @function
   * @param {*} searchElement 指定的值。
   * @param {number} [fromIndex] 在数组中的指定索引开始查找，默认为 0。
   *   如果指定的值大于等于数组的长度，则仍使用数组的长度。
   *   如果指定一个负数，则表示从数组的末尾开始计算的偏移量，即使用 fromIndex + length（数组的长度）作为查找起始点，如果这个结果仍为负数，则使用 0 作为最终结果。
   * @returns {number} 索引值，如果数组中不包含指定的值，则返回 -1。
   * @example
   *   [1, 2, 3, 2, 1].indexOf(2);
   *   // 1
   *   [1, 2, 3, 2, 1].indexOf(2, 2);
   *   // 3
   *   [1, 2, 3, 2, 1].indexOf(2, -3)
   *   // 3
   *   [1, 2, 3, 2, 1].indexOf(8)
   *   // -1
   * @see http://es5.github.com/#x15.4.4.14
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
   */
  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(searchElement) {
      var object = toObject(this);
      var length = object.length >>> 0;
      if (!length) {
        return -1;
      }
      var i = 0;
      if (arguments.length > 1) {
        i = toInteger(arguments[1]);
        if (i < 0) {
          i = Math.max(0, length + i);
        }
      }
      while (i < length) {
        if (i in object && object[i] === searchElement) {
          return i;
        }
        i++;
      }
      return -1;
    };
  }

//--------------------------------------------------[Array.prototype.lastIndexOf]
  /**
   * 返回数组中最后一次出现指定的值的索引。
   * @name Array.prototype.lastIndexOf
   * @function
   * @param {*} searchElement 指定的值。
   * @param {number} [fromIndex] 在数组中的指定索引开始查找，默认为数组的长度。
   *   如果指定的值大于等于数组的长度，则仍使用数组的长度。
   *   如果指定一个负数，则表示从数组的末尾开始计算的偏移量，即使用 (fromIndex + 数组的长度) 作为查找起始点，如果这个结果仍为负数，则使用 0 作为最终结果。
   * @returns {number} 索引值，如果数组中不包含指定的值，则返回 -1。
   * @example
   *   [1, 2, 3, 2, 1].lastIndexOf(2);
   *   // 3
   *   [1, 2, 3, 2, 1].lastIndexOf(2, 2);
   *   // 1
   *   [1, 2, 3, 2, 1].lastIndexOf(2, -3)
   *   // 1
   *   [1, 2, 3, 2, 1].lastIndexOf(8)
   *   // -1
   * @see http://es5.github.com/#x15.4.4.15
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/lastIndexOf
   */
  if (!Array.prototype.lastIndexOf) {
    Array.prototype.lastIndexOf = function(searchElement) {
      var object = toObject(this);
      var length = object.length >>> 0;
      if (!length) {
        return -1;
      }
      var i = length - 1;
      if (arguments.length > 1) {
        i = Math.min(i, toInteger(arguments[1]));
        if (i < 0) {
          i = length + i;
        }
      }
      while (i > -1) {
        if (i in object && object[i] === searchElement) {
          return i;
        }
        i--;
      }
      return -1;
    };
  }

//--------------------------------------------------[Array.prototype.every]
  /**
   * 检查数组中的所有元素是否都符合某个条件。
   * @name Array.prototype.every
   * @function
   * @param {Function} callback 用来检查的回调函数。
   *   回调函数有三个参数：当前元素，当前元素的索引和调用该方法的数组对象。
   *   回调函数返回 true 表示当前元素通过检查，反之表示未通过检查。
   * @param {Object} [thisObject] 执行回调函数时 this 的值，如果省略或指定为 null，则使用全局对象 window。
   * @returns {boolean} 检查结果。
   * @example
   *   [1, 2, 3].every(function(item) {
   *     return item < 5;
   *   });
   *   // true
   * @see http://es5.github.com/#x15.4.4.16
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/every
   */
  if (!Array.prototype.every) {
    Array.prototype.every = function(callback) {
      var object = toObject(this);
      var thisObject = arguments[1];
      var length = object.length >>> 0;
      if (typeof callback !== 'function') {
        throw new TypeError('Array.prototype.every');
      }
      var i = 0;
      while (i < length) {
        if (i in object && !callback.call(thisObject, object[i], i, object)) {
          return false;
        }
        i++;
      }
      return true;
    };
  }

//--------------------------------------------------[Array.prototype.some]
  /**
   * 检查数组中是否有任一元素符合某个条件。
   * @name Array.prototype.some
   * @function
   * @param {Function} callback 用来检查的回调函数。
   *   回调函数有三个参数：当前元素，当前元素的索引和调用该方法的数组对象。
   *   回调函数返回 true 表示当前元素通过检查，反之表示未通过检查。
   * @param {Object} [thisObject] 执行回调函数时 this 的值，如果省略或指定为 null，则使用全局对象 window。
   * @returns {boolean} 检查结果。
   * @example
   *   [1, 2, 3].some(function(item) {
   *     return item === 2;
   *   });
   *   // true
   * @see http://es5.github.com/#x15.4.4.17
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/some
   */
  if (!Array.prototype.some) {
    Array.prototype.some = function(callback) {
      var object = toObject(this);
      var thisObject = arguments[1];
      var length = object.length >>> 0;
      if (typeof callback !== 'function') {
        throw new TypeError('Array.prototype.some');
      }
      var i = 0;
      while (i < length) {
        if (i in object && callback.call(thisObject, object[i], i, object)) {
          return true;
        }
        i++;
      }
      return false;
    };
  }

//--------------------------------------------------[Array.prototype.forEach]
  /**
   * 遍历数组，对数组中的每一个元素都执行一次指定的函数。
   * @name Array.prototype.forEach
   * @function
   * @param {Function} callback 对数组中的每个元素都执行一次的回调函数。
   *   回调函数有三个参数：当前元素，当前元素的索引和调用该方法的数组对象。
   * @param {Object} [thisObject] 执行回调函数时 this 的值，如果省略或指定为 null，则使用全局对象 window。
   * @example
   *   var s = '';
   *   [1, 2, 3].forEach(function(item) {
   *     s += item;
   *   });
   *   s;
   *   // 123
   * @see http://es5.github.com/#x15.4.4.18
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/forEach
   */
  if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(callback) {
      var object = toObject(this);
      var thisObject = arguments[1];
      var length = object.length >>> 0;
      if (typeof callback !== 'function') {
        throw new TypeError('Array.prototype.forEach');
      }
      var i = 0;
      while (i < length) {
        if (i in object) {
          callback.call(thisObject, object[i], i, object);
        }
        i++;
      }
    };
  }

//--------------------------------------------------[Array.prototype.map]
  /**
   * 对数组中的每一个元素都执行一次回调函数，并返回一个包含这个回调函数的每次执行后的返回值的新数组。
   * @name Array.prototype.map
   * @function
   * @param {Function} callback 对数组中的每个元素都执行一次的回调函数。
   *   回调函数有三个参数：当前元素，当前元素的索引和调用该方法的数组对象。
   * @param {Object} [thisObject] 执行回调函数时 this 的值，如果省略或指定为 null，则使用全局对象 window。
   * @returns {Array} 包含 callback 的每次执行后的返回值的新数组。
   * @example
   *   var a = [1, 2, 3].map(function(item) {
   *     return item + 10;
   *   });
   *   a;
   *   // [11, 12, 13]
   * @see http://es5.github.com/#x15.4.4.19
   * @see https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map
   */
  if (!Array.prototype.map) {
    Array.prototype.map = function(callback) {
      var object = toObject(this);
      var thisObject = arguments[1];
      var length = object.length >>> 0;
      if (typeof callback !== 'function') {
        throw new TypeError('Array.prototype.map');
      }
      var result = new Array(length);
      var i = 0;
      while (i < length) {
        if (i in object) {
          result[i] = callback.call(thisObject, object[i], i, object);
        }
        i++;
      }
      return result;
    };
  }

//--------------------------------------------------[Array.prototype.filter]
  /**
   * 对数组中的每一个元素都执行一次回调函数，并且创建一个新的数组，该数组包含所有回调函数执行后返回值为 true 时对应的原数组元素。
   * @name Array.prototype.filter
   * @function
   * @param {Function} callback 对数组中的每个元素都执行一次的回调函数。
   *   回调函数有三个参数：当前元素，当前元素的索引和调用该方法的数组对象。
   * @param {Object} [thisObject] 执行回调函数时 this 的值，如果省略或指定为 null，则使用全局对象 window。
   * @returns {Array} 包含所有回调函数执行后返回值为 true 时对应的原数组元素的新数组。
   * @example
   *   var a = [1, 2, 3].filter(function(item) {
   *     return item % 2 === 1;
   *   });
   *   a;
   *   // [1, 3]
   * @see http://es5.github.com/#x15.4.4.20
   * @see https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/filter
   */
  if (!Array.prototype.filter) {
    Array.prototype.filter = function(callback) {
      var object = toObject(this);
      var thisObject = arguments[1];
      var length = object.length >>> 0;
      if (typeof callback !== 'function') {
        throw new TypeError('Array.prototype.filter');
      }
      var result = [];
      var i = 0;
      var item;
      while (i < length) {
        if (i in object) {
          item = object[i];
          if (callback.call(thisObject, item, i, object)) {
            result.push(item);
          }
        }
        i++;
      }
      return result;
    };
  }

//--------------------------------------------------[String.prototype.trim]
  /**
   * 删除字符串两端的空白符。
   * @name String.prototype.trim
   * @function
   * @returns {string} 删除两端的空白符后的字符串。
   * @example
   *   '  hello '.trim();
   *   // 'hello'
   * @see http://blog.stevenlevithan.com/archives/faster-trim-javascript
   * @see http://es5.github.com/#x15.5.4.20
   */
  if (!String.prototype.trim || WHITESPACES.trim()) {
    var RE_START_WHITESPACES = new RegExp('^[' + WHITESPACES + ']+');
    var RE_END_WHITESPACES = new RegExp('[' + WHITESPACES + ']+$');
    String.prototype.trim = function() {
      return String(this).replace(RE_START_WHITESPACES, '').replace(RE_END_WHITESPACES, '');
    };
  }

//--------------------------------------------------[Date.now]
  /**
   * 获取系统当前的时间戳。
   * @name Date.now
   * @function
   * @returns {number} 系统当前的时间戳。
   * @example
   *   Date.now() === new Date().getTime();
   *   // true
   * @see http://es5.github.com/#x15.9.4.4
   */
  if (!Date.now) {
    Date.now = function() {
      return new Date().getTime();
    };
  }

//==================================================[ES6 补缺]
  /*
   * 添加 ES6 中引入的部分常用方法。
   *
   * 补缺方法：
   *   String.prototype.repeat
   *   String.prototype.startsWith
   *   String.prototype.endsWith
   *   String.prototype.contains
   *   String.prototype.toArray
   *   Number.isFinite
   *   Number.isNaN
   *   Number.isInteger
   *   Number.toInteger
   *
   * 参考：
   *   http://wiki.ecmascript.org/doku.php?id=harmony:harmony
   */

//--------------------------------------------------[String.prototype.repeat]
  /**
   * 将字符串重复指定的次数。
   * @name String.prototype.repeat
   * @function
   * @param {number} count 要重复的次数。
   * @returns {string} 重复指定次数后的字符串。
   * @example
   *   '*'.repeat(5);
   *   // '*****'
   * @see http://wiki.ecmascript.org/doku.php?id=harmony:string.prototype.repeat
   */
  String.prototype.repeat = function(count) {
    count = toInteger(count);
    var result = '';
    while (count) {
      result += this;
      count--;
    }
    return result;
  };

//--------------------------------------------------[String.prototype.startsWith]
  /**
   * 检查字符串是否以指定的子串开始。
   * @name String.prototype.startsWith
   * @function
   * @param {string} subString 指定的子串。
   * @returns {boolean} 检查结果。
   * @example
   *   'abcdefg'.startsWith('a');
   *   // true
   * @see http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
   */
  String.prototype.startsWith = function(subString) {
    return this.indexOf(subString) === 0;
  };

//--------------------------------------------------[String.prototype.endsWith]
  /**
   * 检查字符串是否以指定的子串结束。
   * @name String.prototype.endsWith
   * @function
   * @param {string} subString 指定的子串。
   * @returns {boolean} 检查结果。
   * @example
   *   'abcdefg'.endsWith('a');
   *   // false
   * @see http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
   */
  String.prototype.endsWith = function(subString) {
    var lastIndex = this.lastIndexOf(subString);
    return lastIndex >= 0 && lastIndex === this.length - subString.length;
  };

//--------------------------------------------------[String.prototype.contains]
  /**
   * 检查字符串是否包含指定的子串。
   * @name String.prototype.contains
   * @function
   * @param {string} subString 指定的子串。
   * @returns {boolean} 检查结果。
   * @example
   *   'abcdefg'.contains('cd');
   *   // true
   * @see http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
   */
  String.prototype.contains = function(subString) {
    return this.indexOf(subString) !== -1;
  };

//--------------------------------------------------[String.prototype.toArray]
  /**
   * 将字符串转化为数组。
   * @name String.prototype.toArray
   * @function
   * @returns {Array} 从字符串转化的数组。
   * @example
   *   'abcdefg'.toArray();
   *   // ['a', 'b', 'c', 'd', 'e', 'f', 'g']
   * @see http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
   */
  String.prototype.toArray = function() {
    return this.split('');
  };

//--------------------------------------------------[Number.isFinite]
  /**
   * 检查提供的值是否为有限的数字。
   * @name Number.isFinite
   * @function
   * @param {*} value 提供的值。
   * @returns {boolean} 检查结果。
   * @example
   *   isFinite(null);
   *   // true
   *   Number.isFinite(null);
   *   // false
   * @see http://wiki.ecmascript.org/doku.php?id=harmony:number.isfinite
   */
  Number.isFinite = function(value) {
    return typeof value === 'number' && isFinite(value);
  };

//--------------------------------------------------[Number.isNaN]
  /**
   * 检查提供的值是否为非数字。
   * @name Number.isNaN
   * @function
   * @param {*} value 提供的值。
   * @returns {boolean} 检查结果。
   * @example
   *   isNaN(undefined);
   *   // true
   *   Number.isNaN(undefined);
   *   // false
   * @see http://wiki.ecmascript.org/doku.php?id=harmony:number.isnan
   */
  Number.isNaN = function(value) {
    return typeof value === 'number' && isNaN(value);
  };

//--------------------------------------------------[Number.isInteger]
  /**
   * 检查提供的值是否为整数。
   * @name Number.isInteger
   * @function
   * @param {*} value 提供的值。
   * @returns {boolean} 检查结果。
   * @example
   *   Number.isInteger(9007199254740992);
   *   // false
   * @see http://wiki.ecmascript.org/doku.php?id=harmony:number.isinteger
   */
  Number.isInteger = function(value) {
    return Number.isFinite(value) && Math.floor(value) === value && value > -9007199254740992 && value < 9007199254740992;
  };

//--------------------------------------------------[Number.toInteger]
  /**
   * 将提供的值转化为整数。
   * @name Number.toInteger
   * @function
   * @param {*} value 提供的值。
   * @returns {number} 转化结果。
   * @example
   *   Number.toInteger([10.75]);
   *   // 10
   *   Number.toInteger('10px');
   *   // 0
   * @see http://wiki.ecmascript.org/doku.php?id=harmony:number.tointeger
   */
  Number.toInteger = toInteger;

//==================================================[自定义扩展]
  /*
   * 其他自定义的扩展方法。
   *
   * 扩展方法：
   *   Object.forEach
   *   Object.clone
   *   Object.append
   *   Array.from
   *   Array.prototype.contains
   *   String.prototype.clean
   *   Number.prototype.padZero
   *   Math.limit
   *   Math.randomRange
   *   RegExp.escape
   */

//--------------------------------------------------[Object.forEach]
  /**
   * 遍历一个对象。
   * @name Object.forEach
   * @function
   * @param {Object} object 要遍历的对象。
   * @param {Function} callback 用来遍历的函数，参数为 value，key，object。
   * @param {Object} [thisObj] 遍历函数的 this 值。
   */
  Object.forEach = function(object, callback, thisObj) {
    for (var key in object) {
      if (HAS_OWN_PROPERTY.call(object, key)) {
        callback.call(thisObj, object[key], key, object);
      }
    }
    if (hasDontEnumBug) {
      var i = 0;
      while (i < DONT_ENUM_PROPERTIES_LENGTH) {
        var dontEnumProperty = DONT_ENUM_PROPERTIES[i];
        if (HAS_OWN_PROPERTY.call(object, dontEnumProperty)) {
          callback.call(thisObj, object[dontEnumProperty], dontEnumProperty, object);
        }
        i++;
      }
    }
  };

//--------------------------------------------------[Object.clone]
  /**
   * 克隆一个对象，返回克隆后的新对象。
   * @name Object.clone
   * @function
   * @param {Object} source 原始对象。
   * @param {boolean} [recursive] 是否进行深克隆。
   * @returns {Object} 克隆后的新对象。
   * @description
   *   原型链中的 properties 不会被克隆。
   */
  Object.clone = function(source, recursive) {
    var cloning;
    switch (typeOf(source)) {
      case 'object.Array':
        cloning = [];
        source.forEach(function(item, i) {
          cloning[i] = recursive ? Object.clone(item, true) : item;
        });
        break;
      case 'object.Object':
        cloning = {};
        Object.forEach(source, function(value, key) {
          cloning[key] = recursive ? Object.clone(value, true) : value;
        });
        break;
      default:
        cloning = source;
    }
    return cloning;
  };

//--------------------------------------------------[Object.append]
  /**
   * 为一个对象追加另一个对象自身（不包含原型链）的 properties。
   * @name Object.append
   * @function
   * @param {Object} original 原始对象。
   * @param {Object} appending 追加对象，其 properties 会被复制到 original 中。
   * @param {Object} [filter] 过滤要复制的 appending 的 properties 的名单。
   * @param {Array} filter.whiteList 仅在 appending 中的 key 包含于 whiteList 时，对应的 property 才会被复制到 original 中。
   * @param {Array} filter.blackList 如果 appending 中的 key 包含于 blackList，则对应的 property 不会被复制到 original 中。
   *   如果 blackList 与 whiteList 有重复元素，则 whiteList 中的该元素将被忽略。
   * @returns {Object} 追加后的 original 对象。
   * @description
   *   appending 中的 property 会覆盖 original 中的同名 property。
   *   <table>
   *     <tr><th>original (before)</th><th>appending</th><th>original (after)</th></tr>
   *     <tr><td>a: 'a.0'</td><td></td><td>a: 'a.0'</td></tr>
   *     <tr><td>b: 'b.0'</td><td>b: 'b.1'</td><td>b: 'b.1'</td></tr>
   *     <tr><td></td><td>c: 'c.1'</td><td>c: 'c.1'</td></tr>
   *   </table>
   * @example
   *   var original = {a: 'a.0'};
   *   var appending = {b: 'b.1'};
   *   JSON.stringify(Object.append(original, appending));
   *   // {"a":"a.0","b":"b.1"}
   * @example
   *   var original = {a: 'a.0', b: 'b.0', c: 'c.0'};
   *   var appending = {a: 'a.1', b: 'b.1', c: 'c.1'};
   *   JSON.stringify(Object.append(original, appending, {whiteList: ['a', 'b']}));
   *   // {"a":"a.1","b":"b.1","c":"c.0"}
   *   JSON.stringify(Object.append(original, appending, {whiteList: ['a', 'b'], blackList: ['b', 'c']}));
   *   // {"a":"a.1","b":"b.0","c":"c.0"}
   * */
  Object.append = function(original, appending, filter) {
    var keys = Object.keys(appending);
    if (filter) {
      var whiteList = filter.whiteList;
      var blackList = filter.blackList;
      if (whiteList) {
        keys = whiteList.filter(function(item) {
          return keys.contains(item);
        });
      }
      if (blackList) {
        keys = keys.filter(function(item) {
          return !blackList.contains(item);
        });
      }
    }
    keys.forEach(function(item) {
      original[item] = appending[item];
    });
    return original;
  };

//--------------------------------------------------[Array.from]
  /**
   * 将类数组对象转化为数组，如果该对象不是一个类数组对象，则返回一个仅包含该对象的数组。
   * @name Array.from
   * @function
   * @param {*} arrayish 要转化为数组的对象。
   * @returns {Array} 转化后的数组。
   */
  Array.from = function(arrayish) {
    var result = [];
    var length;
    var type = typeOf(arrayish);
    if (type === 'object.Array') {
      result = arrayish;
    } else if (typeof (length = arrayish.length) !== 'number' || type === 'string' || type === 'function' || type === 'object.RegExp' || type === 'object.Global') {
      result.push(arrayish);
    } else {
      var i = 0;
      while (i < length) {
        result[i] = arrayish[i];
        i++;
      }
    }
    return result;
  };

//--------------------------------------------------[Array.prototype.contains]
  /**
   * 检查数组中是否包含指定的元素。
   * @name Array.prototype.contains
   * @function
   * @param {*} element 指定的元素。
   * @returns {boolean} 检查结果。
   * @example
   *   [0, 1, 2, 3, 4].contains(2);
   *   // true
   */
  Array.prototype.contains = function(element) {
    return this.indexOf(element) !== -1;
  };

//--------------------------------------------------[String.prototype.clean]
  var RE_WHITESPACES = new RegExp('[' + WHITESPACES + ']+', 'g');

  /**
   * 合并字符串中的空白字符，并去掉首尾的空白字符。
   * @name String.prototype.clean
   * @function
   * @returns {string} 清理后的字符串。
   * @example
   *   ' a b  c   d    e     f      g       '.clean();
   *   // 'a b c d e f g'
   */
  String.prototype.clean = function() {
    return this.replace(RE_WHITESPACES, ' ').trim();
  };

//--------------------------------------------------[Number.prototype.padZero]
  /**
   * 在数字左侧补零，以使数字更整齐。
   * @name Number.prototype.padZero
   * @function
   * @param {number} digits 数字总位数（包括整数位和小数位），当数字实际位数小于指定的数字总位数时，会在左侧补零。
   * @returns {string} 补零后的数字、NaN、Infinity 或 -Infinity 的字符形式。
   */
  Number.prototype.padZero = function(digits) {
    var sign = (this < 0) ? '-' : '';
    var number = Math.abs(this) + '';
    if (isFinite(this)) {
      var length = number.length - (Math.ceil(this) == this ? 0 : 1);
      if (length < digits) {
        number = '0'.repeat(digits - length + 1) + number;
      }
    }
    return sign + number;
  };

//--------------------------------------------------[Math.limit]
  /**
   * 将输入数字限制于 min 和 max 之间（包含 min 和 max）。
   * @name Math.limit
   * @function
   * @param {number} number 输入的数字。
   * @param {number} min 允许的数字下限。
   * @param {number} max 允许的数字上限。
   * @returns {number} 输出的数字。
   * @example
   *   Math.limit(100, 0, 80);
   *   // 80
   *   Math.limit(NaN, 0, 80);
   *   // 0
   * @see http://mootools.net/
   */
  Math.limit = function(number, min, max) {
    return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : (number === Infinity ? max : min);
  };

//--------------------------------------------------[Math.randomRange]
  /**
   * 生成介于 min 和 max 之间（包含 min 和 max）的伪随机整数。
   * @name Math.randomRange
   * @function
   * @param {number} min 要获取的随机数的下限，整数。
   * @param {number} max 要获取的随机数的上限，整数。
   * @returns {number} 生成的伪随机整数。
   * @see http://mootools.net/
   */
  Math.randomRange = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

//--------------------------------------------------[RegExp.escape]
  var RE_REGULAR_EXPRESSION_METACHARACTERS = /([.*+?^=!:${}()|[\]\/\\])/g;

  /**
   * 为字符串编码，避免创建正则表达式时破坏预期的结构。
   * @name RegExp.escape
   * @function
   * @param {string} string 要编码的字符串。
   * @returns {string} 编码后的字符串。
   * @see http://prototypejs.org/
   */
  RegExp.escape = function(string) {
    return (string + '').replace(RE_REGULAR_EXPRESSION_METACHARACTERS, '\\$1');
  };

})();
