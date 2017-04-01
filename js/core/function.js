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