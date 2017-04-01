var assert = require('chai').assert;
var a = require('../js/algebra');



describe('Expression', function() {
    describe('parse',function() {
        var tests = [
            { in: "a + (1-x)*(1-x)^2", out: "a+(1-x)^(3)" },
            { in: "(5*x) / (4*x) + 2*y", out: "5/4+2*y" },
            { in: "3*f(c,y) + 5*f(c,y) + 2*y", out: "8*f(c,y)+2*y" },
            { in: "((x*y)^(1/2)*z^2)^2", out: "x*y*z^(4)" },
            { in: "(-3-(-1-a))*x-4-3*(-1-a)", out: "-1+3*a+(-2+a)*x" },
            { in: "5*x + 4*x + 2*y", out: "9*x+2*y" }
        ];
        tests.forEach(function(test) {
           
            it('& simplify -  ' + test.in, function() {
                var exp = a(test.in);
            
                assert.equal(exp.toString(), test.out);
            });
        });

    });
});