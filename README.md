### match-when - Pattern matching for modern JavaScript



Adding pattern matching to JavaScript (ES6+) through two new special *keywords*\* `match` and `when`. The main goals are **safety** and **shortness**.
There is a lot more to do but after some late work, that's all for tonight!

#### Usage

The setup is pretty simple, simply require the library with `match` and `when` and you are ready to go!

```js
const {match, when} = require('match-when');
```

or globally

```js
require('match-when/register'); // `match` and `when` are now globally available
```

Now let's see how we would write a factorial function:

```js
function fact(n){
  return match({
    [when(0)]: 1,
    [when()]: (n) => n * fact(n-1)
  })(n);
}

fact(10); // 3628800
```

Clear and simple, note that `when()` is a catch-all pattern and should always be the last condition. If you forget, `match()` will throw a `MissingCatchAllPattern` exception.

`match` works well with .map (and others) too:

```js
[2, 4, 1, 2].map(match({
  [when(1)]: "one",
  [when(2)]: "two",
  [when()]: "many"
}));

// [ 'two', 'many', 'one', 'two' ]
```

##### Arrays


It also works with **arrays**:

```js
function length(list){
  return match({
    [when([])]: 0,
    [when()]: ([head, ...tail]) => 1 + length(tail)
  })(list);
}

length([1, 1, 1]); // 3
```

##### OR

Sadly JavaScript does not offer us a way to overload operators so we're stuck with `when.or`:

```js
function parseArgument(arg){
  return match({
    [when.or("-h", "--help")]: () => displayHelp,
    [when.or("-v", "--version")]: () => displayVersion,
    [when()]: (whatever) => unknownArgument.bind(null, whatever)
  })(arg);
}

parseArgument(process.argv.slice(1)); // displayHelp || displayVersion || (binded)unknownArgument
```

##### AND



#### Supported patterns:

- `{ x1: pattern1, ..., xn: pattern }` - matches any object with property names `x1` to `xn` matching patterns `pattern1` to `pattern`, respectively. Only the own properties of the pattern are used.
- `when.or()`

\* *well, of course, they are not keywords but simple functions*
