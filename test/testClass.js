'use strict';

var Class = require('../mixin').createClass;

var A = Class({
  constructor: function A(){
    this._fa = 0;
    console.log('A');
  },
  fa: function() {
    console.log('A->fa()');
  },
});

var B = Class({
  constructor: function B(){
    this._fb = 0;
    console.log('B');
  },
  fb: function() {
    console.log('B->fb()');
  },
});

var C = Class({
  constructor: function C(){
    this._fc = 0;
    console.log('C');
  },
  fc: function() {
    console.log('C->fc()');
  },
});

var D = Class(C, {
  constructor: function D(){
    this._fd = 0;
    console.log('D');
  },
  fd: function() {
    console.log('D->fd()');
  },
});

var E = Class([A, B, D], {
  constructor: function E(){
    this._fe = 0;
    console.log('E');
  },
  fe: function() {
    this.fa();
    this.fb();
    //this.fc();
    this.fd();
    console.log('E->fe()');
  },
});

console.log(A.prototype);
console.log(B.prototype);
console.log(C.prototype);
console.log(D.prototype);
console.log(E.prototype);

var e = new E();

console.log(e);
console.log(e.constructor.name);
console.log('e.instanceOf(A) -> ' + e.instanceOf(A));
console.log('e.instanceOf(B) -> ' + e.instanceOf(B));
console.log('e.instanceOf(C) -> ' + e.instanceOf(C));
console.log('e.instanceOf(D) -> ' + e.instanceOf(D));
console.log('e.instanceOf(E) -> ' + e.instanceOf(E));

e.fe();

