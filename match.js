'use strict';

const _catchAllSymbol = Symbol('match.pattern.catchAll');
const _patternOR = Symbol('match.pattern.OR');
const _patternORStr = _patternOR.toString(); // dirty hack
const _patternAND = Symbol('match.pattern.AND');
const _patternANDStr = _patternAND.toString(); // dirty hack

function MissingCatchAllPattern() {
  Error.call(this, 'Missing when() catch-all pattern as last match argument, add [when()]: void 0');
  if (!('stack' in this)){
    this.stack = (new Error).stack;
  }
}

MissingCatchAllPattern.prototype = Object.create(Error.prototype);

function match(obj){
  // pre-compute matchers
  let matchers = [];

  for(let key in obj){
    matchers.push(when.unserialize(key, obj[key]));
  }

  if(Object.getOwnPropertySymbols(obj).indexOf(_catchAllSymbol) === -1){
    throw new MissingCatchAllPattern();
  }

  // add catch-all pattern at the end
  matchers.push(when.unserialize(_catchAllSymbol, obj[_catchAllSymbol]));

  return function(input){
    for (let i = 0, iM = matchers.length; i < iM; i++) { // old school #perf
      const matcher = matchers[i];
      if(matcher.match(input)){
        return typeof matcher.call === 'function' ? matcher.call(input): matcher.call;
      }
    }
  };

}

function when(props){
  if(props === undefined){
    return _catchAllSymbol;
  }

  return JSON.stringify(props);
}

function _true(){return true;}

// mixed -> String
function _match(props){

  if(Array.isArray(props)){
    if(props[0] === _patternORStr){
      props.shift();
      return function(input){
        return props[0].some((prop) => _matching(prop, input));
      };
    }

    if(props[0] === _patternANDStr){
      props.shift();
      return function(input){
        return props[0].every((prop) => _matching(prop, input));
      };
    }
  }

  function _matching(props, input){
    // implement array matching
    if(Array.isArray(input)){
      // @todo yes this is a quick and dirty way, optimize this
      return JSON.stringify(props) === JSON.stringify(input);
    }

    if(typeof input === 'object'){
      for(let prop in props){
        if(input[prop] !== props[prop]){
          return false;
        }
      }
      return true;
    }

    return props === input;
  }

  return (input) => _matching(props, input);
}

// mixed -> String
when.or = function(/* args... */){
  return JSON.stringify([_patternOR.toString(), Array.prototype.slice.call(arguments)]);
};

// mixed -> String
// upcoming...
when.and = function(/* args... */){
  return JSON.stringify([_patternAND.toString(), Array.prototype.slice.call(arguments)]);
};

when.unserialize = function(props, value){
  return {
    match: props === _catchAllSymbol ? _true : _match(JSON.parse(props)),
    call: value
  };
}

module.exports = {
  match,
  when
};
