'use strict';
const when = require('./match').when;
const match = require('./match').match;

// var match = require('./');
const t = require('chai').assert;

describe('when multiple values can be hit', () => {
  it("doesn't hit the first one",  () => {
    t.strictEqual(match({
      [when.range(0, 43)]: 42,
      [when(42)]: 72,
      [when()]: 'never should be hit',
    })(42), 42);
  });
});

describe('match', () => {
  const input = [{protocol: 'HTTP', i:10}, {protocol: 'AMQP', i:11}, {protocol: 'AMQP', i:5}, {protocol: 'WAT', i:3}];

  it('should throw if a catch-all pattern was not specified', () => {
    t.throws(() => input.map(match({
      [when({protocol:'HTTP'})]: (o) => o.i+1,
      [when({protocol:'AMQP'})]: (o) => o.i+2,
    })));
  });

  describe('match(<input>, specification)', () => {
    it('instantly performs the match, rather than returning a function', function () {
      t.strictEqual(
        match('value', {
          [when('value')]: 42,
          [when()]: 99
        }),
        42
      );
    });

    describe('the example in the docs', function () {
      it('works correctly', function () {
        function fact(n){
          return match(n, {
            [when(0)]: 1,
            [when()]: (n) => n * fact(n-1)
          });
        }

        t.deepEqual(fact(10), 3628800);
      });
    });
  });

  describe('matching', () => {
    it('should match objects based on properties', () => {
      const output = input.map(match({
        [when({protocol:'HTTP', i:12})]: (o) => 1000,
        [when({protocol:'HTTP'})]: (o) => o.i+1,
        [when({protocol:'AMQP', i:12})]: (o) => 1001,
        [when({protocol:'AMQP'})]: (o) => o.i+2,
        [when()]: (o) => 0,
      }));

      t.deepEqual(output, [11, 13, 7, 0]);
    });


    it('should match arrays based on indexes and content', () => {
      const output = [['a', 'b'], ['c'], ['d', 'e', 1]].map(match({
        [when(['c'])]: 1000,
        [when(['a', 'b'])]: 1001,
        [when([])]: 1002,
        [when(['d', 'e', 1])]: 1003,
        [when()]: (o) => 0
      }));

      t.deepEqual(output, [1001, 1000, 1003]);
    });

    it('should match number as well', () => {
      function fact(n){
        return match({
          [when(0)]: 1,
          [when()]: (n) => n * fact(n-1) // when() === catch-all
        })(n);
      }

      t.strictEqual(fact(10),3628800);
    });

    it('should match empty array', () => {
      function length(list){
        return match({
          [when([])]: 0,
          // [when()]: ([head, ...tail]) => 1 + length(tail) // still does not work in v5.3.0
          [when()]: (arr) => 1 + length(arr.slice(1))
        })(list);
      }

      t.strictEqual(length([1, 2, 3]), 3);
      t.strictEqual(length([{}, {}, {}, {}]), 4);
    });

    it('should support regexp match', () => {
      const output = [3, ' 2', 1, 'zEro', 90].map(match({
        [when(/1/)]: 'one',
        [when(/2/g)]: 'two',
        [when(/3/)]: 'three',
        [when(/zero/i)]: 'zero',
        [when()]: v => v
      }));

      t.deepEqual(output, ['three', 'two', 'one', 'zero', 90]);

      const invalidEmails = ['hey.com', 'fg@plop.com', 'fg+plop@plop.com', 'wat'].filter(match({
        [when(/\S+@\S+\.\S+/)]: false, // **seems** to be a valid email
        [when()]: true // the email may be invalid, return it
      }));

      t.deepEqual(invalidEmails, ['hey.com', 'wat']);
    })

    describe('when.and', () => {
      it('should support AND conditional', () => {
        const output = input.map(match({
          [when.and({protocol:'AMQP'}, {i:5})]: o => o.i,
          [when.and({protocol:'HTTP'}, {i:10})]: o => o.i,
          [when()]: (o) => 0,
        }));

        t.deepEqual(output, [10, 0, 5, 0]);
      })
    });

    describe('when.or', () => {
      it('should support OR conditional matching', () => {
        // example from https://kerflyn.wordpress.com/2011/02/14/playing-with-scalas-pattern-matching/

        function parseArgument(arg){
          return match({
            [when.or("-h", "--help")]: () => displayHelp,
            [when.or("-v", "--version")]: () => displayVersion,
            [when()]: (whatever) => unknownArgument.bind(null, whatever)
          })(arg);
        }

        function displayHelp(){
          console.log('help.');
        }

        function displayVersion(){
          console.log('v0.0.0');
        }

        function unknownArgument(whatever){
          throw new Error(`command ${whatever} not found`);
        }

        t.strictEqual(parseArgument('-h'), displayHelp);
        t.strictEqual(parseArgument('--help'), displayHelp);
        t.strictEqual(parseArgument('-v'), displayVersion);
        t.strictEqual(parseArgument('--version'), displayVersion);
        t.throws(() => {
          parseArgument('hey')();
        });
      });
    })
  });

  describe('when.range', () => {
    const rangeStart = 0,
      rangeEnd = 5;

    beforeEach(function () {
      this.withinRange = match({
        [when.range(rangeStart, rangeEnd)]: true,
        [when()]: false
      });
    });

    describe('given a value within the range', function () {
      it('should match', function () {
        t.isTrue(this.withinRange(rangeStart+1));
      });
    });

    describe('given a value at the lower bound', function () {
      it('should match', function () {
        t.isTrue(this.withinRange(rangeStart));
      });
    });

    describe('given a value at the upper bound', function () {
      it('should match', function () {
        t.isTrue(this.withinRange(rangeEnd));
      });
    });

    describe('given a value above the upper bound', function () {
      it('should not match', function () {
        t.isFalse(this.withinRange(rangeEnd+1));
      });
    });

    describe('given a value below the lower bound', function () {
      it('should not match', function () {
        t.isFalse(this.withinRange(rangeStart-1));
      });
    });

    describe('the example in the docs', function () {
      it('works correctly', function () {
        var result = [12, 42, 99, 101].map(match({
          [when.range(0, 41)]: '< answer',
          [when.range(43, 100)]: '> answer',
          [when(42)]: 'answer',
          [when()]: '< 0, or > 100'
        }));

        var expected = ['< answer', 'answer', '> answer', '< 0, or > 100']

        t.deepEqual(result, expected);
      });
    });

  });

  describe('yielding', () => {
    it('should also be able to yield primitive values', () => {
      const output = input.map(match({
        [when({protocol:'HTTP'})]: 1,
        [when({protocol:'AMQP'})]: 2,
        [when()]: 0,
      }));

      t.deepEqual(output, [1, 2, 2, 0]);
    });
  });
});
