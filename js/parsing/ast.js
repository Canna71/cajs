var base = require('../core/expr');
var number = require('../core/number');
var funct = require('../core/function');
var operators = require('../core/operators');
var symbol = require('../core/symbol');




var ast = {

    Addition: operators.Addition,
    Subtraction: operators.Subtraction,
    Product: operators.Product,
    Quotient: operators.Quotient,
    Power: operators.Power,
    Integer: number.Integer,
    Float: number.Float,
    Rational: number.Rational,
    Factorial: operators.Factorial,
    Function: funct.Function,
    FunctionFactory: funct.Factory,
    Symbol: symbol.Symbol
};

if (typeof(module) !== 'undefined') {
    module.exports = ast;
}


