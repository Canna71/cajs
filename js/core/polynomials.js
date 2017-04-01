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