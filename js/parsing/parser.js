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