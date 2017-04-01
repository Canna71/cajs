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
