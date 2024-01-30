# Siero Worker

A managed worker that can be interacted with via [Siero](https://github.com/fabiospampinato/siero).

This package creates a worker designed to receive some APIs and then execute untrusted plugins, but it could be used in various different ways.

## Install

```sh
npm install --save siero-worker
```

## Usage

```ts
import SieroWorker from 'siero-worker';

// Let's create a new worker

const worker = new SieroWorker ();

// Let's pass it a value and register it on the global scope

const MyApp = {
  sum: ( a, b ) => {
    return a + b;
  },
  multiply: ( a, b ) => {
    return a * b;
  }
};

worker.global ( 'MyApp', MyApp );

// Let's now pass it some code to evaluate inside the worker
// For convenience here we are using a simple serializable function
// In real scenarios the code that you may want to evaluate in the worker would probably be bundled

const plugin = async () => {
  const sumResult = await MyApp.sum ( 2, 3 ); // => 5
  const multiplyResult = await MyApp.multiply ( 2, 3 ); // => 6
};

worker.eval ( `(${plugin.toString ()})()` );

// Let's now terminate the worker

worker.terminate ();
```

## License

MIT © Fabio Spampinato
