'use strict';

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

// test mixin
console.log('\ntesting mixin');

var mixin = require('../mixin');

D = mixin(D, A);
D = mixin(D, B);
D = mixin(D, C);

var d = new D();

console.log(d);
console.log(d.constructor.name);

d.fd();

// test multi inherit
console.log('\ntesting multi inherit');

var inherit = require('../mixin').inherit;

var E = inherit([A, B, C], {
  constructor: function E() {
    this._ve = 0;
    console.log('E');
  },
  fe: function() {
    this.fa();
    this.fb();
    this.fc();
    console.log('E->fe()');
  },
});

var e = new E();
console.log(e);
console.log(e.constructor.name);

e.fe();
