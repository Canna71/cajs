(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"./core/number":4,"./core/polynomials":6,"./core/symbol":7,"./parsing/ast":9,"./parsing/lexer":10,"./parsing/parser":11}],2:[function(require,module,exports){
/**
 * Created by Gabriele on 08/07/2016.
 */
var Num = require('bignumber.js');

var operators = {};
var symbol = {};
var number = {};
var funct = {};

class Expr {

    constructor() {
        this.isAtom = false;
    }

    eval(context) {
        throw Error('Should not directly Eval this');
    }

    static _tryEval(ob, context) {
        if (typeof ob.eval === 'function') {
            return ob.eval(context);
        } else {
            return ob;
        }
    }

    simplify() {
        return this;
    }

    subst(subs){
        return this;
    }

    expand(){
        return this;
    }
    get base(){
        return this;
    }

    get exponent(){
        return new number.Integer(1);
    }

    get term(){
        return new operators.Product(this);
    }

    get const(){
        return new number.Integer(1);
    }

    get classArgOrder(){
        return 0;
    }

    *iterateArgs(){
        yield this;
    }

    *iterateExpr() {
        yield this;

    }

    has(other){
        for(var exp of this.iterateExpr()){
            if(exp._compareTo(other)===0){
                return true;
            }
        }
        return false;
    }


    get argumentOrder() {
        return {
            class:this.classArgOrder,
            name: '-',//name
            order: 0 //order
        };
    }


    static _compareArgs(a,b){
        return a._compareTo(b);
    }

    get isZero(){
        return undefined;
    }

    isNumeric(){
        return false;
    }

    _compareTo(other){
        throw Error('Not Implemented');
    }

    //by default, numbers are first
    _compareToNumber(other){
       return 1;
    }

    _compareToProd(other){
        if(this.classArgOrder>1)
            return Nary._compareArgsList([this],other.args);
        return this._compareTo(other);
    }

    _compareToPower(other){
       if(this.classArgOrder > 2){
           //compare as power
           return new (operators.Power)(this,1)._compareTo(other);
       }
        return this._compareTo(other);

    }

    _compareToAdd(other){
        if(this.classArgOrder > 3){
            return Nary._compareArgsList([this], other.args);
        }

        return this._compareTo(other);
    }

    _compareToFactorial(other){
        if(this.classArgOrder > 4){
            if(this._compareTo(other.args[0])===0){
                return -1;
            } else {
                return new operators.Factorial(this)._compareTo(other);
            }
        }

        return this._compareTo(other);
    }

    _compareToFunction(other){
        if(this.classArgOrder > 5){
            var cmp = this._compareTo(new symbol.Symbol(other.name));
           if(cmp===0){
               return -1;
           } else return cmp;
        }
        return this._compareTo(other);
    }

    _compareToSymbol(other){

        return this._compareTo(other);
    }

    static _compareNumbers(a,b){
        if(a < b) return -1;
        if(a > b) return 1;
        return 0;
    }

    toLaTEX(){
        return this.toString();
    }
}

class Atom extends Expr {
    constructor() {
        super();
        this.isAtom = true;
    }

    toLaTEX(){
        return this.toString();
    }

    get classArgOrder(){
        return 0;
    }
}



class Nary extends Expr {
    constructor(...args) {
        super();
        this._args = args;
    }

    eval(context) {


    }


    expand(){
        var sa = this._args.map(a => a.expand());
        return (new this.constructor(...sa)).simplify();
    }

    subst(subs){
        var sa = this._args.map(a => a.subst(subs));
        return (new this.constructor(...sa)).simplify();
    }

    isNumeric(){
        return this.args.every(a => a.isNumeric());
    }

    static _flatten(args, cls){
        //flatten arguments
        var tmp = [];
        var num = null;
        for(var arg of args){
            if(arg instanceof cls){
                tmp = tmp.concat(arg.args);
            } else {
                tmp.push(arg);
            }
        }

        return tmp;
    }



    static _compareArgsList(alist, blist){
        var ia = alist.length-1;
        var ib = blist.length-1;

        while(ia>=0 && ib>=0){
            var comparison = alist[ia]._compareTo(blist[ib]);
            if(comparison !== 0) return comparison;
            ia--;
            ib--;
        }

        if(alist.length < blist.length) return -1;
        if(alist.length > blist.length) return 1;
        return 0;


    }

    static _compareArgs2(_a,_b){
        var a = _a.argumentOrder;
        var b = _b.argumentOrder;

        if(a.class<b.class) return -1;
        if(a.class>b.class) return 1;
        //same class, go on

        //higher order first
        if(a.order > b.order ) return -1;
        if(a.order < b.order ) return 1;

        //same order, go on
        if(a.name < b.name) return -1;
        if(a.name > b.name) return 1;
        return 0;
    }

    static _sortArgs(args){
        return args.sort(Expr._compareArgs);
    }

    get args() {
        return this._args;
    }

    get numOfArgs() {
        return this._args.length;
    }


    *iterateArgs() {
        for(var arg of this.args){
            yield *arg.iterateArgs();
        }
    }

    *iterateExpr() {
        yield this;
        for(var arg of this.args){
            yield *arg.iterateExpr();
        }
    }

    map(func, ...args){
        if(! func instanceof funct.Function){
            throw Error("Parameter must be a Function");
        }
        var newArgs = this.args.map((a)=>new func.constructor(func._name, a, ...args));
        return new this.constructor(...newArgs);
    }

    get classArgOrder(){
        return 5;
    }

    get argumentOrder(){
        return {
            class:this.classArgOrder,
            name: this.args[0].argumentOrder.name,//name
            order: 0 //order
        };
    }
}

var basic = {
    Expr,
    Number,
    Atom,
    Nary
};



if (typeof(module) !== 'undefined') {
    module.exports = basic;
}

Object.assign(operators, require('./operators'));
Object.assign(symbol, require('./symbol'));
Object.assign(number, require('./number'));
Object.assign(funct, require('./function'));

},{"./function":3,"./number":4,"./operators":5,"./symbol":7,"bignumber.js":12}],3:[function(require,module,exports){
/**
 * Created by Gabriele on 08/07/2016.
 */

var base = require('./expr');
var symbol = require('./symbol');


function Factory(name, ...args) {
    return new Function(name, ...args);

}

class Function extends base.Nary {
    constructor(name, ...args) {

        super(...args);
        this._name = name;
    }

    eval(context){
        throw Error(`Can't evaluate function "${this._name}"`);
    }

    toString(){
        return this._name + '(' + this._args.map(a => a.toString()).join(',') + ')';
    }

    get name(){
        return this._name;
    }

    simplify(){
        var sa = this._args.map(a=>a.simplify());
        if(sa.indexOf(symbol.Undefined)>-1) return symbol.Undefined;
        return new Function(this._name,...sa);
    }

    get argumentOrder(){
        return [
            this.classArgOrder,
            this._name,//name
            ' //order'
        ];
    }

    get classArgOrder(){
        return 5;
    }

    _compareTo(other){
        return -1*other._compareToFunction(this);
    }

    _compareToFunction(other){
        var comp = this._name.localeCompare(other._name);
        if(comp != 0) return comp;
        //for functions, first argument is most significant
        return base.Nary._compareArgsList(this.args.reverse(), other.args.reverse());
    }
}

if (typeof(module) !== 'undefined') {
    module.exports = {
        Function: Function,
        Factory: Factory
    };
}
},{"./expr":2,"./symbol":7}],4:[function(require,module,exports){
/**
 * Created by gcannata on 09/07/2016.
 */
var base = require('./expr');
var symbol = require('./symbol');
var Num = require('bignumber.js');

if (typeof(module) !== 'undefined') {
    module.exports = {

    };
}

class Number extends base.Atom {
    constructor(digits) {
        super();
        if (digits instanceof Num) {
            this._val = digits;
        } else {

            this._val = new Num(digits);
        }

    }

    static fromNumber(num){
        if(num.isInt()) return new Integer(num);
        else return new Float(num);
    }

    get base(){
        return symbol.Undefined;
    }

    get exponent(){
        return symbol.Undefined;
    }

    get term(){
        return symbol.Undefined;
    }

    get const(){
        return symbol.Undefined;
    }

    isNumeric(){
        return true;
    }

    simplify(){
        return this;
    }

    eval() {

        return this._val;
    }

    equals(other){
        return this._val.equals(other._val);
    }

    greaterThan(other){
        return this._val.greaterThan(other._val);
    }

    lessThan(other){
        return this._val.lessThan(other._val);
    }

    add(other) {
        if(other instanceof Rational){
            var num = this._val.times(other._denominator);
            if(num.isInteger()){
                return new Rational(num.add(other._val), other._denominator).simplify();
            } else {
                num = num.add(other._val).dividedBy(other._denominator);
                return new Float(num);
            }
        }
        return Number.fromNumber(this._val.add(other._val));
    }

    minus(other) {
        return Number.fromNumber(this._val.minus(other._val));
    }

    times(other) {
        if(other instanceof Rational){
            var num = this._val.times(other._val);
            if(num.isInteger()){
                return new Rational(num, other._denominator).simplify();
            } else {
                num = num.dividedBy(other._denominator);
                return new Float(num);
            }
        }
        return Number.fromNumber(this._val.times(other._val));
    }

    pow(other) {
        return Number.fromNumber(this._val.pow(other._val));
    }

    abs(){
        return Number.fromNumber(this._val.abs());
    }

    get isPositive() {
        return !(this.isZero) && !(this.isNegative);
    }

    get isNegative() {
        return this.value.isNegative();
    }

    get isZero() {
        return this.value.isZero();
    }

    get isOne() {
        return false;
    }

    toString() {
        return this._val.toString();
    }

    get value() {
        return this._val;
    }

    _compareTo(other){
        return -1*other._compareToNumber(this);
    }

    _compareToNumber(other){
        if(this.equals(other)) return 0;
        if(this.lessThan(other)) return -1;
        return 1;
    }
}



const MAXDENOMINATOR = 100;

class Float extends Number {

    simplify(){
        var rat  = this._val.toFraction();
        var denominator = new Num(rat[1]);
        if(denominator.lessThanOrEqualTo(MAXDENOMINATOR)){
            var num = new Num(rat[0]);
            return new Rational(num, denominator).simplify();
        }
        return this;


    }

}



class Rational extends Number {

    constructor(numerator, denominator){
        super(numerator);
        this._denominator = new Num(denominator);
        if(this._denominator.isNegative()){
            this._val = this._val.times(-1);
            this._denominator = this._denominator.times(-1);
        }
        //this.simplify();
    }

    simplify(){
        var gcd = Integer.GCD(this._val.abs(), this._denominator.abs());



        this._val = this._val.dividedToIntegerBy(gcd);
        this._denominator = this._denominator.dividedToIntegerBy(gcd);
        if(this._denominator.equals(1)){
            return new Integer(this._val);
        }
        else return this;
    }

    greaterThan(other){
        throw new Error('Not implemented');
    }

    add(other) {
        if(other instanceof Float){
            return other.add(this);
        }
        else {
            var num = this._val.times(other._denominator).plus(other._val.times(this._denominator));
            var den = this._denominator.times(other._denominator);
            var rat = new Rational(num, den);

            return rat.simplify();
        }
    }

    minus(other) {
        if(other instanceof Float){
            throw new Error('Not implemented');
        }
        else {
            var num = this._val.times(other._denominator).minus(other._val.times(this._denominator));
            var den = this._denominator.times(other._denominator);
            var rat = new Rational(num, den);

            return rat.simplify();
        }
    }

    times(other) {
        if(other instanceof Float){
            return other.times(this);
        }
        var num = this._val.times(other._val);
        var den = this._denominator.times(other._denominator);
        return new Rational(num,den).simplify();
    }

    pow(other) {
        if(other instanceof Float){
            throw new Error('Not implemented');
        }
        var num = this._val.pow(other._val);
        var den = this._denominator.pow(other._val);
        return new Rational(num,den).simplify();

    }

    abs(){
        return new Rational(this._val.abs(), this._denominator);
    }

    get isPositive() {
        return !this._val.isNegative() && ! this._val.isZero();
    }

    get isNegative() {
        return this._val.isNegative();
    }

    get isZero() {
        return this._val.isZero()
    }

    toString() {
        return this._val.toString()+'/'+this._denominator.toString();
    }

    toLaTEX(){
        return "\\frac{"+this._val.toString()+'}{'+this._denominator.toString()+'}';
    }

    get value() {
        throw new Error('Not implemented');
    }
}



class Integer extends Rational {

    constructor(value){
        super(value,1);
    }

    get isOne() {
        return this._val.equals(1);
    }

    factorial() {
        if(this.value.isNegative()){
            throw Error('Factorial of a negative number is not defined');
        }
        if(this.value.isZero()){
            return new Integer(1);
        }
        var acc = new Num(1);
        var n = this.value;
        while (n.greaterThan(1)) {
            acc = acc.times(n);
            n = n.minus(1);
        }
        return new Integer(acc);
    }

    simplify(){
        return this;
    }

    static GCD(i1,i2){
        /*
         if(i2.lessThan(i1)){
         return Integer.GCD(i2,i1);
         }
*/


        while(!i2.isZero()){
            var t = i2;
            i2 = i1.modulo(i2);
            i1 = t;
        }
        return i1;
    }

    toString() {
        return this._val.toString();
    }

    toLaTEX(){
        return this.toString();
    }

    get value(){
        return this._val;
    }
}




Integer.One = new Integer("1");


if (typeof(module) !== 'undefined') {
    Object.assign(module.exports,
     {
        Number: Number,
        Float: Float,
        Rational: Rational,
        Integer: Integer,
         Zero: new Integer(0),
         One: new Integer(1)
    });
}

},{"./expr":2,"./symbol":7,"bignumber.js":12}],5:[function(require,module,exports){
/**
 * Created by Gabriele on 08/07/2016.
 */

var base = require('./expr');
var Num = require('bignumber.js');
var symbol = require('./symbol');
var number = require('./number');
var utils = require('./utils');

var Rational = number.Rational;
var Integer = number.Integer;
var Number = number.Number;

var operators = {};

if (typeof(module) !== 'undefined') {
    module.exports = operators;
}

class Operator extends base.Nary {
    eval(context) {
        var evaluatedArgs = this._args.map((arg) =>
            base.Node._tryEval(arg, context)
        );
        var result = evaluatedArgs.reduce(this._eval);
        return result;
    }

    toString() {
        return this._args.map(a => (this.prec && a.prec && a.prec > this.prec) ? '(' + a.toString() + ')' : a.toString()).join(this.opName);
    }

    toLaTEX() {
        return this._args.map(a => (this.prec && a.prec && a.prec > this.prec) ? '(' + a.toLaTEX() + ')' : a.toLaTEX()).join(this.opName);

    }

    get opName() {
        return '§';
    }


}

class Addition extends Operator {

    _eval(previous, arg, index, args) {
        previous = previous || new Num(0);
        return previous.plus(arg);
    }


    simplify() {
        if(this.numOfArgs===0) return this;
        var terms = this.args.map(a=>a.simplify());
        //(a=>((a instanceof Product) && (a.args[0] instanceof Number)) ? a.expand() : a).map
        //if associative flatten arguments
        terms = base.Nary._flatten(terms, Addition);


        var c = null;
        //Sum numbers
        var t = [];

        var simplify = false;

        for (var i in terms) {
            if (terms[i] == symbol.Undefined) return symbol.Undefined;
            if (terms[i] instanceof Number) {
                var n = terms[i];
                c =( c && c instanceof Number ) ? c.add(n) : n;
                //TODO: what if is constant (es: 1+sqrt(2))
                //shouldn't we try and add it to another constant?
            }
                /*
            else if( terms[i].isNumeric()){

                if(!c){
                    c = terms[i]
                }
            }
            */
            else if (terms[i] instanceof Product && terms[i].args[0] instanceof Integer && terms[i].args[1] instanceof Addition) {
                //NOTE: not sure this is correct to do
                //is it possible this leads to larger expressions that what we started?
                t.push(terms[i].expand());
                simplify = true;
            } else {
                t.push(terms[i]);
            }
        }


        if (t.length == 0) {
            //we have only numbers
            return c;
        }

        //avoid summing 0
        if (c !== null && !c.isZero) t.push(c);

        //if commutative sort arguments
        t = base.Nary._sortArgs(t);

        var tmp3 = [t[0]];

        for (var i = 1; i < t.length; i++) {
            var top = tmp3.length - 1;


            if (t[i].term._compareTo(tmp3[top].term) == 0) {
                //same term, we sum the constant
                tmp3[top] = new Product(new Addition(t[i].const, tmp3[top].const), t[i].term).simplify();

            }
                /*
            else if(t[i] instanceof Product && t[i].has(tmp3[top])){
                //t+t*something=>c(1+something)
                //TODO: generalize
                //TODO: only collect if constant
                tmp3[top] = new Product(tmp3[top], new Addition(number.One,
                    new Quotient(t[i], tmp3[top]))).simplify();

            }
            */
            else {
                tmp3.push(t[i]);
            }
        }


        //The unary multiplication MUST be simplified
        if (tmp3.length > 1) {
            var ret = new Addition(...tmp3);
            if (simplify) ret = ret.simplify();
            return ret;
        }

        else
            return tmp3[0];

    }

    get opName() {
        return '+';
    }

    get prec() {
        return 5;
    }

    get classArgOrder() {
        return 3;
    }

    _compareTo(other) {
        return -1 * other._compareToAdd(this);
    }

    _compareToAdd(other) {
        return base.Nary._compareArgsList(this.args, other.args);
    }


    toString() {

        var s = "";
        for (var i = 0; i < this.numOfArgs; i++) {
            var a = this._args[i];
            var sa = a.toString();
            var fa = (this.prec && a.prec && a.prec > this.prec) ? "(" + sa + ")" : sa;
            if (i > 0 && sa[0] !== '-') {
                s += "+";
            }
            s += fa;

        }
        return s;
    }

    toLaTEX() {
        var s = "";
        for (var i = 0; i < this.numOfArgs; i++) {
            var a = this.args[i];
            var sa = a.toLaTEX();
            var fa = (this.prec && a.prec && a.prec > this.prec) ? "(" + sa + ")" : sa;
            if (i > 0 && sa[0] !== '-') {
                s += "+";
            }
            s += fa;

        }
        return s;
    }

}

class Subtraction extends Operator {

    _eval(previous, arg, index, args) {
        previous = previous || new Num(0);
        return previous.minus(arg);
    }

    get _operation() {
        return Num.minus;
    }


    simplify() {

        var a1 = this.args[0].simplify();
        var a2 = this.args[1].simplify();
        if (a1 == symbol.Undefined) return symbol.Undefined;
        if (a2 == symbol.Undefined) return symbol.Undefined;
        if (a2.isZero) return a2;
        if (a1.isZero) return new Product(new Integer(-1), a2).simplify();
        //HACK!!!
        //we try to get rid of some otherwise unsimplifiable artifacts due to mested multiplications
        return new Addition(a1, new Product(new Integer(-1), a2)).simplify();//.expand().simplify();
    }


    get opName() {
        return '-';
    }

    get prec() {
        return 5;
    }
}

class Product extends Operator {

    simplify() {
        var factors = this._args.map(a=>a.simplify());

        //if associative flatten arguments
        factors = base.Nary._flatten(factors, Product);

        var c = null;
        //Multiply constants
        var t = [];

        for (var i in factors) {

            if (factors[i] == symbol.Undefined) return symbol.Undefined;

            if (factors[i] instanceof Number) {
                var n = factors[i];
                c = (c && c instanceof Number) ? c.times(n) : n;
            }
            /*
            else if (factors[i].isNumeric()){
                //we are dealing with Powers
                if(!c) c = factors[i];
                else if (factors[i].exponent && factors[i].exponent <{
                    
                }
            }
            */
            else {
                t.push(factors[i]);
            }
        }

        //TODO find powers with same base

        if (t.length == 0) {
            //we have only numbers
            return c;
        }

        //avoid multiplying by 1
        if (c !== null) {
            if (c.isZero) return new Integer(0);
            else if (!c.isOne) {
                t.push(c);
            }
        }


        //if commutative sort arguments
        t = base.Nary._sortArgs(t);


        var tmp3 = [t[0]];

        var mustSimplify = false;

        for (var i = 1; i < t.length; i++) {
            var top = tmp3.length - 1;
            if (t[i].base._compareTo(tmp3[top].base) == 0) {
                //same base, we sum the exponent

                tmp3[top] = new Power(t[i].base, new Addition(t[i].exponent, tmp3[top].exponent)).simplify();
                mustSimplify = true;

            } else {
                tmp3.push(t[i]);
            }
        }

        //TODO, after simplification, we might have some numbers


        //The unary multiplication MUST be simplified
        if (tmp3.length == 1) {
            return tmp3[0];
        }
        else {
            var ret = new Product(...tmp3);
            if (mustSimplify) ret = ret.simplify();
            return ret;
        }

    }

    expand() {
        var argssum = this.args.map((arg) => {
                if (arg instanceof Addition) return arg;
                else return new Addition(arg);
            }
        );

        var current = argssum.pop();
        while (argssum.length > 0) {
            //multiply top with current
            var top = argssum.pop();

            var tmp = [];
            for (var a of current.args) {
                for (var b of top.args) {
                    var mul = new Product(a, b);
                    tmp.push(mul);
                }
            }
            current = new Addition(...tmp);

        }
        return current.simplify();
    }

    get opName() {
        return '*';
    }

    get prec() {
        return 4;
    }

    get term() {
        if (this.args[0] instanceof Number) {
            return new Product(...this.args.slice(1));
        } else return this;
    }

    get const() {
        if (this.args[0] instanceof Number) {
            return this.args[0];
        } else return new Integer(1);
    }

    _compareTo(other) {
        return -1 * other._compareToProd(this);
    }

    _compareToProd(other) {
        return base.Nary._compareArgsList(this.args, other.args);
    }

    get classArgOrder() {
        return 1;
    }

    toString() {
        //TODO: remove -1* and use - in front

        return this._args.map(a =>
            (this.prec && a.prec && a.prec > this.prec) ?
            '(' + a.toString() + ')' : a.toString()).join(this.opName).replace("-1*", "-");
    }

    toLaTEX() {
        //TODO: remove -1*
        var nums = this._args.filter((a) => (!(a instanceof Power) || (!a.exponent.isNegative)));
        var dens = this._args.filter((a) => (a instanceof Power) && (a.exponent.isNegative));

        var latexNums = nums.map(a =>
            (this.prec && a.prec && a.prec > this.prec) ?
            '(' + a.toLaTEX() + ')' : a.toLaTEX()).join("\\cdot").replace("-1\\cdot", "-");

        var latexDens = dens.map(a =>
            (this.prec && a.prec && a.prec > this.prec) ?
            '(' + a.toLaTEX() + ')' : a.toLaTEX()).join("\\cdot").replace("-1\\cdot", "-");
        if (dens.length > 0)
            return "\\frac{" + latexNums + "}{" + latexDens + "}";
        else
            return latexNums;
    }

}

class Quotient extends Operator {

    _eval(previous, arg, index, args) {
        if (!previous) return arg;
        return previous.dividedBy(arg);
    }

    simplify() {
        var sa = this._args.map(a=>a.simplify());

        if (sa[1].isZero || sa[0] == symbol.Undefined || sa[1] == symbol.Undefined) return symbol.Undefined;
        if (sa[0].isZero) {
            return new Integer(0);
        }

        if (sa[1] instanceof Integer && sa[1].isOne) {
            return sa[0];
        }

        if ((sa[0] instanceof Integer) &&
            (sa[1] instanceof Integer) && !sa[0].isZero && !sa[1].isZero
        ) {
            return (new Rational(sa[0], sa[1])).simplify();
        } else {
            var p = new Product(
                sa[0], new Power(sa[1], new Integer(-1))
            );
            p = p.simplify();
            return p;
        }
    }

    get opName() {
        return '/';
    }

    get prec() {
        return 4;
    }

    toLaTEX() {
        return "\\frac{" + this.args[0].toLaTEX() + '}{' + this.args[1].toLaTEX() + '}';
    }
}

class Power extends Operator {

    _eval(previous, arg, index, args) {
        if (!previous) return arg;
        return previous.toPower(arg);
    }

    get opName() {
        return '^';
    }


    simplify() {
        var b = this.base.simplify();
        var e = this.exponent.simplify();

        if (b == symbol.Undefined || e == symbol.Undefined) {
            return symbol.Undefined;
        }

        if (b.isZero) {
            if (e.isPositive) return new Integer(0);
            //NOTE: most CAS won't simplify to undefined, so I won't
            //else return symbol.Undefined;
        }
        if (b instanceof Integer && b.isOne) return new Integer(1);

        if (e instanceof Integer) {
            if (e.isZero) {
                if (!b.isZero) return new Integer(1)
                else return symbol.Undefined;
            }
            if (e.isOne) {
                return b;
            }


            if (b instanceof Number) {
                if (e.isPositive)
                    return b.pow(e);
                else
                    return new Rational(number.One, b.pow(e.abs()));
            }

            if (b instanceof Power) {
                //(u^x)^n
                var newExp = new Product(b.exponent, e);
                return new Power(b.base, newExp).simplify();
            }

            if (b instanceof Product) {
                //(u*v)^n
                return new Product(
                    ...(b.args.map((arg)=> new Power(arg, e)))
                ).simplify();
            }
        }

        return new Power(b, e);
    }

    expand() {
        if (this.base instanceof Addition && this.exponent instanceof Integer) {
            var m = this.base.numOfArgs;
            var nws = this.exponent.value.toNumber();
            var n = Math.abs(nws);

            var multcoef = utils.multinomialCoefficients(m, n);
            var terms = [];
            for (var mc of multcoef) {
                var p = new Product(
                    new Integer(mc.coeff),
                    ...(mc.orders.map((o, i) => new Power(this.base.args[i], new Integer(o)))
                    )
                );
                terms.push(p);
            }
            return new Power(new Addition(...terms), new Integer(Math.sign(nws))).simplify();
        } else return this;
    }

    get prec() {
        return 3;
    }

    get base() {
        return this.args[0];
    }

    get exponent() {
        return this.args[1];
    }


    get classArgOrder() {
        return 2;
    }

    _compareTo(other) {
        return -1 * other._compareToPower(this);
    }


    _compareToPower(other) {
        var comparison = this.base._compareTo(other.base);
        //if bases different, compare bases
        if (comparison !== 0) return comparison;

        if (this.args[1] < other.args[1]) return -1;
        if (this.args[1] > other.args[1]) return 1;
        return 0;
    }

    toString() {
        var a = this.base;
        var sa = a.toString();
        var fa = (this.prec && a.prec && a.prec > this.prec) ? "(" + sa + ")" : sa;
        return fa + '^(' + this.exponent.toString()+')';
    }

    toLaTEX() {
        var a = this._args[0];
        var sa = a.toLaTEX();
        var fa = (this.prec && a.prec && a.prec > this.prec) ? "(" + sa + ")" : sa;
        if (this.exponent instanceof Integer && this.exponent.isNegative) {
            var newExp = this.exponent.value.times(-1);
            if (newExp.equals(1)) return fa;
            else return fa + '^{' + new Integer(newExp).toLaTEX() + '}';
        } else {

            return fa + '^{' + this.args[1].toLaTEX() + '}';
        }

    }
}

class Factorial extends Operator {

    _eval(previous, arg, index, args) {
        if (!previous) return arg;
        return _factorial(arg);
    }

    get opName() {
        return '!';
    }


    simplify() {
        var a = this.args[0].simplify();
        if (a == symbol.Undefined) return symbol.Undefined;

        if (a instanceof Integer && !a.isNegative) {
            return a.factorial(a);
        } else {
            return new Factorial(a);
        }
    }

    toString() {
        var a = this.args[0];

        return ((a.prec && a.prec > this.prec) ? '(' + a.toString() + ')' : a.toString() ) + '!';
    }

    toLaTEX() {
        var a = this.args[0];

        return ((a.prec && a.prec > this.prec) ? '(' + a.toLaTEX() + ')' : a.toLaTEX() ) + '!';

    }

    get prec() {
        return 2;
    }

    get classArgOrder() {
        return 4;
    }

    _compareTo(other) {
        return -1 * other._compareToFactorial(this);
    }


    _compareToFactorial(other) {
        return Nary._compareArgs(this.args[0], other.args[0]);
    }
}

Object.assign(operators, {
    Addition: Addition,
    Subtraction: Subtraction,
    Product: Product,
    Quotient: Quotient,
    Power: Power,
    Factorial: Factorial
});


},{"./expr":2,"./number":4,"./symbol":7,"./utils":8,"bignumber.js":12}],6:[function(require,module,exports){
/**
 * Created by gcannata on 15/07/2016.
 */

var base = require('./expr');
var operators = require('./operators');
var symbol = require('./symbol');
var number = require('./number');

var Addition = operators.Addition;
var Product = operators.Product;
var Power = operators.Power;
var Integer = number.Integer;
var Symbol = symbol.Symbol;
var Quotient = operators.Quotient;

class Polynomial extends Addition {
    constructor(...args){
        //HACK: in order to keep the Polynomial as an Nary expression
        //we had to hijack the last argument to put the variable(s)
        var variables = args[args.length-1];

        super(...(args.slice(0,-1)));
        if(variables.length) {
            this.variables = variables;
            this.variable = variables[0];
        }
        else {
            this.variables = [variables];
            this.variable = variables;
        }


        this._coeffs = [];
        for(var arg of this.args){
            var i = Polynomial._degree(arg,this.variable);
            var t = this._coeffs[i];
            var c = Polynomial._coeff(arg, this.variable);
            if(typeof t === 'undefined'){
                this._coeffs[i] = c;
            } else {
                this._coeffs[i] = new Addition(t,c).simplify();
            }
        }

        //if length=N, that means max degree is N-1
        this._degree = this._coeffs.length-1;
        //we store coefficients with highest one at position 0
        this._coeffs.reverse();
    }


    static _fromCoefficients(coeffs,x){
        var exp = Polynomial._expandFromCoefficients(coeffs,x);
        return exp._toPolynomial(x);
    }

    //returns an expression which is the expansion in terms of exp
    //with coefficients coeffs
    static _expandFromCoefficients(coeffs,exp){
        var d = coeffs.length-1;
        var terms = [];

        for(var i=0;i<coeffs.length;i++){
            if(coeffs[i] && !coeffs[i].isZero){
                var t = new Product(coeffs[i],new Power(exp,new Integer(d-i))).simplify();
                terms.push(t);
            }

        }
        return new Addition(...terms).simplify();
    }

    // Synthetic polynomials division taken from
    // https://en.wikipedia.org/wiki/Synthetic_division
    static quotient(u,v){
        //we reverse the coefficients so the higher is at position 0
       var dividend = u._coeffs.slice(0)//.reverse();
        var divisor = v._coeffs.slice(0)//.reverse();
        var out = dividend.slice(0); //copy the dividend
        var normalizer = divisor[0];
        for(var i = 0;i<dividend.length-divisor.length+1;i++){
            //for non monic polynomials
            out[i] = new operators.Quotient(out[i],normalizer).simplify();
            //we need to normalize by dividing the coefficient with the divisor's first coefficient
            var coef = out[i];
            if(!coef.isZero){
                for(var j=1;j<divisor.length;j++){
                    out[i+j] = new operators.Addition(
                        out[i+j] || number.Zero,
                        new operators.Product(divisor[j] || number.Zero,coef,new Integer(-1))).simplify();
                }
            }
        }
        //The resulting out contains both the quotient and the remainder,
        // the remainder being the size of the divisor (the remainder
        // has necessarily the same degree as the divisor since it is
        // what we couldn't divide from the dividend), so we compute the index
        // where this separation is, and return the quotient and remainder.

        var separator = out.length-(divisor.length-1);

        var quotient = out.slice(0,separator);
        var remainder = out.slice(separator);

        var result = {
            quotient: quotient,
            remainder: remainder
        };
        
        return result;

    }

    divideBy(other){
        var division = Polynomial.quotient(this,other);
        var quotient = Polynomial._fromCoefficients(division.quotient,this.variable);
        var remainder = Polynomial._fromCoefficients(division.remainder, this.variable);
        return {
            quotient: quotient,
            remainder: remainder
        }
    }

    expand(){
        var sa = this._args.map(a => a.expand());
        return (new this.constructor(...sa, this.variables)).simplify();
    }

    _calculateExpansionCoefficients(other){
        var dlist = []
        var division = this.divideBy(other);
        var c = division.quotient;
        var d = division.remainder;
        dlist.push(d);
        while(c && c.args && c.numOfArgs && !c.isZero){ //we might need to do a compare here
            division = c.divideBy(other);
            c = division.quotient;
            d = division.remainder;
            dlist.push(d);
        }
        return dlist.reverse();
    }

    _expandBy(other){
        var dlist = this._calculateExpansionCoefficients(other);
        var ret = Polynomial._expandFromCoefficients(dlist,other);
        return ret;
    }

    _polynomialExpansion(v,t){

        if(!(t instanceof Symbol)){
            throw Error('t must be a symbol');
        }
        var dlist = this._calculateExpansionCoefficients(v);
        var ret = Polynomial._expandFromCoefficients(dlist,t);
        ret = ret.expand().simplify();
        return ret;

    }

    subst(subs){
        var sa = this._args.map(a => a.subst(subs));
        return (new this.constructor(...sa, this.variables)).simplify();
    }

    /*
    simplify(){
        return super.simplify()._toPolynomial(this.variables);
    }
    */

    get leadingCoefficient(){
        return this._coeffs.length>0 ? this._coeffs[0] : 0;
    }

    get degree(){
        return this._degree;
    }
/*





 */


    static _degree(term,x){
        if(typeof x === 'undefined'){
            throw new Error('Must specify variable');
        }
        if(!(term instanceof Product)) term = new Product(term);
        var variable = term.args.filter(a =>
            ((a instanceof Power && a.base.has(x))||(a instanceof Symbol && a.has(x)))
        );
        if(variable.length>0){
            var v = variable[0];
            if(v instanceof Power){
                return v.exponent.value.toNumber();
            } else return number.One;
        }

        else
            return 0;
    }

    static _coeff(term, x){
        if(typeof x === 'undefined'){
            throw new Error('Must specify variable');
        }
        /*
        if(! (term instanceof operators.Product)){
            //just one factor
            if(!term.has(x))  return term; //we have a constant
            else {
                if(term instanceof Symbol || term instanceof Power)
            }//we have a coefficient of one
                return number.One

        }*/
        if(!(term instanceof Product)) term = new Product(term);
        var coeffs = term.args.filter(a =>
            !((a instanceof Power && a.base.has(x))||(a instanceof Symbol && a.has(x)))
        );
        if(coeffs.length>0)
            return new operators.Product(...coeffs).simplify();
        else
            return number.One;
    }

    static GCD(u, v){
        if(u.numOfArgs === 0 && v.numOfArgs === 0){
            return number.Zero;
        }
        var _u = u;
        var _v = v;
        var r;
        while(_v.numOfArgs && !_v.isZero){
            r = _u.divideBy(_v).remainder;
            _u = _v;
            _v = r;
        }
        var gcd = new Product(new Quotient(number.One, _u.leadingCoefficient),_u);
        return gcd.simplify().expand().simplify();

    }
}


base.Expr.prototype._toPolynomial = function(x){
    if(typeof x === 'undefined'){
        throw new Error('Must specify variable');
    }
    var expanded = this.expand().simplify();
    var polynomial = expanded instanceof operators.Addition ?
        new Polynomial(...expanded.args,x) : new Polynomial(expanded,x);

    return polynomial;
};

/*
base.Expr._lc = function(x){
    //returns the leading coefficient

    for(var i =0 ;i<this.numOfArgs;i++){
        var term = this.args[i];
        for(var exp of term.iterateArgs()){
            if(exp.has(x)){
                if(exp instanceof operators.Power){

                }
            }
        }
    }

};
*/

if (typeof(module) !== 'undefined') {
    module.exports = Polynomial;
}
},{"./expr":2,"./number":4,"./operators":5,"./symbol":7}],7:[function(require,module,exports){
/**
 * Created by Gabriele on 08/07/2016.
 */
var base = require('./expr');

class Symbol extends base.Atom {
    constructor(name) {
        super();
        this._name = name;
    }

    eval(context) {
        var ob = context[this._name];
        if (ob) {
            return new Num(Node._tryEval(ob));
        } else {
            throw new Error('Symbol ' + this._name + ' unknown');
        }
    }

    toString() {
        return this._name;
    }

    get classArgOrder(){
        return 6;
    }

    _compareTo(other){
        return -1*other._compareToSymbol(this);
    }


    subst(subs){
        if(subs[this._name]){
            return subs[this._name].subst(subs);
        } else return this;
    }


    _compareToSymbol(other){

       return this._name.localeCompare(other._name);
    }
}

class Undefined extends Symbol{
    _compareTo(other){
        return 1;
    }

    simplify(){
        return this;
    }
}

if (typeof(module) !== 'undefined') {
    module.exports = {Symbol: Symbol,
                    Undefined: new Undefined('Undefined')};
}


},{"./expr":2}],8:[function(require,module,exports){
/**
 * Created by gcannata on 14/07/2016.
 */

function multinomialCoefficients(m,n) {

    var vars = [];
    vars[0] = n+1;

    var nv = 0;
    var out = [];
    var nf = factorial(n);
    while(nv>=0){
        vars[nv] = vars[nv]-1;
        var s = vars.slice(0,nv+1).reduce((a,b)=>a+b);
        var i;
        for( i = nv+1;i<m;i++){
            vars[i] = n-s;
            s+=vars[i];
        }
        out.push({
            orders:  vars.slice(0),
            coeff: nf / vars.map(x=>factorial(x)).reduce((a,b)=>a*b,1)
        } );
        i = m-2;
        while(i>=0 && vars[i]===0) i--;
        nv=i;
    }
    return out;
}

var _fact = [];
_fact[0] = 1;
_fact[1] = 1;
function factorial(n){
    if(_fact[n]) return _fact[n];
    var ret = n*factorial(n-1);
    _fact[n] = ret;
    return ret;
}



if (typeof(module) !== 'undefined') {
    module.exports = {
        multinomialCoefficients: multinomialCoefficients
    };
}

},{}],9:[function(require,module,exports){
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



},{"../core/expr":2,"../core/function":3,"../core/number":4,"../core/operators":5,"../core/symbol":7}],10:[function(require,module,exports){
var cajsLexer = (function (undefined) {
function CDFA_base(){
	this.ss=undefined;
	this.as=undefined;
	this.tt=undefined;
this.stt={};
}
CDFA_base.prototype.reset = function (state) {
	this.cs = state || 	this.ss;
this.bol=false;
};
CDFA_base.prototype.readSymbol = function (c) {
	this.cs = this.nextState(this.cs, c);
};
CDFA_base.prototype.isAccepting = function () {
	var acc = this.as.indexOf(this.cs)>=0;
if((this.stt[this.cs]===-1)&&!this.bol){
acc=false;}
return acc;};
CDFA_base.prototype.isInDeadState = function () {
	return this.cs === undefined || this.cs === 0;
};
CDFA_base.prototype.getCurrentToken = function(){
	var t= this.tt[this.cs];
var s=this.stt[this.cs];
if(s!==undefined){return this.bol?t:s;}
return t;};

function CDFA_DEFAULT(){
	this.ss=1;
	this.as=[1,2,3,4,5,6,7,8,10,11];
	this.tt=[null,3,4,3,3,4,1,2,0,null,1,2];
this.stt={};
}
CDFA_DEFAULT.prototype= new CDFA_base();
CDFA_DEFAULT.prototype.nextState = function(state, c){
    var next = 0;
    switch(state){
case 1:
if((c < "\t" || "\n" < c)  && (c < "\r" || "\r" < c)  && (c < " " || " " < c)  && (c < "." || "." < c)  && (c < "0" || "9" < c)  && (c < "A" || "Z" < c)  && (c < "_" || "_" < c)  && (c < "a" || "z" < c)  && (c < " " || " " < c) ){
next = 2;
} else if(("\t" === c ) || (" " === c ) || (" " === c )){
next = 3;
} else if(("\n" === c ) || ("\r" === c )){
next = 3;
} else if(("." === c )){
next = 5;
} else if(("0" <= c && c <= "9") ){
next = 6;
} else if(("A" <= c && c <= "Z")  || ("_" === c ) || ("a" <= c && c <= "z") ){
next = 7;
}
break;
case 3:
if(("\t" <= c && c <= "\n")  || ("\r" === c ) || (" " === c ) || (" " === c )){
next = 3;
}
break;
case 5:
if(("0" <= c && c <= "9") ){
next = 8;
}
break;
case 6:
if(("." === c )){
next = 9;
} else if(("0" <= c && c <= "9") ){
next = 6;
} else if(("A" <= c && c <= "Z")  || ("_" === c ) || ("a" <= c && c <= "z") ){
next = 7;
}
break;
case 7:
if(("0" <= c && c <= "9")  || ("A" <= c && c <= "Z")  || ("_" === c ) || ("a" <= c && c <= "z") ){
next = 7;
}
break;
case 8:
if(("0" <= c && c <= "9") ){
next = 8;
}
break;
case 9:
if(("0" <= c && c <= "9") ){
next = 8;
}
break;
	}
	return next;
};

var EOF={};
function Lexer(){

if(!(this instanceof Lexer)) return new Lexer();

this.pos={line:0,col:0};

this.states={};
this.state = ['DEFAULT'];
this.lastChar = '\n';
this.actions = [function anonymous() {

    //this.jjval = parseFloat(this.jjtext);
    return 'float';

},function anonymous() {

    //this.jjval = parseInt(this.jjtext);
    return 'integer';

},function anonymous() {
 return 'symbol'; 
},function anonymous() {
 
},function anonymous() {
 return this.jjtext; 
},function anonymous() {
 console.log('EOF'); return 'EOF'; 
}];
this.states["DEFAULT"] = {};
this.states["DEFAULT"].dfa = new CDFA_DEFAULT();
}
Lexer.prototype.setInput=function (input){
        this.pos={row:0, col:0};
        if(typeof input === 'string')
        {input = new StringReader(input);}
        this.input = input;
        this.state = ['DEFAULT'];
        this.lastChar='\n';
        this.getDFA().reset();
        return this;
    };
Lexer.prototype.nextToken=function () {


        var ret = undefined;
        while(ret === undefined){
            this.resetToken();
            ret = this.more();
        }


        if (ret === EOF) {
            this.current = EOF;
        } else {
            this.current = {};
            this.current.name = ret;
            this.current.value = this.jjval;
            this.current.lexeme = this.jjtext;
            this.current.position = this.jjpos;
            this.current.pos = {col: this.jjcol, line: this.jjline};
        }
        return this.current;
    };
Lexer.prototype.resetToken=function (){
        this.getDFA().reset();
        this.getDFA().bol = (this.lastChar === '\n');
        this.lastValid = undefined;
        this.lastValidPos = -1;
        this.jjtext = '';
        this.remains = '';
        this.buffer = '';
        this.startpos = this.input.getPos();
        this.jjline = this.input.line;
        this.jjcol = this.input.col;
    };
Lexer.prototype.halt=function () {
        if (this.lastValidPos >= 0) {
            var lastValidLength = this.lastValidPos-this.startpos+1;
            this.jjtext = this.buffer.substring(0, lastValidLength);
            this.remains = this.buffer.substring(lastValidLength);
            this.jjval = this.jjtext;
            this.jjpos = this.lastValidPos + 1-this.jjtext.length;
            this.input.rollback(this.remains);
            var action = this.getAction(this.lastValid);
            if (typeof ( action) === 'function') {
                return action.call(this);
            }
            this.resetToken();
        }
        else if(!this.input.more()){//EOF
            var actionid = this.states[this.getState()].eofaction;
            if(actionid){
                action = this.getAction(actionid);
                if (typeof ( action) === 'function') {
                    //Note we don't care of returned token, must return 'EOF'
                    action.call(this);
                }
            }
            return EOF;
        } else {//Unexpected character
            throw new Error('Unexpected char \''+this.input.peek()+'\' at '+this.jjline +':'+this.jjcol);
        }
    };
Lexer.prototype.more=function (){
        var ret;
        while (this.input.more()) {
            var c = this.input.peek();
            this.getDFA().readSymbol(c);
            if (this.getDFA().isInDeadState()) {

                ret = this.halt();
                return ret;

            } else {
                if (this.getDFA().isAccepting()) {
                    this.lastValid = this.getDFA().getCurrentToken();
                    this.lastValidPos = this.input.getPos();

                }
                this.buffer = this.buffer + c;
                this.lastChar = c;
                this.input.next();
            }

        }
        ret = this.halt();
        return ret;
    };
Lexer.prototype.less=function (length){
        this.input.rollback(length);
    };
Lexer.prototype.getDFA=function (){
        return this.states[this.getState()].dfa;
    };
Lexer.prototype.getAction=function (i){
        return this.actions[i];
    };
Lexer.prototype.pushState=function (state){
        this.state.push(state);
        this.getDFA().reset();
    };
Lexer.prototype.popState=function (){
        if(this.state.length>1) {
            this.state.pop();
            this.getDFA().reset();
        }
    };
Lexer.prototype.getState=function (){
        return this.state[this.state.length-1];
    };
Lexer.prototype.restoreLookAhead=function (){
        this.tailLength = this.jjtext.length;
        this.popState();
        this.less(this.tailLength);
        this.jjtext = this.lawhole.substring(0,this.lawhole.length-this.tailLength);


    };
Lexer.prototype.evictTail=function (length){
        this.less(length);
        this.jjtext = this.jjtext.substring(0,this.jjtext.length-length);
    };
Lexer.prototype.isEOF=function (o){
        return o===EOF;
    }
;
function StringReader(str){
        if(!(this instanceof StringReader)) return new StringReader(str);
		this.str = str;
		this.pos = 0;
        this.line = 0;
        this.col = 0;
	}
StringReader.prototype.getPos=function (){
        return this.pos;
    };
StringReader.prototype.peek=function ()
	{
		//TODO: handle EOF
		return this.str.charAt(this.pos);
	};
StringReader.prototype.eat=function (str)
	{
		var istr = this.str.substring(this.pos,this.pos+str.length);
		if(istr===str){
			this.pos+=str.length;
            this.updatePos(str,1);
		} else {
			throw new Error('Expected "'+str+'", got "'+istr+'"!');
		}
	};
StringReader.prototype.updatePos=function (str,delta){
        for(var i=0;i<str.length;i++){
            if(str[i]=='\n'){
                this.col=0;
                this.line+=delta;
            }else{
                this.col+=delta;
            }
        }
    };
StringReader.prototype.rollback=function (str)
    {
        if(typeof str === 'string')
        {
            var istr = this.str.substring(this.pos-str.length,this.pos);
            if(istr===str){
                this.pos-=str.length;
                this.updatePos(str,-1);
            } else {
                throw new Error('Expected "'+str+'", got "'+istr+'"!');
            }
        } else {
            this.pos-=str;
            this.updatePos(str,-1);
        }

    };
StringReader.prototype.next=function ()
	{
		var s = this.str.charAt(this.pos);
		this.pos=this.pos+1;
		this.updatePos(s,1);
		return s;
	};
StringReader.prototype.more=function ()
	{
		return this.pos<this.str.length;
	};
StringReader.prototype.reset=function (){
        this.pos=0;
    };
if (typeof(module) !== 'undefined') { module.exports = Lexer; }
return Lexer;})();
},{}],11:[function(require,module,exports){
var Parser = (function (undefined) {
function Parser(environment){
if(!(this instanceof Parser)) return new Parser(environment);
var env,modules,imports;
env=modules=imports=environment;
this.action={"0":{"2":["shift",[3]],"3":["shift",[2]],"8":["shift",[4]],"9":["shift",[7]],"12":["shift",[5]],"13":["shift",[6]]},"1":{"0":["accept",[]],"2":["shift",[8]],"3":["shift",[9]],"4":["shift",[10]],"5":["shift",[11]],"6":["shift",[12]],"7":["shift",[13]]},"2":{"2":["shift",[3]],"3":["shift",[2]],"8":["shift",[4]],"9":["shift",[7]],"12":["shift",[5]],"13":["shift",[6]]},"3":{"2":["shift",[3]],"3":["shift",[2]],"8":["shift",[4]],"9":["shift",[7]],"12":["shift",[5]],"13":["shift",[6]]},"4":{"0":["reduce",[1,1,11]],"2":["reduce",[1,1,11]],"3":["reduce",[1,1,11]],"4":["reduce",[1,1,11]],"5":["reduce",[1,1,11]],"6":["reduce",[1,1,11]],"7":["reduce",[1,1,11]],"9":["shift",[16]],"11":["reduce",[1,1,11]],"14":["reduce",[1,1,11]]},"5":{"0":["reduce",[1,1,9]],"2":["reduce",[1,1,9]],"3":["reduce",[1,1,9]],"4":["reduce",[1,1,9]],"5":["reduce",[1,1,9]],"6":["reduce",[1,1,9]],"7":["reduce",[1,1,9]],"11":["reduce",[1,1,9]],"14":["reduce",[1,1,9]]},"6":{"0":["reduce",[1,1,10]],"2":["reduce",[1,1,10]],"3":["reduce",[1,1,10]],"4":["reduce",[1,1,10]],"5":["reduce",[1,1,10]],"6":["reduce",[1,1,10]],"7":["reduce",[1,1,10]],"11":["reduce",[1,1,10]],"14":["reduce",[1,1,10]]},"7":{"2":["shift",[3]],"3":["shift",[2]],"8":["shift",[4]],"9":["shift",[7]],"12":["shift",[5]],"13":["shift",[6]]},"8":{"2":["shift",[3]],"3":["shift",[2]],"8":["shift",[4]],"9":["shift",[7]],"12":["shift",[5]],"13":["shift",[6]]},"9":{"2":["shift",[3]],"3":["shift",[2]],"8":["shift",[4]],"9":["shift",[7]],"12":["shift",[5]],"13":["shift",[6]]},"10":{"2":["shift",[3]],"3":["shift",[2]],"8":["shift",[4]],"9":["shift",[7]],"12":["shift",[5]],"13":["shift",[6]]},"11":{"2":["shift",[3]],"3":["shift",[2]],"8":["shift",[4]],"9":["shift",[7]],"12":["shift",[5]],"13":["shift",[6]]},"12":{"2":["shift",[3]],"3":["shift",[2]],"8":["shift",[4]],"9":["shift",[7]],"12":["shift",[5]],"13":["shift",[6]]},"13":{"0":["reduce",[1,2,7]],"2":["reduce",[1,2,7]],"3":["reduce",[1,2,7]],"4":["reduce",[1,2,7]],"5":["reduce",[1,2,7]],"6":["reduce",[1,2,7]],"7":["reduce",[1,2,7]],"11":["reduce",[1,2,7]],"14":["reduce",[1,2,7]]},"14":{"0":["reduce",[1,2,4]],"2":["reduce",[1,2,4]],"3":["reduce",[1,2,4]],"4":["shift",[10]],"5":["shift",[11]],"6":["shift",[12]],"7":["shift",[13]],"11":["reduce",[1,2,4]],"14":["reduce",[1,2,4]]},"15":{"0":["reduce",[1,2,5]],"2":["reduce",[1,2,5]],"3":["reduce",[1,2,5]],"4":["shift",[10]],"5":["shift",[11]],"6":["shift",[12]],"7":["shift",[13]],"11":["reduce",[1,2,5]],"14":["reduce",[1,2,5]]},"16":{"2":["shift",[3]],"3":["shift",[2]],"8":["shift",[4]],"9":["shift",[7]],"11":["reduce",[10,0,13]],"12":["shift",[5]],"13":["shift",[6]],"14":["reduce",[10,0,13]]},"17":{"2":["shift",[8]],"3":["shift",[9]],"4":["shift",[10]],"5":["shift",[11]],"6":["shift",[12]],"7":["shift",[13]],"11":["shift",[25]]},"18":{"0":["reduce",[1,3,0]],"2":["reduce",[1,3,0]],"3":["reduce",[1,3,0]],"4":["shift",[10]],"5":["shift",[11]],"6":["shift",[12]],"7":["shift",[13]],"11":["reduce",[1,3,0]],"14":["reduce",[1,3,0]]},"19":{"0":["reduce",[1,3,1]],"2":["reduce",[1,3,1]],"3":["reduce",[1,3,1]],"4":["shift",[10]],"5":["shift",[11]],"6":["shift",[12]],"7":["shift",[13]],"11":["reduce",[1,3,1]],"14":["reduce",[1,3,1]]},"20":{"0":["reduce",[1,3,2]],"2":["reduce",[1,3,2]],"3":["reduce",[1,3,2]],"4":["reduce",[1,3,2]],"5":["reduce",[1,3,2]],"6":["shift",[12]],"7":["shift",[13]],"11":["reduce",[1,3,2]],"14":["reduce",[1,3,2]]},"21":{"0":["reduce",[1,3,3]],"2":["reduce",[1,3,3]],"3":["reduce",[1,3,3]],"4":["reduce",[1,3,3]],"5":["reduce",[1,3,3]],"6":["shift",[12]],"7":["shift",[13]],"11":["reduce",[1,3,3]],"14":["reduce",[1,3,3]]},"22":{"0":["reduce",[1,3,6]],"2":["reduce",[1,3,6]],"3":["reduce",[1,3,6]],"4":["reduce",[1,3,6]],"5":["reduce",[1,3,6]],"6":["shift",[12]],"7":["shift",[13]],"11":["reduce",[1,3,6]],"14":["reduce",[1,3,6]]},"23":{"11":["shift",[26]],"14":["shift",[27]]},"24":{"2":["shift",[8]],"3":["shift",[9]],"4":["shift",[10]],"5":["shift",[11]],"6":["shift",[12]],"7":["shift",[13]],"11":["reduce",[10,1,14]],"14":["reduce",[10,1,14]]},"25":{"0":["reduce",[1,3,12]],"2":["reduce",[1,3,12]],"3":["reduce",[1,3,12]],"4":["reduce",[1,3,12]],"5":["reduce",[1,3,12]],"6":["reduce",[1,3,12]],"7":["reduce",[1,3,12]],"11":["reduce",[1,3,12]],"14":["reduce",[1,3,12]]},"26":{"0":["reduce",[1,4,8]],"2":["reduce",[1,4,8]],"3":["reduce",[1,4,8]],"4":["reduce",[1,4,8]],"5":["reduce",[1,4,8]],"6":["reduce",[1,4,8]],"7":["reduce",[1,4,8]],"11":["reduce",[1,4,8]],"14":["reduce",[1,4,8]]},"27":{"2":["shift",[3]],"3":["shift",[2]],"8":["shift",[4]],"9":["shift",[7]],"12":["shift",[5]],"13":["shift",[6]]},"28":{"2":["shift",[8]],"3":["shift",[9]],"4":["shift",[10]],"5":["shift",[11]],"6":["shift",[12]],"7":["shift",[13]],"11":["reduce",[10,3,15]],"14":["reduce",[10,3,15]]}};
this.goto={"0":{"1":1},"2":{"1":14},"3":{"1":15},"7":{"1":17},"8":{"1":18},"9":{"1":19},"10":{"1":20},"11":{"1":21},"12":{"1":22},"16":{"1":24,"10":23},"27":{"1":28}};
this.actions=[function (e1, _, e2) {
                                                             return new imports.Addition(e1,e2);
                                                         },function (e1, _, e2) {
                                                              return new imports.Subtraction(e1,e2);
                                                          },function (e1, _, e2) {
                                                             return new imports.Product(e1,e2);
                                                         },function (e1, _, e2) {
                                                               return new imports.Quotient(e1,e2);
                                                           },function (_, e) {
                                                 return new imports.Product(new imports.Integer(-1),e);
                                                },function (_, e) {
                                                 return new imports.Addition(new imports.Integer(0),e);
                                                },function (b, _, e) {
                                                 return new imports.Power(b,e);
                                                },function (e) {
                                              return new imports.Factorial(e);
                                             },function (name, _, args){

                                                  return imports.FunctionFactory(name,...args);
                                                //return new imports.Function(name,...(args.filter((_,i) => i%2==0)));

                                            },function (i) {
                                             return new imports.Integer(i);
                                         },function (i) {
                                             return new imports.Float(i);
                                         },function (id) {
                                        return new imports.Symbol(id);
                                    },function (_, e) {
                                                         return e;
                                                     },function (args){
                return [];
            },function (e) { return [e]; },function (list,_, el){
                                                        list.push(el);
                                                           return list;
                                                       }];
this.startstate=0;
this.symbolsTable={"<<EOF>>":0,"Expression":1,"+":2,"-":3,"*":4,"/":5,"^":6,"!":7,"symbol":8,"(":9,"ArgumentsList":10,")":11,"integer":12,"float":13,",":14};
this.actionMode='function';
}
Parser.prototype.identity=function (x) {
        "use strict";
        return x;
    };
Parser.prototype.parse=function (lexer, context) {
        this.stack = [];
        this.context =  context || {};

        this.lexer = lexer;
        this.a = this.lexer.nextToken();
        this.stack.push({s: this.startstate, i: 0});
        this.accepted = false;
        this.inerror = false;
        while (!this.accepted && !this.inerror) {
            var top = this.stack[this.stack.length - 1];
            var s = top.s;
            //this.a = this.currentToken;
            if(lexer.isEOF(this.a))
                this.an = 0;
            else
                this.an = this.symbolsTable[this.a.name];
            var action = this.action[s][this.an];
            if (action !== undefined) {
                this[action[0]].apply(this, action[1]);
            } else {
                this.inerror = true;
                this.error(this.a,this);
            }
        }
        return top.i.value;
    };
Parser.prototype.shift=function (state) {
        "use strict";
        this.stack.push({s: state, i: this.a});
        this.a = this.lexer.nextToken();

    };
Parser.prototype.reduce=function (head, length, prodindex) {
        "use strict";
        //var prod = this.productions[prodnumber];
        var self = this;
        var rhs = this.stack.splice(-length, length);
        var t = this.stack[this.stack.length - 1];
        var ns = this.goto[t.s][head];
        var value;
        if (this.actions) {
            var action = this.actions[prodindex] || this.identity;
            var values = rhs.map(function (si) {
                return si.i.value;
            });

            if(self.actionMode==='constructor')
                value =  this.create(action,values);
            else
                value =  action.apply(this.context, values);
        }
        //If we are debugging

        if(this.symbols) {
            var nt = {name: this.symbols[head].name, value:value};
            this.stack.push({s: ns, i: nt});
        }
        else
        {
            this.stack.push({s: ns,i:{value: value}});
        }

    };
Parser.prototype.accept=function () {
        "use strict";
        this.accepted = true;
    };
Parser.prototype.error=function (token){
        if(typeof token === 'string')
        {
            throw Error(token);
        }
        if(this.lexer.isEOF(token)){
            throw Error("Unexpected EOF at "+this.lexer.jjline+':'+this.lexer.jjcol);
        } else
        throw Error('Unexpected token '+token.name+' "'+token.lexeme+'" at ('+token.pos.line+':'+token.pos.col+')');
    };
Parser.prototype.create=function (ctor,args){
        var args = [this.context].concat(args);
        var factory = ctor.bind.apply(ctor,args);
        return new factory();
    };
if (typeof(module) !== 'undefined') { module.exports = Parser; }
return Parser;
})();
},{}],12:[function(require,module,exports){
/*! bignumber.js v2.3.0 https://github.com/MikeMcl/bignumber.js/LICENCE */

;(function (globalObj) {
    'use strict';

    /*
      bignumber.js v2.3.0
      A JavaScript library for arbitrary-precision arithmetic.
      https://github.com/MikeMcl/bignumber.js
      Copyright (c) 2016 Michael Mclaughlin <M8ch88l@gmail.com>
      MIT Expat Licence
    */


    var cryptoObj, parseNumeric,
        isNumeric = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,
        mathceil = Math.ceil,
        mathfloor = Math.floor,
        notBool = ' not a boolean or binary digit',
        roundingMode = 'rounding mode',
        tooManyDigits = 'number type has more than 15 significant digits',
        ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_',
        BASE = 1e14,
        LOG_BASE = 14,
        MAX_SAFE_INTEGER = 0x1fffffffffffff,         // 2^53 - 1
        // MAX_INT32 = 0x7fffffff,                   // 2^31 - 1
        POWS_TEN = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13],
        SQRT_BASE = 1e7,

        /*
         * The limit on the value of DECIMAL_PLACES, TO_EXP_NEG, TO_EXP_POS, MIN_EXP, MAX_EXP, and
         * the arguments to toExponential, toFixed, toFormat, and toPrecision, beyond which an
         * exception is thrown (if ERRORS is true).
         */
        MAX = 1E9;                                   // 0 to MAX_INT32

    if ( typeof crypto != 'undefined' ) cryptoObj = crypto;


    /*
     * Create and return a BigNumber constructor.
     */
    function constructorFactory(configObj) {
        var div,

            // id tracks the caller function, so its name can be included in error messages.
            id = 0,
            P = BigNumber.prototype,
            ONE = new BigNumber(1),


            /********************************* EDITABLE DEFAULTS **********************************/


            /*
             * The default values below must be integers within the inclusive ranges stated.
             * The values can also be changed at run-time using BigNumber.config.
             */

            // The maximum number of decimal places for operations involving division.
            DECIMAL_PLACES = 20,                     // 0 to MAX

            /*
             * The rounding mode used when rounding to the above decimal places, and when using
             * toExponential, toFixed, toFormat and toPrecision, and round (default value).
             * UP         0 Away from zero.
             * DOWN       1 Towards zero.
             * CEIL       2 Towards +Infinity.
             * FLOOR      3 Towards -Infinity.
             * HALF_UP    4 Towards nearest neighbour. If equidistant, up.
             * HALF_DOWN  5 Towards nearest neighbour. If equidistant, down.
             * HALF_EVEN  6 Towards nearest neighbour. If equidistant, towards even neighbour.
             * HALF_CEIL  7 Towards nearest neighbour. If equidistant, towards +Infinity.
             * HALF_FLOOR 8 Towards nearest neighbour. If equidistant, towards -Infinity.
             */
            ROUNDING_MODE = 4,                       // 0 to 8

            // EXPONENTIAL_AT : [TO_EXP_NEG , TO_EXP_POS]

            // The exponent value at and beneath which toString returns exponential notation.
            // Number type: -7
            TO_EXP_NEG = -7,                         // 0 to -MAX

            // The exponent value at and above which toString returns exponential notation.
            // Number type: 21
            TO_EXP_POS = 21,                         // 0 to MAX

            // RANGE : [MIN_EXP, MAX_EXP]

            // The minimum exponent value, beneath which underflow to zero occurs.
            // Number type: -324  (5e-324)
            MIN_EXP = -1e7,                          // -1 to -MAX

            // The maximum exponent value, above which overflow to Infinity occurs.
            // Number type:  308  (1.7976931348623157e+308)
            // For MAX_EXP > 1e7, e.g. new BigNumber('1e100000000').plus(1) may be slow.
            MAX_EXP = 1e7,                           // 1 to MAX

            // Whether BigNumber Errors are ever thrown.
            ERRORS = true,                           // true or false

            // Change to intValidatorNoErrors if ERRORS is false.
            isValidInt = intValidatorWithErrors,     // intValidatorWithErrors/intValidatorNoErrors

            // Whether to use cryptographically-secure random number generation, if available.
            CRYPTO = false,                          // true or false

            /*
             * The modulo mode used when calculating the modulus: a mod n.
             * The quotient (q = a / n) is calculated according to the corresponding rounding mode.
             * The remainder (r) is calculated as: r = a - n * q.
             *
             * UP        0 The remainder is positive if the dividend is negative, else is negative.
             * DOWN      1 The remainder has the same sign as the dividend.
             *             This modulo mode is commonly known as 'truncated division' and is
             *             equivalent to (a % n) in JavaScript.
             * FLOOR     3 The remainder has the same sign as the divisor (Python %).
             * HALF_EVEN 6 This modulo mode implements the IEEE 754 remainder function.
             * EUCLID    9 Euclidian division. q = sign(n) * floor(a / abs(n)).
             *             The remainder is always positive.
             *
             * The truncated division, floored division, Euclidian division and IEEE 754 remainder
             * modes are commonly used for the modulus operation.
             * Although the other rounding modes can also be used, they may not give useful results.
             */
            MODULO_MODE = 1,                         // 0 to 9

            // The maximum number of significant digits of the result of the toPower operation.
            // If POW_PRECISION is 0, there will be unlimited significant digits.
            POW_PRECISION = 100,                     // 0 to MAX

            // The format specification used by the BigNumber.prototype.toFormat method.
            FORMAT = {
                decimalSeparator: '.',
                groupSeparator: ',',
                groupSize: 3,
                secondaryGroupSize: 0,
                fractionGroupSeparator: '\xA0',      // non-breaking space
                fractionGroupSize: 0
            };


        /******************************************************************************************/


        // CONSTRUCTOR


        /*
         * The BigNumber constructor and exported function.
         * Create and return a new instance of a BigNumber object.
         *
         * n {number|string|BigNumber} A numeric value.
         * [b] {number} The base of n. Integer, 2 to 64 inclusive.
         */
        function BigNumber( n, b ) {
            var c, e, i, num, len, str,
                x = this;

            // Enable constructor usage without new.
            if ( !( x instanceof BigNumber ) ) {

                // 'BigNumber() constructor call without new: {n}'
                if (ERRORS) raise( 26, 'constructor call without new', n );
                return new BigNumber( n, b );
            }

            // 'new BigNumber() base not an integer: {b}'
            // 'new BigNumber() base out of range: {b}'
            if ( b == null || !isValidInt( b, 2, 64, id, 'base' ) ) {

                // Duplicate.
                if ( n instanceof BigNumber ) {
                    x.s = n.s;
                    x.e = n.e;
                    x.c = ( n = n.c ) ? n.slice() : n;
                    id = 0;
                    return;
                }

                if ( ( num = typeof n == 'number' ) && n * 0 == 0 ) {
                    x.s = 1 / n < 0 ? ( n = -n, -1 ) : 1;

                    // Fast path for integers.
                    if ( n === ~~n ) {
                        for ( e = 0, i = n; i >= 10; i /= 10, e++ );
                        x.e = e;
                        x.c = [n];
                        id = 0;
                        return;
                    }

                    str = n + '';
                } else {
                    if ( !isNumeric.test( str = n + '' ) ) return parseNumeric( x, str, num );
                    x.s = str.charCodeAt(0) === 45 ? ( str = str.slice(1), -1 ) : 1;
                }
            } else {
                b = b | 0;
                str = n + '';

                // Ensure return value is rounded to DECIMAL_PLACES as with other bases.
                // Allow exponential notation to be used with base 10 argument.
                if ( b == 10 ) {
                    x = new BigNumber( n instanceof BigNumber ? n : str );
                    return round( x, DECIMAL_PLACES + x.e + 1, ROUNDING_MODE );
                }

                // Avoid potential interpretation of Infinity and NaN as base 44+ values.
                // Any number in exponential form will fail due to the [Ee][+-].
                if ( ( num = typeof n == 'number' ) && n * 0 != 0 ||
                  !( new RegExp( '^-?' + ( c = '[' + ALPHABET.slice( 0, b ) + ']+' ) +
                    '(?:\\.' + c + ')?$',b < 37 ? 'i' : '' ) ).test(str) ) {
                    return parseNumeric( x, str, num, b );
                }

                if (num) {
                    x.s = 1 / n < 0 ? ( str = str.slice(1), -1 ) : 1;

                    if ( ERRORS && str.replace( /^0\.0*|\./, '' ).length > 15 ) {

                        // 'new BigNumber() number type has more than 15 significant digits: {n}'
                        raise( id, tooManyDigits, n );
                    }

                    // Prevent later check for length on converted number.
                    num = false;
                } else {
                    x.s = str.charCodeAt(0) === 45 ? ( str = str.slice(1), -1 ) : 1;
                }

                str = convertBase( str, 10, b, x.s );
            }

            // Decimal point?
            if ( ( e = str.indexOf('.') ) > -1 ) str = str.replace( '.', '' );

            // Exponential form?
            if ( ( i = str.search( /e/i ) ) > 0 ) {

                // Determine exponent.
                if ( e < 0 ) e = i;
                e += +str.slice( i + 1 );
                str = str.substring( 0, i );
            } else if ( e < 0 ) {

                // Integer.
                e = str.length;
            }

            // Determine leading zeros.
            for ( i = 0; str.charCodeAt(i) === 48; i++ );

            // Determine trailing zeros.
            for ( len = str.length; str.charCodeAt(--len) === 48; );
            str = str.slice( i, len + 1 );

            if (str) {
                len = str.length;

                // Disallow numbers with over 15 significant digits if number type.
                // 'new BigNumber() number type has more than 15 significant digits: {n}'
                if ( num && ERRORS && len > 15 && ( n > MAX_SAFE_INTEGER || n !== mathfloor(n) ) ) {
                    raise( id, tooManyDigits, x.s * n );
                }

                e = e - i - 1;

                 // Overflow?
                if ( e > MAX_EXP ) {

                    // Infinity.
                    x.c = x.e = null;

                // Underflow?
                } else if ( e < MIN_EXP ) {

                    // Zero.
                    x.c = [ x.e = 0 ];
                } else {
                    x.e = e;
                    x.c = [];

                    // Transform base

                    // e is the base 10 exponent.
                    // i is where to slice str to get the first element of the coefficient array.
                    i = ( e + 1 ) % LOG_BASE;
                    if ( e < 0 ) i += LOG_BASE;

                    if ( i < len ) {
                        if (i) x.c.push( +str.slice( 0, i ) );

                        for ( len -= LOG_BASE; i < len; ) {
                            x.c.push( +str.slice( i, i += LOG_BASE ) );
                        }

                        str = str.slice(i);
                        i = LOG_BASE - str.length;
                    } else {
                        i -= len;
                    }

                    for ( ; i--; str += '0' );
                    x.c.push( +str );
                }
            } else {

                // Zero.
                x.c = [ x.e = 0 ];
            }

            id = 0;
        }


        // CONSTRUCTOR PROPERTIES


        BigNumber.another = constructorFactory;

        BigNumber.ROUND_UP = 0;
        BigNumber.ROUND_DOWN = 1;
        BigNumber.ROUND_CEIL = 2;
        BigNumber.ROUND_FLOOR = 3;
        BigNumber.ROUND_HALF_UP = 4;
        BigNumber.ROUND_HALF_DOWN = 5;
        BigNumber.ROUND_HALF_EVEN = 6;
        BigNumber.ROUND_HALF_CEIL = 7;
        BigNumber.ROUND_HALF_FLOOR = 8;
        BigNumber.EUCLID = 9;


        /*
         * Configure infrequently-changing library-wide settings.
         *
         * Accept an object or an argument list, with one or many of the following properties or
         * parameters respectively:
         *
         *   DECIMAL_PLACES  {number}  Integer, 0 to MAX inclusive
         *   ROUNDING_MODE   {number}  Integer, 0 to 8 inclusive
         *   EXPONENTIAL_AT  {number|number[]}  Integer, -MAX to MAX inclusive or
         *                                      [integer -MAX to 0 incl., 0 to MAX incl.]
         *   RANGE           {number|number[]}  Non-zero integer, -MAX to MAX inclusive or
         *                                      [integer -MAX to -1 incl., integer 1 to MAX incl.]
         *   ERRORS          {boolean|number}   true, false, 1 or 0
         *   CRYPTO          {boolean|number}   true, false, 1 or 0
         *   MODULO_MODE     {number}           0 to 9 inclusive
         *   POW_PRECISION   {number}           0 to MAX inclusive
         *   FORMAT          {object}           See BigNumber.prototype.toFormat
         *      decimalSeparator       {string}
         *      groupSeparator         {string}
         *      groupSize              {number}
         *      secondaryGroupSize     {number}
         *      fractionGroupSeparator {string}
         *      fractionGroupSize      {number}
         *
         * (The values assigned to the above FORMAT object properties are not checked for validity.)
         *
         * E.g.
         * BigNumber.config(20, 4) is equivalent to
         * BigNumber.config({ DECIMAL_PLACES : 20, ROUNDING_MODE : 4 })
         *
         * Ignore properties/parameters set to null or undefined.
         * Return an object with the properties current values.
         */
        BigNumber.config = function () {
            var v, p,
                i = 0,
                r = {},
                a = arguments,
                o = a[0],
                has = o && typeof o == 'object'
                  ? function () { if ( o.hasOwnProperty(p) ) return ( v = o[p] ) != null; }
                  : function () { if ( a.length > i ) return ( v = a[i++] ) != null; };

            // DECIMAL_PLACES {number} Integer, 0 to MAX inclusive.
            // 'config() DECIMAL_PLACES not an integer: {v}'
            // 'config() DECIMAL_PLACES out of range: {v}'
            if ( has( p = 'DECIMAL_PLACES' ) && isValidInt( v, 0, MAX, 2, p ) ) {
                DECIMAL_PLACES = v | 0;
            }
            r[p] = DECIMAL_PLACES;

            // ROUNDING_MODE {number} Integer, 0 to 8 inclusive.
            // 'config() ROUNDING_MODE not an integer: {v}'
            // 'config() ROUNDING_MODE out of range: {v}'
            if ( has( p = 'ROUNDING_MODE' ) && isValidInt( v, 0, 8, 2, p ) ) {
                ROUNDING_MODE = v | 0;
            }
            r[p] = ROUNDING_MODE;

            // EXPONENTIAL_AT {number|number[]}
            // Integer, -MAX to MAX inclusive or [integer -MAX to 0 inclusive, 0 to MAX inclusive].
            // 'config() EXPONENTIAL_AT not an integer: {v}'
            // 'config() EXPONENTIAL_AT out of range: {v}'
            if ( has( p = 'EXPONENTIAL_AT' ) ) {

                if ( isArray(v) ) {
                    if ( isValidInt( v[0], -MAX, 0, 2, p ) && isValidInt( v[1], 0, MAX, 2, p ) ) {
                        TO_EXP_NEG = v[0] | 0;
                        TO_EXP_POS = v[1] | 0;
                    }
                } else if ( isValidInt( v, -MAX, MAX, 2, p ) ) {
                    TO_EXP_NEG = -( TO_EXP_POS = ( v < 0 ? -v : v ) | 0 );
                }
            }
            r[p] = [ TO_EXP_NEG, TO_EXP_POS ];

            // RANGE {number|number[]} Non-zero integer, -MAX to MAX inclusive or
            // [integer -MAX to -1 inclusive, integer 1 to MAX inclusive].
            // 'config() RANGE not an integer: {v}'
            // 'config() RANGE cannot be zero: {v}'
            // 'config() RANGE out of range: {v}'
            if ( has( p = 'RANGE' ) ) {

                if ( isArray(v) ) {
                    if ( isValidInt( v[0], -MAX, -1, 2, p ) && isValidInt( v[1], 1, MAX, 2, p ) ) {
                        MIN_EXP = v[0] | 0;
                        MAX_EXP = v[1] | 0;
                    }
                } else if ( isValidInt( v, -MAX, MAX, 2, p ) ) {
                    if ( v | 0 ) MIN_EXP = -( MAX_EXP = ( v < 0 ? -v : v ) | 0 );
                    else if (ERRORS) raise( 2, p + ' cannot be zero', v );
                }
            }
            r[p] = [ MIN_EXP, MAX_EXP ];

            // ERRORS {boolean|number} true, false, 1 or 0.
            // 'config() ERRORS not a boolean or binary digit: {v}'
            if ( has( p = 'ERRORS' ) ) {

                if ( v === !!v || v === 1 || v === 0 ) {
                    id = 0;
                    isValidInt = ( ERRORS = !!v ) ? intValidatorWithErrors : intValidatorNoErrors;
                } else if (ERRORS) {
                    raise( 2, p + notBool, v );
                }
            }
            r[p] = ERRORS;

            // CRYPTO {boolean|number} true, false, 1 or 0.
            // 'config() CRYPTO not a boolean or binary digit: {v}'
            // 'config() crypto unavailable: {crypto}'
            if ( has( p = 'CRYPTO' ) ) {

                if ( v === !!v || v === 1 || v === 0 ) {
                    CRYPTO = !!( v && cryptoObj );
                    if ( v && !CRYPTO && ERRORS ) raise( 2, 'crypto unavailable', cryptoObj );
                } else if (ERRORS) {
                    raise( 2, p + notBool, v );
                }
            }
            r[p] = CRYPTO;

            // MODULO_MODE {number} Integer, 0 to 9 inclusive.
            // 'config() MODULO_MODE not an integer: {v}'
            // 'config() MODULO_MODE out of range: {v}'
            if ( has( p = 'MODULO_MODE' ) && isValidInt( v, 0, 9, 2, p ) ) {
                MODULO_MODE = v | 0;
            }
            r[p] = MODULO_MODE;

            // POW_PRECISION {number} Integer, 0 to MAX inclusive.
            // 'config() POW_PRECISION not an integer: {v}'
            // 'config() POW_PRECISION out of range: {v}'
            if ( has( p = 'POW_PRECISION' ) && isValidInt( v, 0, MAX, 2, p ) ) {
                POW_PRECISION = v | 0;
            }
            r[p] = POW_PRECISION;

            // FORMAT {object}
            // 'config() FORMAT not an object: {v}'
            if ( has( p = 'FORMAT' ) ) {

                if ( typeof v == 'object' ) {
                    FORMAT = v;
                } else if (ERRORS) {
                    raise( 2, p + ' not an object', v );
                }
            }
            r[p] = FORMAT;

            return r;
        };


        /*
         * Return a new BigNumber whose value is the maximum of the arguments.
         *
         * arguments {number|string|BigNumber}
         */
        BigNumber.max = function () { return maxOrMin( arguments, P.lt ); };


        /*
         * Return a new BigNumber whose value is the minimum of the arguments.
         *
         * arguments {number|string|BigNumber}
         */
        BigNumber.min = function () { return maxOrMin( arguments, P.gt ); };


        /*
         * Return a new BigNumber with a random value equal to or greater than 0 and less than 1,
         * and with dp, or DECIMAL_PLACES if dp is omitted, decimal places (or less if trailing
         * zeros are produced).
         *
         * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
         *
         * 'random() decimal places not an integer: {dp}'
         * 'random() decimal places out of range: {dp}'
         * 'random() crypto unavailable: {crypto}'
         */
        BigNumber.random = (function () {
            var pow2_53 = 0x20000000000000;

            // Return a 53 bit integer n, where 0 <= n < 9007199254740992.
            // Check if Math.random() produces more than 32 bits of randomness.
            // If it does, assume at least 53 bits are produced, otherwise assume at least 30 bits.
            // 0x40000000 is 2^30, 0x800000 is 2^23, 0x1fffff is 2^21 - 1.
            var random53bitInt = (Math.random() * pow2_53) & 0x1fffff
              ? function () { return mathfloor( Math.random() * pow2_53 ); }
              : function () { return ((Math.random() * 0x40000000 | 0) * 0x800000) +
                  (Math.random() * 0x800000 | 0); };

            return function (dp) {
                var a, b, e, k, v,
                    i = 0,
                    c = [],
                    rand = new BigNumber(ONE);

                dp = dp == null || !isValidInt( dp, 0, MAX, 14 ) ? DECIMAL_PLACES : dp | 0;
                k = mathceil( dp / LOG_BASE );

                if (CRYPTO) {

                    // Browsers supporting crypto.getRandomValues.
                    if ( cryptoObj && cryptoObj.getRandomValues ) {

                        a = cryptoObj.getRandomValues( new Uint32Array( k *= 2 ) );

                        for ( ; i < k; ) {

                            // 53 bits:
                            // ((Math.pow(2, 32) - 1) * Math.pow(2, 21)).toString(2)
                            // 11111 11111111 11111111 11111111 11100000 00000000 00000000
                            // ((Math.pow(2, 32) - 1) >>> 11).toString(2)
                            //                                     11111 11111111 11111111
                            // 0x20000 is 2^21.
                            v = a[i] * 0x20000 + (a[i + 1] >>> 11);

                            // Rejection sampling:
                            // 0 <= v < 9007199254740992
                            // Probability that v >= 9e15, is
                            // 7199254740992 / 9007199254740992 ~= 0.0008, i.e. 1 in 1251
                            if ( v >= 9e15 ) {
                                b = cryptoObj.getRandomValues( new Uint32Array(2) );
                                a[i] = b[0];
                                a[i + 1] = b[1];
                            } else {

                                // 0 <= v <= 8999999999999999
                                // 0 <= (v % 1e14) <= 99999999999999
                                c.push( v % 1e14 );
                                i += 2;
                            }
                        }
                        i = k / 2;

                    // Node.js supporting crypto.randomBytes.
                    } else if ( cryptoObj && cryptoObj.randomBytes ) {

                        // buffer
                        a = cryptoObj.randomBytes( k *= 7 );

                        for ( ; i < k; ) {

                            // 0x1000000000000 is 2^48, 0x10000000000 is 2^40
                            // 0x100000000 is 2^32, 0x1000000 is 2^24
                            // 11111 11111111 11111111 11111111 11111111 11111111 11111111
                            // 0 <= v < 9007199254740992
                            v = ( ( a[i] & 31 ) * 0x1000000000000 ) + ( a[i + 1] * 0x10000000000 ) +
                                  ( a[i + 2] * 0x100000000 ) + ( a[i + 3] * 0x1000000 ) +
                                  ( a[i + 4] << 16 ) + ( a[i + 5] << 8 ) + a[i + 6];

                            if ( v >= 9e15 ) {
                                cryptoObj.randomBytes(7).copy( a, i );
                            } else {

                                // 0 <= (v % 1e14) <= 99999999999999
                                c.push( v % 1e14 );
                                i += 7;
                            }
                        }
                        i = k / 7;
                    } else if (ERRORS) {
                        raise( 14, 'crypto unavailable', cryptoObj );
                    }
                }

                // Use Math.random: CRYPTO is false or crypto is unavailable and ERRORS is false.
                if (!i) {

                    for ( ; i < k; ) {
                        v = random53bitInt();
                        if ( v < 9e15 ) c[i++] = v % 1e14;
                    }
                }

                k = c[--i];
                dp %= LOG_BASE;

                // Convert trailing digits to zeros according to dp.
                if ( k && dp ) {
                    v = POWS_TEN[LOG_BASE - dp];
                    c[i] = mathfloor( k / v ) * v;
                }

                // Remove trailing elements which are zero.
                for ( ; c[i] === 0; c.pop(), i-- );

                // Zero?
                if ( i < 0 ) {
                    c = [ e = 0 ];
                } else {

                    // Remove leading elements which are zero and adjust exponent accordingly.
                    for ( e = -1 ; c[0] === 0; c.shift(), e -= LOG_BASE);

                    // Count the digits of the first element of c to determine leading zeros, and...
                    for ( i = 1, v = c[0]; v >= 10; v /= 10, i++);

                    // adjust the exponent accordingly.
                    if ( i < LOG_BASE ) e -= LOG_BASE - i;
                }

                rand.e = e;
                rand.c = c;
                return rand;
            };
        })();


        // PRIVATE FUNCTIONS


        // Convert a numeric string of baseIn to a numeric string of baseOut.
        function convertBase( str, baseOut, baseIn, sign ) {
            var d, e, k, r, x, xc, y,
                i = str.indexOf( '.' ),
                dp = DECIMAL_PLACES,
                rm = ROUNDING_MODE;

            if ( baseIn < 37 ) str = str.toLowerCase();

            // Non-integer.
            if ( i >= 0 ) {
                k = POW_PRECISION;

                // Unlimited precision.
                POW_PRECISION = 0;
                str = str.replace( '.', '' );
                y = new BigNumber(baseIn);
                x = y.pow( str.length - i );
                POW_PRECISION = k;

                // Convert str as if an integer, then restore the fraction part by dividing the
                // result by its base raised to a power.
                y.c = toBaseOut( toFixedPoint( coeffToString( x.c ), x.e ), 10, baseOut );
                y.e = y.c.length;
            }

            // Convert the number as integer.
            xc = toBaseOut( str, baseIn, baseOut );
            e = k = xc.length;

            // Remove trailing zeros.
            for ( ; xc[--k] == 0; xc.pop() );
            if ( !xc[0] ) return '0';

            if ( i < 0 ) {
                --e;
            } else {
                x.c = xc;
                x.e = e;

                // sign is needed for correct rounding.
                x.s = sign;
                x = div( x, y, dp, rm, baseOut );
                xc = x.c;
                r = x.r;
                e = x.e;
            }

            d = e + dp + 1;

            // The rounding digit, i.e. the digit to the right of the digit that may be rounded up.
            i = xc[d];
            k = baseOut / 2;
            r = r || d < 0 || xc[d + 1] != null;

            r = rm < 4 ? ( i != null || r ) && ( rm == 0 || rm == ( x.s < 0 ? 3 : 2 ) )
                       : i > k || i == k &&( rm == 4 || r || rm == 6 && xc[d - 1] & 1 ||
                         rm == ( x.s < 0 ? 8 : 7 ) );

            if ( d < 1 || !xc[0] ) {

                // 1^-dp or 0.
                str = r ? toFixedPoint( '1', -dp ) : '0';
            } else {
                xc.length = d;

                if (r) {

                    // Rounding up may mean the previous digit has to be rounded up and so on.
                    for ( --baseOut; ++xc[--d] > baseOut; ) {
                        xc[d] = 0;

                        if ( !d ) {
                            ++e;
                            xc.unshift(1);
                        }
                    }
                }

                // Determine trailing zeros.
                for ( k = xc.length; !xc[--k]; );

                // E.g. [4, 11, 15] becomes 4bf.
                for ( i = 0, str = ''; i <= k; str += ALPHABET.charAt( xc[i++] ) );
                str = toFixedPoint( str, e );
            }

            // The caller will add the sign.
            return str;
        }


        // Perform division in the specified base. Called by div and convertBase.
        div = (function () {

            // Assume non-zero x and k.
            function multiply( x, k, base ) {
                var m, temp, xlo, xhi,
                    carry = 0,
                    i = x.length,
                    klo = k % SQRT_BASE,
                    khi = k / SQRT_BASE | 0;

                for ( x = x.slice(); i--; ) {
                    xlo = x[i] % SQRT_BASE;
                    xhi = x[i] / SQRT_BASE | 0;
                    m = khi * xlo + xhi * klo;
                    temp = klo * xlo + ( ( m % SQRT_BASE ) * SQRT_BASE ) + carry;
                    carry = ( temp / base | 0 ) + ( m / SQRT_BASE | 0 ) + khi * xhi;
                    x[i] = temp % base;
                }

                if (carry) x.unshift(carry);

                return x;
            }

            function compare( a, b, aL, bL ) {
                var i, cmp;

                if ( aL != bL ) {
                    cmp = aL > bL ? 1 : -1;
                } else {

                    for ( i = cmp = 0; i < aL; i++ ) {

                        if ( a[i] != b[i] ) {
                            cmp = a[i] > b[i] ? 1 : -1;
                            break;
                        }
                    }
                }
                return cmp;
            }

            function subtract( a, b, aL, base ) {
                var i = 0;

                // Subtract b from a.
                for ( ; aL--; ) {
                    a[aL] -= i;
                    i = a[aL] < b[aL] ? 1 : 0;
                    a[aL] = i * base + a[aL] - b[aL];
                }

                // Remove leading zeros.
                for ( ; !a[0] && a.length > 1; a.shift() );
            }

            // x: dividend, y: divisor.
            return function ( x, y, dp, rm, base ) {
                var cmp, e, i, more, n, prod, prodL, q, qc, rem, remL, rem0, xi, xL, yc0,
                    yL, yz,
                    s = x.s == y.s ? 1 : -1,
                    xc = x.c,
                    yc = y.c;

                // Either NaN, Infinity or 0?
                if ( !xc || !xc[0] || !yc || !yc[0] ) {

                    return new BigNumber(

                      // Return NaN if either NaN, or both Infinity or 0.
                      !x.s || !y.s || ( xc ? yc && xc[0] == yc[0] : !yc ) ? NaN :

                        // Return ±0 if x is ±0 or y is ±Infinity, or return ±Infinity as y is ±0.
                        xc && xc[0] == 0 || !yc ? s * 0 : s / 0
                    );
                }

                q = new BigNumber(s);
                qc = q.c = [];
                e = x.e - y.e;
                s = dp + e + 1;

                if ( !base ) {
                    base = BASE;
                    e = bitFloor( x.e / LOG_BASE ) - bitFloor( y.e / LOG_BASE );
                    s = s / LOG_BASE | 0;
                }

                // Result exponent may be one less then the current value of e.
                // The coefficients of the BigNumbers from convertBase may have trailing zeros.
                for ( i = 0; yc[i] == ( xc[i] || 0 ); i++ );
                if ( yc[i] > ( xc[i] || 0 ) ) e--;

                if ( s < 0 ) {
                    qc.push(1);
                    more = true;
                } else {
                    xL = xc.length;
                    yL = yc.length;
                    i = 0;
                    s += 2;

                    // Normalise xc and yc so highest order digit of yc is >= base / 2.

                    n = mathfloor( base / ( yc[0] + 1 ) );

                    // Not necessary, but to handle odd bases where yc[0] == ( base / 2 ) - 1.
                    // if ( n > 1 || n++ == 1 && yc[0] < base / 2 ) {
                    if ( n > 1 ) {
                        yc = multiply( yc, n, base );
                        xc = multiply( xc, n, base );
                        yL = yc.length;
                        xL = xc.length;
                    }

                    xi = yL;
                    rem = xc.slice( 0, yL );
                    remL = rem.length;

                    // Add zeros to make remainder as long as divisor.
                    for ( ; remL < yL; rem[remL++] = 0 );
                    yz = yc.slice();
                    yz.unshift(0);
                    yc0 = yc[0];
                    if ( yc[1] >= base / 2 ) yc0++;
                    // Not necessary, but to prevent trial digit n > base, when using base 3.
                    // else if ( base == 3 && yc0 == 1 ) yc0 = 1 + 1e-15;

                    do {
                        n = 0;

                        // Compare divisor and remainder.
                        cmp = compare( yc, rem, yL, remL );

                        // If divisor < remainder.
                        if ( cmp < 0 ) {

                            // Calculate trial digit, n.

                            rem0 = rem[0];
                            if ( yL != remL ) rem0 = rem0 * base + ( rem[1] || 0 );

                            // n is how many times the divisor goes into the current remainder.
                            n = mathfloor( rem0 / yc0 );

                            //  Algorithm:
                            //  1. product = divisor * trial digit (n)
                            //  2. if product > remainder: product -= divisor, n--
                            //  3. remainder -= product
                            //  4. if product was < remainder at 2:
                            //    5. compare new remainder and divisor
                            //    6. If remainder > divisor: remainder -= divisor, n++

                            if ( n > 1 ) {

                                // n may be > base only when base is 3.
                                if (n >= base) n = base - 1;

                                // product = divisor * trial digit.
                                prod = multiply( yc, n, base );
                                prodL = prod.length;
                                remL = rem.length;

                                // Compare product and remainder.
                                // If product > remainder.
                                // Trial digit n too high.
                                // n is 1 too high about 5% of the time, and is not known to have
                                // ever been more than 1 too high.
                                while ( compare( prod, rem, prodL, remL ) == 1 ) {
                                    n--;

                                    // Subtract divisor from product.
                                    subtract( prod, yL < prodL ? yz : yc, prodL, base );
                                    prodL = prod.length;
                                    cmp = 1;
                                }
                            } else {

                                // n is 0 or 1, cmp is -1.
                                // If n is 0, there is no need to compare yc and rem again below,
                                // so change cmp to 1 to avoid it.
                                // If n is 1, leave cmp as -1, so yc and rem are compared again.
                                if ( n == 0 ) {

                                    // divisor < remainder, so n must be at least 1.
                                    cmp = n = 1;
                                }

                                // product = divisor
                                prod = yc.slice();
                                prodL = prod.length;
                            }

                            if ( prodL < remL ) prod.unshift(0);

                            // Subtract product from remainder.
                            subtract( rem, prod, remL, base );
                            remL = rem.length;

                             // If product was < remainder.
                            if ( cmp == -1 ) {

                                // Compare divisor and new remainder.
                                // If divisor < new remainder, subtract divisor from remainder.
                                // Trial digit n too low.
                                // n is 1 too low about 5% of the time, and very rarely 2 too low.
                                while ( compare( yc, rem, yL, remL ) < 1 ) {
                                    n++;

                                    // Subtract divisor from remainder.
                                    subtract( rem, yL < remL ? yz : yc, remL, base );
                                    remL = rem.length;
                                }
                            }
                        } else if ( cmp === 0 ) {
                            n++;
                            rem = [0];
                        } // else cmp === 1 and n will be 0

                        // Add the next digit, n, to the result array.
                        qc[i++] = n;

                        // Update the remainder.
                        if ( rem[0] ) {
                            rem[remL++] = xc[xi] || 0;
                        } else {
                            rem = [ xc[xi] ];
                            remL = 1;
                        }
                    } while ( ( xi++ < xL || rem[0] != null ) && s-- );

                    more = rem[0] != null;

                    // Leading zero?
                    if ( !qc[0] ) qc.shift();
                }

                if ( base == BASE ) {

                    // To calculate q.e, first get the number of digits of qc[0].
                    for ( i = 1, s = qc[0]; s >= 10; s /= 10, i++ );
                    round( q, dp + ( q.e = i + e * LOG_BASE - 1 ) + 1, rm, more );

                // Caller is convertBase.
                } else {
                    q.e = e;
                    q.r = +more;
                }

                return q;
            };
        })();


        /*
         * Return a string representing the value of BigNumber n in fixed-point or exponential
         * notation rounded to the specified decimal places or significant digits.
         *
         * n is a BigNumber.
         * i is the index of the last digit required (i.e. the digit that may be rounded up).
         * rm is the rounding mode.
         * caller is caller id: toExponential 19, toFixed 20, toFormat 21, toPrecision 24.
         */
        function format( n, i, rm, caller ) {
            var c0, e, ne, len, str;

            rm = rm != null && isValidInt( rm, 0, 8, caller, roundingMode )
              ? rm | 0 : ROUNDING_MODE;

            if ( !n.c ) return n.toString();
            c0 = n.c[0];
            ne = n.e;

            if ( i == null ) {
                str = coeffToString( n.c );
                str = caller == 19 || caller == 24 && ne <= TO_EXP_NEG
                  ? toExponential( str, ne )
                  : toFixedPoint( str, ne );
            } else {
                n = round( new BigNumber(n), i, rm );

                // n.e may have changed if the value was rounded up.
                e = n.e;

                str = coeffToString( n.c );
                len = str.length;

                // toPrecision returns exponential notation if the number of significant digits
                // specified is less than the number of digits necessary to represent the integer
                // part of the value in fixed-point notation.

                // Exponential notation.
                if ( caller == 19 || caller == 24 && ( i <= e || e <= TO_EXP_NEG ) ) {

                    // Append zeros?
                    for ( ; len < i; str += '0', len++ );
                    str = toExponential( str, e );

                // Fixed-point notation.
                } else {
                    i -= ne;
                    str = toFixedPoint( str, e );

                    // Append zeros?
                    if ( e + 1 > len ) {
                        if ( --i > 0 ) for ( str += '.'; i--; str += '0' );
                    } else {
                        i += e - len;
                        if ( i > 0 ) {
                            if ( e + 1 == len ) str += '.';
                            for ( ; i--; str += '0' );
                        }
                    }
                }
            }

            return n.s < 0 && c0 ? '-' + str : str;
        }


        // Handle BigNumber.max and BigNumber.min.
        function maxOrMin( args, method ) {
            var m, n,
                i = 0;

            if ( isArray( args[0] ) ) args = args[0];
            m = new BigNumber( args[0] );

            for ( ; ++i < args.length; ) {
                n = new BigNumber( args[i] );

                // If any number is NaN, return NaN.
                if ( !n.s ) {
                    m = n;
                    break;
                } else if ( method.call( m, n ) ) {
                    m = n;
                }
            }

            return m;
        }


        /*
         * Return true if n is an integer in range, otherwise throw.
         * Use for argument validation when ERRORS is true.
         */
        function intValidatorWithErrors( n, min, max, caller, name ) {
            if ( n < min || n > max || n != truncate(n) ) {
                raise( caller, ( name || 'decimal places' ) +
                  ( n < min || n > max ? ' out of range' : ' not an integer' ), n );
            }

            return true;
        }


        /*
         * Strip trailing zeros, calculate base 10 exponent and check against MIN_EXP and MAX_EXP.
         * Called by minus, plus and times.
         */
        function normalise( n, c, e ) {
            var i = 1,
                j = c.length;

             // Remove trailing zeros.
            for ( ; !c[--j]; c.pop() );

            // Calculate the base 10 exponent. First get the number of digits of c[0].
            for ( j = c[0]; j >= 10; j /= 10, i++ );

            // Overflow?
            if ( ( e = i + e * LOG_BASE - 1 ) > MAX_EXP ) {

                // Infinity.
                n.c = n.e = null;

            // Underflow?
            } else if ( e < MIN_EXP ) {

                // Zero.
                n.c = [ n.e = 0 ];
            } else {
                n.e = e;
                n.c = c;
            }

            return n;
        }


        // Handle values that fail the validity test in BigNumber.
        parseNumeric = (function () {
            var basePrefix = /^(-?)0([xbo])(?=\w[\w.]*$)/i,
                dotAfter = /^([^.]+)\.$/,
                dotBefore = /^\.([^.]+)$/,
                isInfinityOrNaN = /^-?(Infinity|NaN)$/,
                whitespaceOrPlus = /^\s*\+(?=[\w.])|^\s+|\s+$/g;

            return function ( x, str, num, b ) {
                var base,
                    s = num ? str : str.replace( whitespaceOrPlus, '' );

                // No exception on ±Infinity or NaN.
                if ( isInfinityOrNaN.test(s) ) {
                    x.s = isNaN(s) ? null : s < 0 ? -1 : 1;
                } else {
                    if ( !num ) {

                        // basePrefix = /^(-?)0([xbo])(?=\w[\w.]*$)/i
                        s = s.replace( basePrefix, function ( m, p1, p2 ) {
                            base = ( p2 = p2.toLowerCase() ) == 'x' ? 16 : p2 == 'b' ? 2 : 8;
                            return !b || b == base ? p1 : m;
                        });

                        if (b) {
                            base = b;

                            // E.g. '1.' to '1', '.1' to '0.1'
                            s = s.replace( dotAfter, '$1' ).replace( dotBefore, '0.$1' );
                        }

                        if ( str != s ) return new BigNumber( s, base );
                    }

                    // 'new BigNumber() not a number: {n}'
                    // 'new BigNumber() not a base {b} number: {n}'
                    if (ERRORS) raise( id, 'not a' + ( b ? ' base ' + b : '' ) + ' number', str );
                    x.s = null;
                }

                x.c = x.e = null;
                id = 0;
            }
        })();


        // Throw a BigNumber Error.
        function raise( caller, msg, val ) {
            var error = new Error( [
                'new BigNumber',     // 0
                'cmp',               // 1
                'config',            // 2
                'div',               // 3
                'divToInt',          // 4
                'eq',                // 5
                'gt',                // 6
                'gte',               // 7
                'lt',                // 8
                'lte',               // 9
                'minus',             // 10
                'mod',               // 11
                'plus',              // 12
                'precision',         // 13
                'random',            // 14
                'round',             // 15
                'shift',             // 16
                'times',             // 17
                'toDigits',          // 18
                'toExponential',     // 19
                'toFixed',           // 20
                'toFormat',          // 21
                'toFraction',        // 22
                'pow',               // 23
                'toPrecision',       // 24
                'toString',          // 25
                'BigNumber'          // 26
            ][caller] + '() ' + msg + ': ' + val );

            error.name = 'BigNumber Error';
            id = 0;
            throw error;
        }


        /*
         * Round x to sd significant digits using rounding mode rm. Check for over/under-flow.
         * If r is truthy, it is known that there are more digits after the rounding digit.
         */
        function round( x, sd, rm, r ) {
            var d, i, j, k, n, ni, rd,
                xc = x.c,
                pows10 = POWS_TEN;

            // if x is not Infinity or NaN...
            if (xc) {

                // rd is the rounding digit, i.e. the digit after the digit that may be rounded up.
                // n is a base 1e14 number, the value of the element of array x.c containing rd.
                // ni is the index of n within x.c.
                // d is the number of digits of n.
                // i is the index of rd within n including leading zeros.
                // j is the actual index of rd within n (if < 0, rd is a leading zero).
                out: {

                    // Get the number of digits of the first element of xc.
                    for ( d = 1, k = xc[0]; k >= 10; k /= 10, d++ );
                    i = sd - d;

                    // If the rounding digit is in the first element of xc...
                    if ( i < 0 ) {
                        i += LOG_BASE;
                        j = sd;
                        n = xc[ ni = 0 ];

                        // Get the rounding digit at index j of n.
                        rd = n / pows10[ d - j - 1 ] % 10 | 0;
                    } else {
                        ni = mathceil( ( i + 1 ) / LOG_BASE );

                        if ( ni >= xc.length ) {

                            if (r) {

                                // Needed by sqrt.
                                for ( ; xc.length <= ni; xc.push(0) );
                                n = rd = 0;
                                d = 1;
                                i %= LOG_BASE;
                                j = i - LOG_BASE + 1;
                            } else {
                                break out;
                            }
                        } else {
                            n = k = xc[ni];

                            // Get the number of digits of n.
                            for ( d = 1; k >= 10; k /= 10, d++ );

                            // Get the index of rd within n.
                            i %= LOG_BASE;

                            // Get the index of rd within n, adjusted for leading zeros.
                            // The number of leading zeros of n is given by LOG_BASE - d.
                            j = i - LOG_BASE + d;

                            // Get the rounding digit at index j of n.
                            rd = j < 0 ? 0 : n / pows10[ d - j - 1 ] % 10 | 0;
                        }
                    }

                    r = r || sd < 0 ||

                    // Are there any non-zero digits after the rounding digit?
                    // The expression  n % pows10[ d - j - 1 ]  returns all digits of n to the right
                    // of the digit at j, e.g. if n is 908714 and j is 2, the expression gives 714.
                      xc[ni + 1] != null || ( j < 0 ? n : n % pows10[ d - j - 1 ] );

                    r = rm < 4
                      ? ( rd || r ) && ( rm == 0 || rm == ( x.s < 0 ? 3 : 2 ) )
                      : rd > 5 || rd == 5 && ( rm == 4 || r || rm == 6 &&

                        // Check whether the digit to the left of the rounding digit is odd.
                        ( ( i > 0 ? j > 0 ? n / pows10[ d - j ] : 0 : xc[ni - 1] ) % 10 ) & 1 ||
                          rm == ( x.s < 0 ? 8 : 7 ) );

                    if ( sd < 1 || !xc[0] ) {
                        xc.length = 0;

                        if (r) {

                            // Convert sd to decimal places.
                            sd -= x.e + 1;

                            // 1, 0.1, 0.01, 0.001, 0.0001 etc.
                            xc[0] = pows10[ ( LOG_BASE - sd % LOG_BASE ) % LOG_BASE ];
                            x.e = -sd || 0;
                        } else {

                            // Zero.
                            xc[0] = x.e = 0;
                        }

                        return x;
                    }

                    // Remove excess digits.
                    if ( i == 0 ) {
                        xc.length = ni;
                        k = 1;
                        ni--;
                    } else {
                        xc.length = ni + 1;
                        k = pows10[ LOG_BASE - i ];

                        // E.g. 56700 becomes 56000 if 7 is the rounding digit.
                        // j > 0 means i > number of leading zeros of n.
                        xc[ni] = j > 0 ? mathfloor( n / pows10[ d - j ] % pows10[j] ) * k : 0;
                    }

                    // Round up?
                    if (r) {

                        for ( ; ; ) {

                            // If the digit to be rounded up is in the first element of xc...
                            if ( ni == 0 ) {

                                // i will be the length of xc[0] before k is added.
                                for ( i = 1, j = xc[0]; j >= 10; j /= 10, i++ );
                                j = xc[0] += k;
                                for ( k = 1; j >= 10; j /= 10, k++ );

                                // if i != k the length has increased.
                                if ( i != k ) {
                                    x.e++;
                                    if ( xc[0] == BASE ) xc[0] = 1;
                                }

                                break;
                            } else {
                                xc[ni] += k;
                                if ( xc[ni] != BASE ) break;
                                xc[ni--] = 0;
                                k = 1;
                            }
                        }
                    }

                    // Remove trailing zeros.
                    for ( i = xc.length; xc[--i] === 0; xc.pop() );
                }

                // Overflow? Infinity.
                if ( x.e > MAX_EXP ) {
                    x.c = x.e = null;

                // Underflow? Zero.
                } else if ( x.e < MIN_EXP ) {
                    x.c = [ x.e = 0 ];
                }
            }

            return x;
        }


        // PROTOTYPE/INSTANCE METHODS


        /*
         * Return a new BigNumber whose value is the absolute value of this BigNumber.
         */
        P.absoluteValue = P.abs = function () {
            var x = new BigNumber(this);
            if ( x.s < 0 ) x.s = 1;
            return x;
        };


        /*
         * Return a new BigNumber whose value is the value of this BigNumber rounded to a whole
         * number in the direction of Infinity.
         */
        P.ceil = function () {
            return round( new BigNumber(this), this.e + 1, 2 );
        };


        /*
         * Return
         * 1 if the value of this BigNumber is greater than the value of BigNumber(y, b),
         * -1 if the value of this BigNumber is less than the value of BigNumber(y, b),
         * 0 if they have the same value,
         * or null if the value of either is NaN.
         */
        P.comparedTo = P.cmp = function ( y, b ) {
            id = 1;
            return compare( this, new BigNumber( y, b ) );
        };


        /*
         * Return the number of decimal places of the value of this BigNumber, or null if the value
         * of this BigNumber is ±Infinity or NaN.
         */
        P.decimalPlaces = P.dp = function () {
            var n, v,
                c = this.c;

            if ( !c ) return null;
            n = ( ( v = c.length - 1 ) - bitFloor( this.e / LOG_BASE ) ) * LOG_BASE;

            // Subtract the number of trailing zeros of the last number.
            if ( v = c[v] ) for ( ; v % 10 == 0; v /= 10, n-- );
            if ( n < 0 ) n = 0;

            return n;
        };


        /*
         *  n / 0 = I
         *  n / N = N
         *  n / I = 0
         *  0 / n = 0
         *  0 / 0 = N
         *  0 / N = N
         *  0 / I = 0
         *  N / n = N
         *  N / 0 = N
         *  N / N = N
         *  N / I = N
         *  I / n = I
         *  I / 0 = I
         *  I / N = N
         *  I / I = N
         *
         * Return a new BigNumber whose value is the value of this BigNumber divided by the value of
         * BigNumber(y, b), rounded according to DECIMAL_PLACES and ROUNDING_MODE.
         */
        P.dividedBy = P.div = function ( y, b ) {
            id = 3;
            return div( this, new BigNumber( y, b ), DECIMAL_PLACES, ROUNDING_MODE );
        };


        /*
         * Return a new BigNumber whose value is the integer part of dividing the value of this
         * BigNumber by the value of BigNumber(y, b).
         */
        P.dividedToIntegerBy = P.divToInt = function ( y, b ) {
            id = 4;
            return div( this, new BigNumber( y, b ), 0, 1 );
        };


        /*
         * Return true if the value of this BigNumber is equal to the value of BigNumber(y, b),
         * otherwise returns false.
         */
        P.equals = P.eq = function ( y, b ) {
            id = 5;
            return compare( this, new BigNumber( y, b ) ) === 0;
        };


        /*
         * Return a new BigNumber whose value is the value of this BigNumber rounded to a whole
         * number in the direction of -Infinity.
         */
        P.floor = function () {
            return round( new BigNumber(this), this.e + 1, 3 );
        };


        /*
         * Return true if the value of this BigNumber is greater than the value of BigNumber(y, b),
         * otherwise returns false.
         */
        P.greaterThan = P.gt = function ( y, b ) {
            id = 6;
            return compare( this, new BigNumber( y, b ) ) > 0;
        };


        /*
         * Return true if the value of this BigNumber is greater than or equal to the value of
         * BigNumber(y, b), otherwise returns false.
         */
        P.greaterThanOrEqualTo = P.gte = function ( y, b ) {
            id = 7;
            return ( b = compare( this, new BigNumber( y, b ) ) ) === 1 || b === 0;

        };


        /*
         * Return true if the value of this BigNumber is a finite number, otherwise returns false.
         */
        P.isFinite = function () {
            return !!this.c;
        };


        /*
         * Return true if the value of this BigNumber is an integer, otherwise return false.
         */
        P.isInteger = P.isInt = function () {
            return !!this.c && bitFloor( this.e / LOG_BASE ) > this.c.length - 2;
        };


        /*
         * Return true if the value of this BigNumber is NaN, otherwise returns false.
         */
        P.isNaN = function () {
            return !this.s;
        };


        /*
         * Return true if the value of this BigNumber is negative, otherwise returns false.
         */
        P.isNegative = P.isNeg = function () {
            return this.s < 0;
        };


        /*
         * Return true if the value of this BigNumber is 0 or -0, otherwise returns false.
         */
        P.isZero = function () {
            return !!this.c && this.c[0] == 0;
        };


        /*
         * Return true if the value of this BigNumber is less than the value of BigNumber(y, b),
         * otherwise returns false.
         */
        P.lessThan = P.lt = function ( y, b ) {
            id = 8;
            return compare( this, new BigNumber( y, b ) ) < 0;
        };


        /*
         * Return true if the value of this BigNumber is less than or equal to the value of
         * BigNumber(y, b), otherwise returns false.
         */
        P.lessThanOrEqualTo = P.lte = function ( y, b ) {
            id = 9;
            return ( b = compare( this, new BigNumber( y, b ) ) ) === -1 || b === 0;
        };


        /*
         *  n - 0 = n
         *  n - N = N
         *  n - I = -I
         *  0 - n = -n
         *  0 - 0 = 0
         *  0 - N = N
         *  0 - I = -I
         *  N - n = N
         *  N - 0 = N
         *  N - N = N
         *  N - I = N
         *  I - n = I
         *  I - 0 = I
         *  I - N = N
         *  I - I = N
         *
         * Return a new BigNumber whose value is the value of this BigNumber minus the value of
         * BigNumber(y, b).
         */
        P.minus = P.sub = function ( y, b ) {
            var i, j, t, xLTy,
                x = this,
                a = x.s;

            id = 10;
            y = new BigNumber( y, b );
            b = y.s;

            // Either NaN?
            if ( !a || !b ) return new BigNumber(NaN);

            // Signs differ?
            if ( a != b ) {
                y.s = -b;
                return x.plus(y);
            }

            var xe = x.e / LOG_BASE,
                ye = y.e / LOG_BASE,
                xc = x.c,
                yc = y.c;

            if ( !xe || !ye ) {

                // Either Infinity?
                if ( !xc || !yc ) return xc ? ( y.s = -b, y ) : new BigNumber( yc ? x : NaN );

                // Either zero?
                if ( !xc[0] || !yc[0] ) {

                    // Return y if y is non-zero, x if x is non-zero, or zero if both are zero.
                    return yc[0] ? ( y.s = -b, y ) : new BigNumber( xc[0] ? x :

                      // IEEE 754 (2008) 6.3: n - n = -0 when rounding to -Infinity
                      ROUNDING_MODE == 3 ? -0 : 0 );
                }
            }

            xe = bitFloor(xe);
            ye = bitFloor(ye);
            xc = xc.slice();

            // Determine which is the bigger number.
            if ( a = xe - ye ) {

                if ( xLTy = a < 0 ) {
                    a = -a;
                    t = xc;
                } else {
                    ye = xe;
                    t = yc;
                }

                t.reverse();

                // Prepend zeros to equalise exponents.
                for ( b = a; b--; t.push(0) );
                t.reverse();
            } else {

                // Exponents equal. Check digit by digit.
                j = ( xLTy = ( a = xc.length ) < ( b = yc.length ) ) ? a : b;

                for ( a = b = 0; b < j; b++ ) {

                    if ( xc[b] != yc[b] ) {
                        xLTy = xc[b] < yc[b];
                        break;
                    }
                }
            }

            // x < y? Point xc to the array of the bigger number.
            if (xLTy) t = xc, xc = yc, yc = t, y.s = -y.s;

            b = ( j = yc.length ) - ( i = xc.length );

            // Append zeros to xc if shorter.
            // No need to add zeros to yc if shorter as subtract only needs to start at yc.length.
            if ( b > 0 ) for ( ; b--; xc[i++] = 0 );
            b = BASE - 1;

            // Subtract yc from xc.
            for ( ; j > a; ) {

                if ( xc[--j] < yc[j] ) {
                    for ( i = j; i && !xc[--i]; xc[i] = b );
                    --xc[i];
                    xc[j] += BASE;
                }

                xc[j] -= yc[j];
            }

            // Remove leading zeros and adjust exponent accordingly.
            for ( ; xc[0] == 0; xc.shift(), --ye );

            // Zero?
            if ( !xc[0] ) {

                // Following IEEE 754 (2008) 6.3,
                // n - n = +0  but  n - n = -0  when rounding towards -Infinity.
                y.s = ROUNDING_MODE == 3 ? -1 : 1;
                y.c = [ y.e = 0 ];
                return y;
            }

            // No need to check for Infinity as +x - +y != Infinity && -x - -y != Infinity
            // for finite x and y.
            return normalise( y, xc, ye );
        };


        /*
         *   n % 0 =  N
         *   n % N =  N
         *   n % I =  n
         *   0 % n =  0
         *  -0 % n = -0
         *   0 % 0 =  N
         *   0 % N =  N
         *   0 % I =  0
         *   N % n =  N
         *   N % 0 =  N
         *   N % N =  N
         *   N % I =  N
         *   I % n =  N
         *   I % 0 =  N
         *   I % N =  N
         *   I % I =  N
         *
         * Return a new BigNumber whose value is the value of this BigNumber modulo the value of
         * BigNumber(y, b). The result depends on the value of MODULO_MODE.
         */
        P.modulo = P.mod = function ( y, b ) {
            var q, s,
                x = this;

            id = 11;
            y = new BigNumber( y, b );

            // Return NaN if x is Infinity or NaN, or y is NaN or zero.
            if ( !x.c || !y.s || y.c && !y.c[0] ) {
                return new BigNumber(NaN);

            // Return x if y is Infinity or x is zero.
            } else if ( !y.c || x.c && !x.c[0] ) {
                return new BigNumber(x);
            }

            if ( MODULO_MODE == 9 ) {

                // Euclidian division: q = sign(y) * floor(x / abs(y))
                // r = x - qy    where  0 <= r < abs(y)
                s = y.s;
                y.s = 1;
                q = div( x, y, 0, 3 );
                y.s = s;
                q.s *= s;
            } else {
                q = div( x, y, 0, MODULO_MODE );
            }

            return x.minus( q.times(y) );
        };


        /*
         * Return a new BigNumber whose value is the value of this BigNumber negated,
         * i.e. multiplied by -1.
         */
        P.negated = P.neg = function () {
            var x = new BigNumber(this);
            x.s = -x.s || null;
            return x;
        };


        /*
         *  n + 0 = n
         *  n + N = N
         *  n + I = I
         *  0 + n = n
         *  0 + 0 = 0
         *  0 + N = N
         *  0 + I = I
         *  N + n = N
         *  N + 0 = N
         *  N + N = N
         *  N + I = N
         *  I + n = I
         *  I + 0 = I
         *  I + N = N
         *  I + I = I
         *
         * Return a new BigNumber whose value is the value of this BigNumber plus the value of
         * BigNumber(y, b).
         */
        P.plus = P.add = function ( y, b ) {
            var t,
                x = this,
                a = x.s;

            id = 12;
            y = new BigNumber( y, b );
            b = y.s;

            // Either NaN?
            if ( !a || !b ) return new BigNumber(NaN);

            // Signs differ?
             if ( a != b ) {
                y.s = -b;
                return x.minus(y);
            }

            var xe = x.e / LOG_BASE,
                ye = y.e / LOG_BASE,
                xc = x.c,
                yc = y.c;

            if ( !xe || !ye ) {

                // Return ±Infinity if either ±Infinity.
                if ( !xc || !yc ) return new BigNumber( a / 0 );

                // Either zero?
                // Return y if y is non-zero, x if x is non-zero, or zero if both are zero.
                if ( !xc[0] || !yc[0] ) return yc[0] ? y : new BigNumber( xc[0] ? x : a * 0 );
            }

            xe = bitFloor(xe);
            ye = bitFloor(ye);
            xc = xc.slice();

            // Prepend zeros to equalise exponents. Faster to use reverse then do unshifts.
            if ( a = xe - ye ) {
                if ( a > 0 ) {
                    ye = xe;
                    t = yc;
                } else {
                    a = -a;
                    t = xc;
                }

                t.reverse();
                for ( ; a--; t.push(0) );
                t.reverse();
            }

            a = xc.length;
            b = yc.length;

            // Point xc to the longer array, and b to the shorter length.
            if ( a - b < 0 ) t = yc, yc = xc, xc = t, b = a;

            // Only start adding at yc.length - 1 as the further digits of xc can be ignored.
            for ( a = 0; b; ) {
                a = ( xc[--b] = xc[b] + yc[b] + a ) / BASE | 0;
                xc[b] %= BASE;
            }

            if (a) {
                xc.unshift(a);
                ++ye;
            }

            // No need to check for zero, as +x + +y != 0 && -x + -y != 0
            // ye = MAX_EXP + 1 possible
            return normalise( y, xc, ye );
        };


        /*
         * Return the number of significant digits of the value of this BigNumber.
         *
         * [z] {boolean|number} Whether to count integer-part trailing zeros: true, false, 1 or 0.
         */
        P.precision = P.sd = function (z) {
            var n, v,
                x = this,
                c = x.c;

            // 'precision() argument not a boolean or binary digit: {z}'
            if ( z != null && z !== !!z && z !== 1 && z !== 0 ) {
                if (ERRORS) raise( 13, 'argument' + notBool, z );
                if ( z != !!z ) z = null;
            }

            if ( !c ) return null;
            v = c.length - 1;
            n = v * LOG_BASE + 1;

            if ( v = c[v] ) {

                // Subtract the number of trailing zeros of the last element.
                for ( ; v % 10 == 0; v /= 10, n-- );

                // Add the number of digits of the first element.
                for ( v = c[0]; v >= 10; v /= 10, n++ );
            }

            if ( z && x.e + 1 > n ) n = x.e + 1;

            return n;
        };


        /*
         * Return a new BigNumber whose value is the value of this BigNumber rounded to a maximum of
         * dp decimal places using rounding mode rm, or to 0 and ROUNDING_MODE respectively if
         * omitted.
         *
         * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
         * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
         *
         * 'round() decimal places out of range: {dp}'
         * 'round() decimal places not an integer: {dp}'
         * 'round() rounding mode not an integer: {rm}'
         * 'round() rounding mode out of range: {rm}'
         */
        P.round = function ( dp, rm ) {
            var n = new BigNumber(this);

            if ( dp == null || isValidInt( dp, 0, MAX, 15 ) ) {
                round( n, ~~dp + this.e + 1, rm == null ||
                  !isValidInt( rm, 0, 8, 15, roundingMode ) ? ROUNDING_MODE : rm | 0 );
            }

            return n;
        };


        /*
         * Return a new BigNumber whose value is the value of this BigNumber shifted by k places
         * (powers of 10). Shift to the right if n > 0, and to the left if n < 0.
         *
         * k {number} Integer, -MAX_SAFE_INTEGER to MAX_SAFE_INTEGER inclusive.
         *
         * If k is out of range and ERRORS is false, the result will be ±0 if k < 0, or ±Infinity
         * otherwise.
         *
         * 'shift() argument not an integer: {k}'
         * 'shift() argument out of range: {k}'
         */
        P.shift = function (k) {
            var n = this;
            return isValidInt( k, -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER, 16, 'argument' )

              // k < 1e+21, or truncate(k) will produce exponential notation.
              ? n.times( '1e' + truncate(k) )
              : new BigNumber( n.c && n.c[0] && ( k < -MAX_SAFE_INTEGER || k > MAX_SAFE_INTEGER )
                ? n.s * ( k < 0 ? 0 : 1 / 0 )
                : n );
        };


        /*
         *  sqrt(-n) =  N
         *  sqrt( N) =  N
         *  sqrt(-I) =  N
         *  sqrt( I) =  I
         *  sqrt( 0) =  0
         *  sqrt(-0) = -0
         *
         * Return a new BigNumber whose value is the square root of the value of this BigNumber,
         * rounded according to DECIMAL_PLACES and ROUNDING_MODE.
         */
        P.squareRoot = P.sqrt = function () {
            var m, n, r, rep, t,
                x = this,
                c = x.c,
                s = x.s,
                e = x.e,
                dp = DECIMAL_PLACES + 4,
                half = new BigNumber('0.5');

            // Negative/NaN/Infinity/zero?
            if ( s !== 1 || !c || !c[0] ) {
                return new BigNumber( !s || s < 0 && ( !c || c[0] ) ? NaN : c ? x : 1 / 0 );
            }

            // Initial estimate.
            s = Math.sqrt( +x );

            // Math.sqrt underflow/overflow?
            // Pass x to Math.sqrt as integer, then adjust the exponent of the result.
            if ( s == 0 || s == 1 / 0 ) {
                n = coeffToString(c);
                if ( ( n.length + e ) % 2 == 0 ) n += '0';
                s = Math.sqrt(n);
                e = bitFloor( ( e + 1 ) / 2 ) - ( e < 0 || e % 2 );

                if ( s == 1 / 0 ) {
                    n = '1e' + e;
                } else {
                    n = s.toExponential();
                    n = n.slice( 0, n.indexOf('e') + 1 ) + e;
                }

                r = new BigNumber(n);
            } else {
                r = new BigNumber( s + '' );
            }

            // Check for zero.
            // r could be zero if MIN_EXP is changed after the this value was created.
            // This would cause a division by zero (x/t) and hence Infinity below, which would cause
            // coeffToString to throw.
            if ( r.c[0] ) {
                e = r.e;
                s = e + dp;
                if ( s < 3 ) s = 0;

                // Newton-Raphson iteration.
                for ( ; ; ) {
                    t = r;
                    r = half.times( t.plus( div( x, t, dp, 1 ) ) );

                    if ( coeffToString( t.c   ).slice( 0, s ) === ( n =
                         coeffToString( r.c ) ).slice( 0, s ) ) {

                        // The exponent of r may here be one less than the final result exponent,
                        // e.g 0.0009999 (e-4) --> 0.001 (e-3), so adjust s so the rounding digits
                        // are indexed correctly.
                        if ( r.e < e ) --s;
                        n = n.slice( s - 3, s + 1 );

                        // The 4th rounding digit may be in error by -1 so if the 4 rounding digits
                        // are 9999 or 4999 (i.e. approaching a rounding boundary) continue the
                        // iteration.
                        if ( n == '9999' || !rep && n == '4999' ) {

                            // On the first iteration only, check to see if rounding up gives the
                            // exact result as the nines may infinitely repeat.
                            if ( !rep ) {
                                round( t, t.e + DECIMAL_PLACES + 2, 0 );

                                if ( t.times(t).eq(x) ) {
                                    r = t;
                                    break;
                                }
                            }

                            dp += 4;
                            s += 4;
                            rep = 1;
                        } else {

                            // If rounding digits are null, 0{0,4} or 50{0,3}, check for exact
                            // result. If not, then there are further digits and m will be truthy.
                            if ( !+n || !+n.slice(1) && n.charAt(0) == '5' ) {

                                // Truncate to the first rounding digit.
                                round( r, r.e + DECIMAL_PLACES + 2, 1 );
                                m = !r.times(r).eq(x);
                            }

                            break;
                        }
                    }
                }
            }

            return round( r, r.e + DECIMAL_PLACES + 1, ROUNDING_MODE, m );
        };


        /*
         *  n * 0 = 0
         *  n * N = N
         *  n * I = I
         *  0 * n = 0
         *  0 * 0 = 0
         *  0 * N = N
         *  0 * I = N
         *  N * n = N
         *  N * 0 = N
         *  N * N = N
         *  N * I = N
         *  I * n = I
         *  I * 0 = N
         *  I * N = N
         *  I * I = I
         *
         * Return a new BigNumber whose value is the value of this BigNumber times the value of
         * BigNumber(y, b).
         */
        P.times = P.mul = function ( y, b ) {
            var c, e, i, j, k, m, xcL, xlo, xhi, ycL, ylo, yhi, zc,
                base, sqrtBase,
                x = this,
                xc = x.c,
                yc = ( id = 17, y = new BigNumber( y, b ) ).c;

            // Either NaN, ±Infinity or ±0?
            if ( !xc || !yc || !xc[0] || !yc[0] ) {

                // Return NaN if either is NaN, or one is 0 and the other is Infinity.
                if ( !x.s || !y.s || xc && !xc[0] && !yc || yc && !yc[0] && !xc ) {
                    y.c = y.e = y.s = null;
                } else {
                    y.s *= x.s;

                    // Return ±Infinity if either is ±Infinity.
                    if ( !xc || !yc ) {
                        y.c = y.e = null;

                    // Return ±0 if either is ±0.
                    } else {
                        y.c = [0];
                        y.e = 0;
                    }
                }

                return y;
            }

            e = bitFloor( x.e / LOG_BASE ) + bitFloor( y.e / LOG_BASE );
            y.s *= x.s;
            xcL = xc.length;
            ycL = yc.length;

            // Ensure xc points to longer array and xcL to its length.
            if ( xcL < ycL ) zc = xc, xc = yc, yc = zc, i = xcL, xcL = ycL, ycL = i;

            // Initialise the result array with zeros.
            for ( i = xcL + ycL, zc = []; i--; zc.push(0) );

            base = BASE;
            sqrtBase = SQRT_BASE;

            for ( i = ycL; --i >= 0; ) {
                c = 0;
                ylo = yc[i] % sqrtBase;
                yhi = yc[i] / sqrtBase | 0;

                for ( k = xcL, j = i + k; j > i; ) {
                    xlo = xc[--k] % sqrtBase;
                    xhi = xc[k] / sqrtBase | 0;
                    m = yhi * xlo + xhi * ylo;
                    xlo = ylo * xlo + ( ( m % sqrtBase ) * sqrtBase ) + zc[j] + c;
                    c = ( xlo / base | 0 ) + ( m / sqrtBase | 0 ) + yhi * xhi;
                    zc[j--] = xlo % base;
                }

                zc[j] = c;
            }

            if (c) {
                ++e;
            } else {
                zc.shift();
            }

            return normalise( y, zc, e );
        };


        /*
         * Return a new BigNumber whose value is the value of this BigNumber rounded to a maximum of
         * sd significant digits using rounding mode rm, or ROUNDING_MODE if rm is omitted.
         *
         * [sd] {number} Significant digits. Integer, 1 to MAX inclusive.
         * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
         *
         * 'toDigits() precision out of range: {sd}'
         * 'toDigits() precision not an integer: {sd}'
         * 'toDigits() rounding mode not an integer: {rm}'
         * 'toDigits() rounding mode out of range: {rm}'
         */
        P.toDigits = function ( sd, rm ) {
            var n = new BigNumber(this);
            sd = sd == null || !isValidInt( sd, 1, MAX, 18, 'precision' ) ? null : sd | 0;
            rm = rm == null || !isValidInt( rm, 0, 8, 18, roundingMode ) ? ROUNDING_MODE : rm | 0;
            return sd ? round( n, sd, rm ) : n;
        };


        /*
         * Return a string representing the value of this BigNumber in exponential notation and
         * rounded using ROUNDING_MODE to dp fixed decimal places.
         *
         * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
         * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
         *
         * 'toExponential() decimal places not an integer: {dp}'
         * 'toExponential() decimal places out of range: {dp}'
         * 'toExponential() rounding mode not an integer: {rm}'
         * 'toExponential() rounding mode out of range: {rm}'
         */
        P.toExponential = function ( dp, rm ) {
            return format( this,
              dp != null && isValidInt( dp, 0, MAX, 19 ) ? ~~dp + 1 : null, rm, 19 );
        };


        /*
         * Return a string representing the value of this BigNumber in fixed-point notation rounding
         * to dp fixed decimal places using rounding mode rm, or ROUNDING_MODE if rm is omitted.
         *
         * Note: as with JavaScript's number type, (-0).toFixed(0) is '0',
         * but e.g. (-0.00001).toFixed(0) is '-0'.
         *
         * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
         * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
         *
         * 'toFixed() decimal places not an integer: {dp}'
         * 'toFixed() decimal places out of range: {dp}'
         * 'toFixed() rounding mode not an integer: {rm}'
         * 'toFixed() rounding mode out of range: {rm}'
         */
        P.toFixed = function ( dp, rm ) {
            return format( this, dp != null && isValidInt( dp, 0, MAX, 20 )
              ? ~~dp + this.e + 1 : null, rm, 20 );
        };


        /*
         * Return a string representing the value of this BigNumber in fixed-point notation rounded
         * using rm or ROUNDING_MODE to dp decimal places, and formatted according to the properties
         * of the FORMAT object (see BigNumber.config).
         *
         * FORMAT = {
         *      decimalSeparator : '.',
         *      groupSeparator : ',',
         *      groupSize : 3,
         *      secondaryGroupSize : 0,
         *      fractionGroupSeparator : '\xA0',    // non-breaking space
         *      fractionGroupSize : 0
         * };
         *
         * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
         * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
         *
         * 'toFormat() decimal places not an integer: {dp}'
         * 'toFormat() decimal places out of range: {dp}'
         * 'toFormat() rounding mode not an integer: {rm}'
         * 'toFormat() rounding mode out of range: {rm}'
         */
        P.toFormat = function ( dp, rm ) {
            var str = format( this, dp != null && isValidInt( dp, 0, MAX, 21 )
              ? ~~dp + this.e + 1 : null, rm, 21 );

            if ( this.c ) {
                var i,
                    arr = str.split('.'),
                    g1 = +FORMAT.groupSize,
                    g2 = +FORMAT.secondaryGroupSize,
                    groupSeparator = FORMAT.groupSeparator,
                    intPart = arr[0],
                    fractionPart = arr[1],
                    isNeg = this.s < 0,
                    intDigits = isNeg ? intPart.slice(1) : intPart,
                    len = intDigits.length;

                if (g2) i = g1, g1 = g2, g2 = i, len -= i;

                if ( g1 > 0 && len > 0 ) {
                    i = len % g1 || g1;
                    intPart = intDigits.substr( 0, i );

                    for ( ; i < len; i += g1 ) {
                        intPart += groupSeparator + intDigits.substr( i, g1 );
                    }

                    if ( g2 > 0 ) intPart += groupSeparator + intDigits.slice(i);
                    if (isNeg) intPart = '-' + intPart;
                }

                str = fractionPart
                  ? intPart + FORMAT.decimalSeparator + ( ( g2 = +FORMAT.fractionGroupSize )
                    ? fractionPart.replace( new RegExp( '\\d{' + g2 + '}\\B', 'g' ),
                      '$&' + FORMAT.fractionGroupSeparator )
                    : fractionPart )
                  : intPart;
            }

            return str;
        };


        /*
         * Return a string array representing the value of this BigNumber as a simple fraction with
         * an integer numerator and an integer denominator. The denominator will be a positive
         * non-zero value less than or equal to the specified maximum denominator. If a maximum
         * denominator is not specified, the denominator will be the lowest value necessary to
         * represent the number exactly.
         *
         * [md] {number|string|BigNumber} Integer >= 1 and < Infinity. The maximum denominator.
         *
         * 'toFraction() max denominator not an integer: {md}'
         * 'toFraction() max denominator out of range: {md}'
         */
        P.toFraction = function (md) {
            var arr, d0, d2, e, exp, n, n0, q, s,
                k = ERRORS,
                x = this,
                xc = x.c,
                d = new BigNumber(ONE),
                n1 = d0 = new BigNumber(ONE),
                d1 = n0 = new BigNumber(ONE);

            if ( md != null ) {
                ERRORS = false;
                n = new BigNumber(md);
                ERRORS = k;

                if ( !( k = n.isInt() ) || n.lt(ONE) ) {

                    if (ERRORS) {
                        raise( 22,
                          'max denominator ' + ( k ? 'out of range' : 'not an integer' ), md );
                    }

                    // ERRORS is false:
                    // If md is a finite non-integer >= 1, round it to an integer and use it.
                    md = !k && n.c && round( n, n.e + 1, 1 ).gte(ONE) ? n : null;
                }
            }

            if ( !xc ) return x.toString();
            s = coeffToString(xc);

            // Determine initial denominator.
            // d is a power of 10 and the minimum max denominator that specifies the value exactly.
            e = d.e = s.length - x.e - 1;
            d.c[0] = POWS_TEN[ ( exp = e % LOG_BASE ) < 0 ? LOG_BASE + exp : exp ];
            md = !md || n.cmp(d) > 0 ? ( e > 0 ? d : n1 ) : n;

            exp = MAX_EXP;
            MAX_EXP = 1 / 0;
            n = new BigNumber(s);

            // n0 = d1 = 0
            n0.c[0] = 0;

            for ( ; ; )  {
                q = div( n, d, 0, 1 );
                d2 = d0.plus( q.times(d1) );
                if ( d2.cmp(md) == 1 ) break;
                d0 = d1;
                d1 = d2;
                n1 = n0.plus( q.times( d2 = n1 ) );
                n0 = d2;
                d = n.minus( q.times( d2 = d ) );
                n = d2;
            }

            d2 = div( md.minus(d0), d1, 0, 1 );
            n0 = n0.plus( d2.times(n1) );
            d0 = d0.plus( d2.times(d1) );
            n0.s = n1.s = x.s;
            e *= 2;

            // Determine which fraction is closer to x, n0/d0 or n1/d1
            arr = div( n1, d1, e, ROUNDING_MODE ).minus(x).abs().cmp(
                  div( n0, d0, e, ROUNDING_MODE ).minus(x).abs() ) < 1
                    ? [ n1.toString(), d1.toString() ]
                    : [ n0.toString(), d0.toString() ];

            MAX_EXP = exp;
            return arr;
        };


        /*
         * Return the value of this BigNumber converted to a number primitive.
         */
        P.toNumber = function () {
            return +this;
        };


        /*
         * Return a BigNumber whose value is the value of this BigNumber raised to the power n.
         * If m is present, return the result modulo m.
         * If n is negative round according to DECIMAL_PLACES and ROUNDING_MODE.
         * If POW_PRECISION is non-zero and m is not present, round to POW_PRECISION using
         * ROUNDING_MODE.
         *
         * The modular power operation works efficiently when x, n, and m are positive integers,
         * otherwise it is equivalent to calculating x.toPower(n).modulo(m) (with POW_PRECISION 0).
         *
         * n {number} Integer, -MAX_SAFE_INTEGER to MAX_SAFE_INTEGER inclusive.
         * [m] {number|string|BigNumber} The modulus.
         *
         * 'pow() exponent not an integer: {n}'
         * 'pow() exponent out of range: {n}'
         *
         * Performs 54 loop iterations for n of 9007199254740991.
         */
        P.toPower = P.pow = function ( n, m ) {
            var k, y, z,
                i = mathfloor( n < 0 ? -n : +n ),
                x = this;

            if ( m != null ) {
                id = 23;
                m = new BigNumber(m);
            }

            // Pass ±Infinity to Math.pow if exponent is out of range.
            if ( !isValidInt( n, -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER, 23, 'exponent' ) &&
              ( !isFinite(n) || i > MAX_SAFE_INTEGER && ( n /= 0 ) ||
                parseFloat(n) != n && !( n = NaN ) ) || n == 0 ) {
                k = Math.pow( +x, n );
                return new BigNumber( m ? k % m : k );
            }

            if (m) {
                if ( n > 1 && x.gt(ONE) && x.isInt() && m.gt(ONE) && m.isInt() ) {
                    x = x.mod(m);
                } else {
                    z = m;

                    // Nullify m so only a single mod operation is performed at the end.
                    m = null;
                }
            } else if (POW_PRECISION) {

                // Truncating each coefficient array to a length of k after each multiplication
                // equates to truncating significant digits to POW_PRECISION + [28, 41],
                // i.e. there will be a minimum of 28 guard digits retained.
                // (Using + 1.5 would give [9, 21] guard digits.)
                k = mathceil( POW_PRECISION / LOG_BASE + 2 );
            }

            y = new BigNumber(ONE);

            for ( ; ; ) {
                if ( i % 2 ) {
                    y = y.times(x);
                    if ( !y.c ) break;
                    if (k) {
                        if ( y.c.length > k ) y.c.length = k;
                    } else if (m) {
                        y = y.mod(m);
                    }
                }

                i = mathfloor( i / 2 );
                if ( !i ) break;
                x = x.times(x);
                if (k) {
                    if ( x.c && x.c.length > k ) x.c.length = k;
                } else if (m) {
                    x = x.mod(m);
                }
            }

            if (m) return y;
            if ( n < 0 ) y = ONE.div(y);

            return z ? y.mod(z) : k ? round( y, POW_PRECISION, ROUNDING_MODE ) : y;
        };


        /*
         * Return a string representing the value of this BigNumber rounded to sd significant digits
         * using rounding mode rm or ROUNDING_MODE. If sd is less than the number of digits
         * necessary to represent the integer part of the value in fixed-point notation, then use
         * exponential notation.
         *
         * [sd] {number} Significant digits. Integer, 1 to MAX inclusive.
         * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
         *
         * 'toPrecision() precision not an integer: {sd}'
         * 'toPrecision() precision out of range: {sd}'
         * 'toPrecision() rounding mode not an integer: {rm}'
         * 'toPrecision() rounding mode out of range: {rm}'
         */
        P.toPrecision = function ( sd, rm ) {
            return format( this, sd != null && isValidInt( sd, 1, MAX, 24, 'precision' )
              ? sd | 0 : null, rm, 24 );
        };


        /*
         * Return a string representing the value of this BigNumber in base b, or base 10 if b is
         * omitted. If a base is specified, including base 10, round according to DECIMAL_PLACES and
         * ROUNDING_MODE. If a base is not specified, and this BigNumber has a positive exponent
         * that is equal to or greater than TO_EXP_POS, or a negative exponent equal to or less than
         * TO_EXP_NEG, return exponential notation.
         *
         * [b] {number} Integer, 2 to 64 inclusive.
         *
         * 'toString() base not an integer: {b}'
         * 'toString() base out of range: {b}'
         */
        P.toString = function (b) {
            var str,
                n = this,
                s = n.s,
                e = n.e;

            // Infinity or NaN?
            if ( e === null ) {

                if (s) {
                    str = 'Infinity';
                    if ( s < 0 ) str = '-' + str;
                } else {
                    str = 'NaN';
                }
            } else {
                str = coeffToString( n.c );

                if ( b == null || !isValidInt( b, 2, 64, 25, 'base' ) ) {
                    str = e <= TO_EXP_NEG || e >= TO_EXP_POS
                      ? toExponential( str, e )
                      : toFixedPoint( str, e );
                } else {
                    str = convertBase( toFixedPoint( str, e ), b | 0, 10, s );
                }

                if ( s < 0 && n.c[0] ) str = '-' + str;
            }

            return str;
        };


        /*
         * Return a new BigNumber whose value is the value of this BigNumber truncated to a whole
         * number.
         */
        P.truncated = P.trunc = function () {
            return round( new BigNumber(this), this.e + 1, 1 );
        };



        /*
         * Return as toString, but do not accept a base argument, and include the minus sign for
         * negative zero.
         */
        P.valueOf = P.toJSON = function () {
            var str,
                n = this,
                e = n.e;

            if ( e === null ) return n.toString();

            str = coeffToString( n.c );

            str = e <= TO_EXP_NEG || e >= TO_EXP_POS
                ? toExponential( str, e )
                : toFixedPoint( str, e );

            return n.s < 0 ? '-' + str : str;
        };


        // Aliases for BigDecimal methods.
        //P.add = P.plus;         // P.add included above
        //P.subtract = P.minus;   // P.sub included above
        //P.multiply = P.times;   // P.mul included above
        //P.divide = P.div;
        //P.remainder = P.mod;
        //P.compareTo = P.cmp;
        //P.negate = P.neg;


        if ( configObj != null ) BigNumber.config(configObj);

        return BigNumber;
    }


    // PRIVATE HELPER FUNCTIONS


    function bitFloor(n) {
        var i = n | 0;
        return n > 0 || n === i ? i : i - 1;
    }


    // Return a coefficient array as a string of base 10 digits.
    function coeffToString(a) {
        var s, z,
            i = 1,
            j = a.length,
            r = a[0] + '';

        for ( ; i < j; ) {
            s = a[i++] + '';
            z = LOG_BASE - s.length;
            for ( ; z--; s = '0' + s );
            r += s;
        }

        // Determine trailing zeros.
        for ( j = r.length; r.charCodeAt(--j) === 48; );
        return r.slice( 0, j + 1 || 1 );
    }


    // Compare the value of BigNumbers x and y.
    function compare( x, y ) {
        var a, b,
            xc = x.c,
            yc = y.c,
            i = x.s,
            j = y.s,
            k = x.e,
            l = y.e;

        // Either NaN?
        if ( !i || !j ) return null;

        a = xc && !xc[0];
        b = yc && !yc[0];

        // Either zero?
        if ( a || b ) return a ? b ? 0 : -j : i;

        // Signs differ?
        if ( i != j ) return i;

        a = i < 0;
        b = k == l;

        // Either Infinity?
        if ( !xc || !yc ) return b ? 0 : !xc ^ a ? 1 : -1;

        // Compare exponents.
        if ( !b ) return k > l ^ a ? 1 : -1;

        j = ( k = xc.length ) < ( l = yc.length ) ? k : l;

        // Compare digit by digit.
        for ( i = 0; i < j; i++ ) if ( xc[i] != yc[i] ) return xc[i] > yc[i] ^ a ? 1 : -1;

        // Compare lengths.
        return k == l ? 0 : k > l ^ a ? 1 : -1;
    }


    /*
     * Return true if n is a valid number in range, otherwise false.
     * Use for argument validation when ERRORS is false.
     * Note: parseInt('1e+1') == 1 but parseFloat('1e+1') == 10.
     */
    function intValidatorNoErrors( n, min, max ) {
        return ( n = truncate(n) ) >= min && n <= max;
    }


    function isArray(obj) {
        return Object.prototype.toString.call(obj) == '[object Array]';
    }


    /*
     * Convert string of baseIn to an array of numbers of baseOut.
     * Eg. convertBase('255', 10, 16) returns [15, 15].
     * Eg. convertBase('ff', 16, 10) returns [2, 5, 5].
     */
    function toBaseOut( str, baseIn, baseOut ) {
        var j,
            arr = [0],
            arrL,
            i = 0,
            len = str.length;

        for ( ; i < len; ) {
            for ( arrL = arr.length; arrL--; arr[arrL] *= baseIn );
            arr[ j = 0 ] += ALPHABET.indexOf( str.charAt( i++ ) );

            for ( ; j < arr.length; j++ ) {

                if ( arr[j] > baseOut - 1 ) {
                    if ( arr[j + 1] == null ) arr[j + 1] = 0;
                    arr[j + 1] += arr[j] / baseOut | 0;
                    arr[j] %= baseOut;
                }
            }
        }

        return arr.reverse();
    }


    function toExponential( str, e ) {
        return ( str.length > 1 ? str.charAt(0) + '.' + str.slice(1) : str ) +
          ( e < 0 ? 'e' : 'e+' ) + e;
    }


    function toFixedPoint( str, e ) {
        var len, z;

        // Negative exponent?
        if ( e < 0 ) {

            // Prepend zeros.
            for ( z = '0.'; ++e; z += '0' );
            str = z + str;

        // Positive exponent
        } else {
            len = str.length;

            // Append zeros.
            if ( ++e > len ) {
                for ( z = '0', e -= len; --e; z += '0' );
                str += z;
            } else if ( e < len ) {
                str = str.slice( 0, e ) + '.' + str.slice(e);
            }
        }

        return str;
    }


    function truncate(n) {
        n = parseFloat(n);
        return n < 0 ? mathceil(n) : mathfloor(n);
    }


    // EXPORT


   // AMD.
    if ( typeof define == 'function' && define.amd ) {
        define( function () { return constructorFactory(); } );

    // Node.js and other environments that support module.exports.
    } else if ( typeof module != 'undefined' && module.exports ) {
        module.exports = constructorFactory();

        // Split string stops browserify adding crypto shim.
        if ( !cryptoObj ) try { cryptoObj = require('cry' + 'pto'); } catch (e) {}

    // Browser.
    } else {
        if ( !globalObj ) globalObj = typeof self != 'undefined' ? self : Function('return this')();
        globalObj.BigNumber = constructorFactory();
    }
})(this);

},{}]},{},[1]);
