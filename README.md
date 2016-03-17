### match-when - Pattern matching for modern JavaScript 



[![Circle CI](https://img.shields.io/circleci/project/FGRibreau/match-when/master.svg?style=flat)](https://circleci.com/gh/FGRibreau/match-when/tree/master) ![deps](https://img.shields.io/david/fgribreau/match-when.svg?style=flat) ![Version](https://img.shields.io/npm/v/match-when.svg?style=flat) ![extra](https://img.shields.io/badge/actively%20maintained-yes-ff69b4.svg?style=flat) [![Twitter Follow](https://img.shields.io/twitter/follow/fgribreau.svg?style=flat)](https://twitter.com/FGRibreau)

<!-- [![Downloads](http://img.shields.io/npm/dm/match-when.svg)](https://www.npmjs.com/package/match-when)
![NPM](https://nodei.co/npm/match-when.png?downloadRank=true) ![NPM](https://nodei.co/npm-dl/match-when.png?months=3&height=2)
-->

> Finally a **clear**, **succinct** and *safe* syntax to do Pattern Matching in modern JavaScript. [(backstory)](http://blog.fgribreau.com/2015/12/match-when-pattern-matching-for-modern.html)


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
const fact = match({
  [when(0)]: 1,
  [when()]: (n) => n * fact(n-1)
});

fact(10); // 3628800
```

Clear and simple right?

Alternatively, `match(<input>, patternSpecification)` can be used to instantly perform a match:

```js
function fact(n){
  return match(n, {
    [when(0)]: 1,
    [when()]: (n) => n * fact(n-1)
  });
}

fact(10); // 3628800
```

<p align="center">
<img style="width:100%" src="https://cloud.githubusercontent.com/assets/138050/12031158/0e37afda-ae09-11e5-9462-873b45cbb2b4.gif">
</p>

Note that `when()` is a catch-all pattern and, if used, should always be the last condition. If you forget it `match()` will throw a `MissingCatchAllPattern` exception if nothing was matched.

##### Setup

```
npm i match-when -S
```

##### High Order Functions

`match` works well with high order functions like `map`, `filter` (and so on) too:

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

```js
const protocols = repositories.map(match({
  [when.and({useGit:true}, {useSSH: true})]: 'git+ssh:',
  [when.and({useGit:true}, {useHTTP: true})]: 'git+http:',
  [when.and({useGit:true}, {useHTTPS: true})]: 'git+https:',
  [when()]: 'unsupported:'
}))
```

##### Regular Expressions

match-when supports [regular expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp) as well:

```js
['hey.com', 'fg@plop.com', 'fg+plop@plop.com', 'wat'].filter(match({
  [when(/\S+@\S+\.\S+/)]: false, // **seems** to be a valid email (unsafe regex for doc purpose only)
  [when()]: true // the email could be invalid, return it
}));

// ['hey.com', 'wat']
```

##### Range

```js
[12, 42, 99, 101].map(match({
  [when.range(0, 41)]: '< answer',
  [when.range(43, 100)]: '> answer',
  [when(42)]: 'answer',
  [when()]: '< 0, or > 100'
}));

// ['< answer', 'answer', '> answer', '< 0, or > 100']
```

### Supported patterns:


- `{ x1: pattern1, ..., xn: patternn }` - matches any object with property names `x1` to `xn` matching patterns `pattern1` to `patternn`, respectively. Only the own properties of the pattern are used.
- `[pattern0, ..., patternn]` - matches any object with property names 0 to n matching patterns `pattern0` to `patternn`, respectively.
- `/pattern/flags` - matches any values than pass the regular expression test
- `when.range(low, high)` matches any number value in the range [low, high], `low` and `high` included.
- `when.or(pattern0, ..., patternn)` - matches if at [least one](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some) `pattern` matches.
- `when.and(pattern0, ..., patternn)` - matches if [every](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every) `pattern` matches.

### Todo:

I will accept PR with their associated tests for the following features:


- define and implement some syntax to support wildcards

[todo-list inspired by pattern-match from dherman](https://github.com/dherman/pattern-match#patterns).

\* *well, of course, they are not keywords but simple functions*

#### Why/How? - the slides

<a href="http://fr.slideshare.net/FGRibreau/implementing-patternmatching-in-javascript-full-version"><p align="center"><img align="center" width="623" alt="capture d ecran 2016-03-17 23 35 44" src="https://cloud.githubusercontent.com/assets/138050/13863273/02044aba-ec99-11e5-8253-ebae7ee39c08.png">
</p></a>

#### Why/how? - the talk in **french (sorry)**

<a href="https://youtu.be/B1QltudEeds"><p align="center"><img align="center" width="852" alt="capture d ecran 2016-03-17 23 35 44" src="https://cloud.githubusercontent.com/assets/138050/13863627/66eedc9a-ec9b-11e5-89e3-5f2a5fc11f54.png">
</p></a>

## Development sponsored by iAdvize

<p align="center">
<a target="_blank" href="https://vimeo.com/121470910"><img style="width:100%" src="https://i.vimeocdn.com/video/509763980.png?mw=638&mh=1080&q=70"></a>
</p>

I work at [iAdvize](http://iadvize.com) as a Lead Developer and Architect. iAdvize is the **leading real-time customer engagement platform in Europe** and is used in 40 different countries. We are one of the french startup with the [fastest growth](http://www.iadvize.com/fr/wp-content/uploads/sites/2/2014/11/CP-Fast-50.pdf) and one of [the **greatest place to work** in **France**](https://vimeo.com/122438055).

We are looking for a [**NodeJS backend developer**](http://smrtr.io/FqP79g), a [Scala backend developer](http://smrtr.io/FqP79g), a [**JavaScript frontend developer**](http://smrtr.io/wR-y4Q), a [Full-stack Developer](http://smrtr.io/SGhrew) and a [DevOps System Engineer](http://smrtr.io/OIFFMQ) in Paris or Nantes. **[Send me a tweet](https://twitter.com/FGRibreau) if you have any questions**!

## [The Story](http://blog.fgribreau.com/2015/12/match-when-pattern-matching-for-modern.html)

## [Changelog](/CHANGELOG.md)
