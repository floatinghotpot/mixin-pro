/*
  mixin-pro.js - multi-inherit with mixin in constructors in JavaScript.

  Copyright 2016, Raymond Xie <rjfun.mobile@gmail.com>.

  Thanks for mixin code by Lee Iverson <leei@sociologi.ca>.

 */

var util = require('util');

/**
 * Create a function simulated class, allow multiple inheritance

  var mapping = {
    constructor: function Foo() {},
    method: function(){},
  });

  Foo = createClass(mapping);
  Foo = createClass(base, mapping);
  Foo = createClass([base1, base2, ...], mapping);

 * By Raymond Xie <rjfun.mobile@gmail.com>, 2016/1/26
 */
function createClass() {
  var mixins, definition;
  switch(arguments.length) {
    case 0:
      throw "class definition required";
      break;
    case 1:
      definition = arguments[0];
      mixins = [];
      break;
    default:
      mixins = arguments[0];
      definition = arguments[1];
      break;
  }

  var base;
  if(typeof definition['constructor'] === 'function') {
    base = definition['constructor'];
    delete definition['constructor'];
  } else {
    base = function(){};
  }

  base.prototype = definition;
  base.prototype.constructor = base;
  base.prototype.instanceOf = function(baseclass) {
    if(this instanceof baseclass) return true;
    return subOf(this.constructor, baseclass);
  };;
  if(!mixins) return base;

  if(Array.isArray(mixins)) {
    for(var i=mixins.length-1; i>=0; i--) {
      base = mixin(base, mixins[i]);
    }
    return base;
  } else {
    return mixin(base, mixins);
  }
}

function subOf(sub, mixin) {
  if(sub === mixin) return true;
  if(sub && sub.constructors) {
    for(var i in sub.constructors) {
      if((sub.constructors[i] !== sub) && subOf(sub.constructors[i], mixin)) return true;
    }
  }
  return false;
}

/**
 * Mix the {mixin} constructor into the {base} constructor.  Ensures that the
 * all properties of {mixin} are available in {ctor} both for the constructor
 * and its prototype.
 *
 * The following are guaranteed consequences of the mixin:
 * * Will not mixin the same constructor twice.
 * * More than one constructor may be mixed in to the same {base}.
 * * Invokes the function {mixin.included(base)} after the mixin, if it is defined.
 * * {new ctor(...)} will invoke the constructors of all mixed in constructors and
 *   the original constructor in reverse order of their being mixed in.
 * * Properties of the {base} constructor and all previous mixins have priority over
 *   those of the {mixin}.
 *
 * @param {Function} base  The constructor that {mixin} will be added to.
 * @param {Function} mixin The constructor that will be mixed in to {base}.
 *
 */
function mixin(base, mixin) {
  var ctor = base;
  if (base.constructors) {
    //if(subOf(base, mixin)) return base;
    // Don't mixin the same constructor twice.
    for (var i in base.constructors) {
      if (base.constructors[i] === mixin)
        return base;
    }
    // Remember this new one.
    base.constructors.unshift(mixin);
  } else {
    // Remember all mixed in classes
    base.constructors = [mixin, base];
    // Create a function with the same name, that calls both functions...
    ctor = base.prototype.constructor = mixin_constructor(base.name, base);
    ctor.__proto__ = base;
  }

  // Inject the mixin prototype at the top of the chain
  ctor.prototype = insert_proto(base.prototype, mixin.prototype);
  //inspect_protos(ctor.prototype, "ctor.prototype");

  insert_proto(ctor.__proto__, mixin);
  //inspect_protos(ctor, "ctor");

  // Inform mixin that it has been included
  if (mixin.hasOwnProperty('included')) {
    var incl = mixin.included.call(mixin, ctor);
    if (incl) { ctor = incl; }
  }

  return ctor;
}

function mixin_constructor(name, ctor) {
  var str = "function __ctor() { var c = ctor.constructors; for (var i in c) { c[i].apply(this, arguments); } };".replace(/__ctor/g, name);
  eval(str);
  return eval(name);
}

function isEmpty(ob) {
  for(var i in ob) return false;
  return true;
}

function insert_proto(base, mixin) {
  //console.log('\n' + base.name + ' <- ' + mixin.name);
  //inspect_protos(base,  "\ninserting: base ");
  //inspect_protos(mixin, "\ninserting: mixin");
  var copy = copyInto({}, mixin);
  copy.__mixed_in = true;

  // Find
  for (var p = base, prev = base; p.__mixed_in; prev = p, p = p.__proto__) {}
  if (p === base) { p.__mixed_in = true; } // Mark this as mixed in
  // inspect_protos(copy, "\ninserting: copy");
  copy.__proto__ = prev.__proto__;
  prev.__proto__ = copy;
  //inspect_protos(base, "\ninserted: base");

  // insert further, if mixin itself has been mixed in
  for(var q = mixin.__proto__; q; q = q.__proto__) {
    if(q && !isEmpty(q))
      insert_proto(base, q);
  }

  return base;
}

function copyInto(copy, obj) {
  var names = Object.getOwnPropertyNames(obj);
  for (var i in names) {
    var p = names[i];
    if (p !== 'prototype') {
      var descr = Object.getOwnPropertyDescriptor(obj, p);
      //console.log("obj." + p + " = " + util.inspect(descr));
      Object.defineProperty(copy, p, descr);
    }
  }
  return copy;
}
mixin.copyInto = copyInto;

function inspect_protos(obj, name) {
  console.log(name + " = " + util.inspect(obj));
  var i = 0;
  while (obj.__proto__) {
    obj = obj.__proto__;
    console.log("  __proto__[" + i + "] = " + util.inspect(obj));
    ++i;
  }
}

/**
 * Alias a property that is already defined for this Object. Moves the existing
 * property definition on {obj[method]} to {method}_without_{suffix} and
 * assigns {f} to both {method}_with_{suffix} and {method}.
 *
 * For example, the following code will override the "save" method of the
 * {ctor.prototype} with {my_save} and make the old version available as
 * {save_without_timestamp}.
 *
 *     Mixin.included = function(ctor) {
 *       mixin.alias(ctor.prototype, "save", "timestamp", my_save);
 *     }
 *
 * @param {Object} obj    The target object.
 * @param {String} method The base method name.
 * @param {String} suffix A suffix that will be added to the method name(s).
 * @param {Function} f    The function to use to override the method.
 * @api public
 */
function alias(obj, method, suffix, f) {
  if (obj[method + "_without_" + suffix]) {
    throw(method + "_without_" + suffix + " already defined.");
  }

  var was = obj[method];
  obj[method + "_without_" + suffix] = was;
  obj[method + "_with_" + suffix] = obj[method] = f;
}

mixin.alias = alias;

mixin.createClass = createClass;
mixin.inherit = createClass;

module.exports = mixin;
