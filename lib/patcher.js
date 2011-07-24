var _trace0=_enterModule('patcher.js');try {var nc = require('narcissus_packed');

var FUNCTION   = nc.definitions.tokens['function'];
var BODY_OPEN  = nc.definitions.tokens['{'];
var BODY_CLOSE = nc.definitions.tokens['}'];
var ARGS_OPEN  = nc.definitions.tokens['('];
var ARGS_CLOSE = nc.definitions.tokens[')'];
var IDENTIFIER = nc.definitions.tokens['IDENTIFIER'];
var NEWLINE    = nc.definitions.tokens['\n'];
var COMMA      = nc.definitions.tokens[','];
var END      = nc.definitions.tokens['END'];

module.exports = {
  patch: perform
};

function perform(code, name) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var tokens = tokenize(code);
  var funcs = findFunctions(tokens);
  return patch(code, funcs, name);
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}}

function tokenize(str) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var tokenizer = new nc.lexer.Tokenizer(str);
  var tokens = [];
  var wantOperand = true;
  var notWantOperand = [")","IDENTIFIER","NUMBER","STRING","REGEXP"];
  for (var i=0; i<notWantOperand.length; i++) notWantOperand[i] = nc.definitions.tokens[notWantOperand[i]];
  while (true) {
    var type = tokenizer.get(wantOperand);
    if (type === END) break;
    if (type === NEWLINE) continue;
    var token = tokenizer.token;
    token = {type: type, start: token.start};
    tokens.push(token);
    wantOperand = notWantOperand.indexOf(type) === -1;
  }
  return tokens;
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}}

//FIXME what about setter and getter syntax?
function findFunctions(tokens) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var possibleStart = null;
  var stack = [];
  var functions = [];
  var braceLevel = 0;
  for (var i=0; i<tokens.length; i++) {
    //console.log(tokens[i].type);
    // function [name] (
    var namedFunc = i>=2 && tokens[i-2].type === FUNCTION && tokens[i-1].type === IDENTIFIER;
    var unnamedFunc = i>=1 && tokens[i-1].type === FUNCTION;
    //if (unnamedFunc) console.log("unnamed func");
    //console.log(tokens[i].type);
    if ((namedFunc||unnamedFunc) && tokens[i].type === ARGS_OPEN) {
      possibleStart = i;
      //console.log("possible start");
    }
    
    // ) {
    if (i+1<tokens.length && tokens[i].type === ARGS_CLOSE && tokens[i+1].type === BODY_OPEN && possibleStart != null) {
      possibleStart = null;
      var funcData = {start: tokens[i+1].start, outerBraceLevel: braceLevel};
      stack.push(funcData);
      functions.push(funcData);
      //console.log("start");
    }
    
    if (tokens[i].type === BODY_OPEN) braceLevel++;
    if (tokens[i].type === BODY_CLOSE) {
      braceLevel--;
      if (stack.length !== 0) {
        if (braceLevel === stack[stack.length-1].outerBraceLevel) {
          var func = stack.pop();
          func.end = tokens[i].start;
          func.level = stack.length;
        }
      }
    }
    
    if (possibleStart != null && possibleStart != i && tokens[i].type !== COMMA && tokens[i].type !== IDENTIFIER) {
      possibleStart = null;
      //console.log("destroy");
    }
  }
  return functions;
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}}

function patch(code, functions, name) {var _trace1=_enterFunction(_trace0, this);try {if (this&&!this._trace) {this._trace=_trace1;}
  var patches = [];
  for (var i=0; i<functions.length; i++) {
    var func = functions[i];
    //+1 because of the module wrapper
    var l = func.level+1;
    var sl = l-1;
    var setThis = "if (this&&!this._trace) {this._trace=_trace"+l+";}";
    var startCode;
    if (sl >= 0) startCode = "var _trace"+l+"=_enterFunction(_trace"+sl+", this);try {"+setThis;
    else startCode = "var _trace"+l+"=_enterFunction(null, this);try {"+setThis;
    patches.push({insertBefore: func.start+1, code: startCode, end: false});
    var endCode = "} catch (_err) { throw _enhanceError(_err, _trace"+l+"); } finally {_leaveFunction(_trace"+l+");}";
    patches.push({insertBefore: func.end, code: endCode, end: true});
  }
  patches.sort(function(a, b) {var _trace2=_enterFunction(_trace1, this);try {if (this&&!this._trace) {this._trace=_trace2;}return (a.insertBefore+a.end*0.5)-(b.insertBefore+b.end*0.5);} catch (_err) { throw _enhanceError(_err, _trace2); } finally {_leaveFunction(_trace2);}});
  //console.log(patches.length+" patches prepared");
  
  var offset = 0;
  for (i=0; i<patches.length; i++) {
    var patch = patches[i];
    var insertPosition = patch.insertBefore + offset;
    //console.log("patch insert position: "+patch.insertBefore);
    code = code.substring(0, insertPosition) + patch.code + code.substring(insertPosition);
    offset += patch.code.length;
  }
  var moduleStartCode = "var _trace0=_enterModule('"+name+"');try {";
  var moduleEndCode = "} catch (_err) { throw _enhanceError(_err, _trace0); } finally {_leaveFunction(_trace0);}";
  return moduleStartCode+code+moduleEndCode;
} catch (_err) { throw _enhanceError(_err, _trace1); } finally {_leaveFunction(_trace1);}}

/*(function() {
  var code =   "function foo() {"
           + "\n  var cb;"
           + "\n  function bar() {"
           + "\n    function baz() {"
           + "\n      throw new Error('Test');"
           + "\n    }"
           + "\n    cb = baz;"
           + "\n  }"
           + "\n  bar();"
           + "\n  cb();"
           + "\n}";
  var tokens = tokenize(code);
  var funcs = findFunctions(tokens);
  console.log("==========================\n"+code+"\n==========================");
  code = patch(code, funcs);
  console.log("==========================\n"+code);
})();*/
} catch (_err) { throw _enhanceError(_err, _trace0); } finally {_leaveFunction(_trace0);}