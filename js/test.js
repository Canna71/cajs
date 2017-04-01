/*var Lexer = require('./lexer');
var Parser = require('./parser');
var AST = require('./ast');
var lexer = new Lexer();

lexer.setInput("3 * (x - 0.5)");*/

/*
var token = lexer.nextToken();

while(!lexer.isEOF(token)){
    console.log(token);
    token = lexer.nextToken();
}
*/

/*var p = new Parser(AST);
var exp = p.parse(lexer,{});
console.log(exp);*/

var a = require('./algebra');

    //"a + (1-x)*(1-x)^2" -> a+(1-x)^3
    //"5*x + 4*x + 2*y" -> 9*x+2*y
    //"(5*x) / (4*x) + 2*y" -> 5/4+2*y
    //"3*f(c,y) + 5*f(c,y) + 2*y" => 8*f(c,y)+2*y
    //"((x*y)^(1/2)*z^2)^2" > x*y*z^4
//"(-3-(-1-a))*x-4-3*(-1-a)"

/*

var exp = a("((x*y)^(1/2)*z^2)^2");
console.log(exp.toString());

console.log(exp.expand().toString());


console.log(exp.expand().simplify().toString());

*/


//inserted comment
//added another line here

/*
var x = a('x');
var u = a("x^2+(-1-2^(1/2))*x")._toPolynomial(x);
var v = a("x^2+(-2-2*2^(1/2))*x+3+2*2^(1/2)")._toPolynomial(x);

var res = a.Polynomial.GCD(u,v);
console.log(res.toString());
*/

//var shouldBe0 = "3+2*2^(1/2)-14*(1+2^(1/2))^(-1)-10*2^(1/2)*(1+2^(1/2))^(-1)-3*(1+2^(1/2))^(-2)*(-3-2*2^(1/2))-2*2^(1/2)*(1+2^(1/2))^(-2)*(-3-2*2^(1/2))";
//var shouldBe0 = '1/(1+2^(1/2))-2/(2+2*2^(1/2))';
//var shouldBe0 = '2/(2+2*2^(1/2))-1/(1+2^(1/2))';
 var shouldBe0 = '-4/(2^(1/2)+1)+2*2^(1/2)-2*2^(1/2)/(1+2^(1/2))';
var zero = a(shouldBe0);
console.log(zero.toString());
//var ex = a("3+2*2^1/2-14*(1+2^1/2)^-1-10*2^1/2*(1+2^1/2)^-1-3*(1+2^1/2)^-2*(-3-2*2^1/2)-2*2^1/2*(1+2^1/2)^-2*(-3-2*2^1/2)');
//var ex = a('3');
//console.log(ex.toString());


var exp = a('3');