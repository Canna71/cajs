var assert = require('chai').assert;
var a = require('../js/algebra');
var Symbol = require('../js/core/symbol').Symbol;
var polynomials = require('../js/core/polynomials');

///// <reference path="../js/core/polynomials.js" />

describe('Polynomials', function () {
    describe('division', function () {
        var tests = [
            {u: "x^2 + 5*x +6", v: "x + 2", out: "3+x"},
            {u: "12*x^3-26*x^2+34", v: "2*x^2-5*x", out: "2+6*x"},
            //{ u: "12*x^3-26x^2+34", v: "2*x^2-5*x", out: "6*x+2"}
        ];

        tests.forEach(function (test) {
            it('& simplify -  ' + test.u, function () {
                var x = a('x');
                var u = a(test.u)._toPolynomial(x);
                var v = a(test.v)._toPolynomial(x);

                var r = u.divideBy(v);
                assert.equal(r.quotient.toString(), test.out);
            });
        });

    });

    describe('expansion', function () {
        var tests = [
            {u: "x^5+11*x^4+51*x^3+124*x^2+159*x+86", v: "x^2+4*x+5",
                out: "1+x+(2+x)*(5+4*x+x^(2))+(3+x)*(5+4*x+x^(2))^(2)"},

        ];

        tests.forEach(function (test) {
            it(' -  ' + test.u, function () {
                var x = a('x');
                var u = a(test.u)._toPolynomial(x);
                var v = a(test.v)._toPolynomial(x);

                var ex = u._expandBy(v);

                assert.equal(ex.toString(), test.out);
            });
        });

    });

    describe('polynomial expansion', function () {
        var tests = [
            {u: "x^5+11*x^4+51*x^3+124*x^2+159*x+86", v: "x^2+4*x+5",
                out: "1+2*t+3*t^(2)+x+t*x+t^(2)*x"},

        ];

        tests.forEach(function (test) {
            it(' -  ' + test.u, function () {
                var x = a('x');
                var t = a('t');
                var u = a(test.u)._toPolynomial(x);
                var v = a(test.v)._toPolynomial(x);

                var ex = u._polynomialExpansion(v, t);

                assert.equal(ex.toString(), test.out);
            });
        });

    });

    describe('expansion-based substitution', function () {


        it('   ', function () {
            var x = a('x');
            var t = a('t');
            var u = a("(x+1)^3+2*(x+1)+4")._toPolynomial(x);
            var v = a("x+1")._toPolynomial(x);

            var ex = u._polynomialExpansion(v, t);

            assert.equal(ex.toString(), "4+2*t+t^(3)");
        });


    });

    describe('GCD', function () {


        it('   ', function () {
            var x = a('x');
            var u = a("x^7-4*x^5-x^2+4")._toPolynomial(x);
            var v = a("x^5-4*x^3-x^2+4")._toPolynomial(x);

            var res = a.Polynomial.GCD(u,v);

            assert.equal(res.toString(), "4-4*x-x^(2)+x^(3)");
        });

        it('   ', function () {
            var x = a('x');
            var u = a("x^2+(-1-2^(1/2))*x")._toPolynomial(x);
            var v = a("x^2+(-2-2*2^(1/2))*x+3+2*2^(1/2)")._toPolynomial(x);

            var res = a.Polynomial.GCD(u,v);

            assert.equal(res.toString(), "4-4*x-x^2+x^3");
        });

    });
});