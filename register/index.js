// sadly:
// const {match, when} = require('..');
// does not work with node v5.3.0 and I don't want a compile step.
global.match = require('..').match;
global.when = require('..').when;
