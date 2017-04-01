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
