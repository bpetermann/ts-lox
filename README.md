# TypeScript Lox

My TypeScript implementation of an interpreter for the Lox programming language, based on the fantastic book [Crafting Interpreters](https://craftinginterpreters.com/). I have tried to stick closely to the original code, i.e., to implement the Java code in TypeScript, including classes, visitor pattern, and so on.

## ⚙️ Installation

To get started, clone the repository:

```bash
git clone https://github.com/bpetermann/ts-lox.git
cd ts-lox
```

Then, install dependencies and build the project:

```js
npm run build:fresh // Installs dependencies and builds the project
```

## 🚀 Start

Finally, start the REPL (Read-Eval-Print Loop):

```js
npm run start // Starts the REPL
```

or pass a .lox file as an argument

```js
npm run start <filename>.lox
```

## 📋 Usage Examples

```js
>> fun fib(n) {
  if (n < 2) return n;
  return fib(n - 1) + fib(n - 2);
}
>> fib(30);
```

## 🧪 Tests

The following command executes all Jest test suites. At the moment, there are not so many tests; the ones included are mostly code snippets from the book. I will expand this.

```js
npm run test
```

## Performance

The following command executes the benchmark test contained in the book, the recursive Fibonacci function from above with the input of 40... ugh, it takes long, like really, really long... like not even comparable to the Java implementation in the book.
Making this implementation more efficient is also a future task.

```js
npm run benchmark
```
