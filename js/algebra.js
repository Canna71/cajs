 var Lexer = require('./parsing/lexer');
var Parser = require('./parsing/parser');
var AST = require('./parsing/ast');

var algebra = (function(Lexer, Parser){
	
	var lexer = new Lexer();
	
	function Algebra(...args){
		if(args.length===1){
			var arg = args[0];
			if(typeof arg === 'string'){
				lexer.setInput(arg);
				var p = new Parser(AST);
				var exp = p.parse(lexer,{});
				exp = exp.simplify();
				return exp;
			}
		}
	}
	
	return Algebra;
	
})(Lexer, Parser);

if(typeof window === 'object') {window.algebra = algebra;}

var number = require('./core/number');
 var symbol = require('./core/symbol');
var Polynomial = require('./core/polynomials');

 algebra.Integer = number.Integer;
 algebra.Symbol = symbol.Symbol;
 algebra.Polynomial = Polynomial;

if (typeof(module) !== 'undefined') {
    module.exports = algebra;
	/*
	{
    	algebra: algebra,
		Integer: number.Integer,
		Symbol: symbol.Symbol,
		Polynomial: polynomials.Polynomial
	};
	*/
} else {

}