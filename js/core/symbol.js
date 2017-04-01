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

