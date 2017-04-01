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
