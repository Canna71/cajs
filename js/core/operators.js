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

