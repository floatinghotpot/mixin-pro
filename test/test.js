'use strict';

var mixin = require('../mixin');

function A() {
  this._va = 0;
  console.log('A');
}
A.prototype = {
  fa: function() {
    console.log('A->fa()');
  }
};

function B() {
  this._vb = 0;
  console.log('B');
}
B.prototype = {
  fb: function() {
    console.log('B->fb()');
  }
};

function C() {
  this._vc = 0;
  console.log('C');
}
C.prototype = {
  fc: function() {
    console.log('C->fc()');
  }
};

function D(){
  this._vd = 0;
  console.log('D');
}
D.prototype = {
  fd: function() {
  this.fa();
  this.fb();
  this.fc();
  console.log('D->fd()');
  }
};

D = mixin(D, A);
D = mixin(D, B);
D = mixin(D, C);

var d = new D();

console.log(d);
console.log(d.constructor.name);

d.fd();
