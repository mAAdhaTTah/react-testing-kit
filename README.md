# react-testing-kit

[![Actions Status](https://github.com/mAAdhaTTah/react-testing-kit/workflows/Run%20tests/badge.svg)](https://github.com/mAAdhaTTah/react-testing-kit/actions)

A testing library to enable reusable, readable logic in your unit tests.

## How to Use

Install `react-testing-kit`:

```bash
npm i -D react-testing-kit
# or with yarn
yarn --dev react-testing-kit
```

Import it into your tests:

```js
import { Kit } from 'react-testing-kit';
import { render, fireEvent, waitFor, waitForElementToBeRemoved } '@testing-library/react';
```

Create your test kit.

```js
const kit = Kit.create(render, MyComponent, () => ({
  // Default props
}))
  .setElements(queries => ({
    button: () => queries.getByTestId('button'),
  }))
  .setFire(elements => ({
    buttonClick: () => fireEvent.click(elements.button()),
  }))
  .setAsync(elements => ({
    buttonToBeRemoved: () => waitForElementToBeRemoved(elements.button),
  }));
```

Create an instance of the kit. You can override any default props by passing in those values.

```js
const run = kit.run({
  // ... overridden props
});
```

Test the component instance.

```js
const button = run.elements.button();
run.fire.buttonClick();
await run.waitFor.button();
await run.waitFor.buttonToBeRemoved();
expect(run.queries.container).toMatchSnapshot();
```

## How It Works

The created `kit` ties together the component to a reusable set of a functions that can be shared across test runs. This instance is typesafe, enabling a structure for interacting with a rendered components.

`elements` is called with the return of `render`, enabling the creation of functions to fetch particular elements in the component. These `elements` are then passed to `fire` & `waitFor`, allowing those elements to be bound to particular interactions.

This encourages a test API that's consistent, making complex tests more readable by providing named functions instead of a complex binding between RTL's queries & `fireEvent`. It also limits the ability to write custom queries & events in your tests, ensuring simple, readable logic in your tests.

## API

### `Kit`

Base class that provides the structure for a test kit. The basic API is as follows:

#### `Kit#create`

Static method to create a new test kit. Accepts a custom render function, the component under test, and a function to generate default props for the component.

```ts
let kit = Kit.create(render, TestComponent, () => ({}));
```

#### `kit.setElements`

Set the function that will create the `elements` property on the `RunInstance`. It will receive the return value of the `render` function and should return an object with methods to query interesting elements in your component. It will return a new `kit` instance, allowing you to fluently build up your testing kit in a typesafe way.

```ts
kit = kit.setElements(queries => ({
  button: () => queries.getByLabelText('Click me'),
}));
```

#### `kit.setFire`

Set the function that will create the `fire` property on the `RunInstance`. It will receive the return value of the `setElements` function and should return an object with methods to fire interesting events on the elements in your component. It will return a new `kit` instance, allowing you to fluently build up your testing kit in a typesafe way.

```ts
kit = kit.setFire(elements => ({
  buttonClick: () => fireEvent.click(elements.button()),
}));
```

#### `kit.setAsync`

Set the function that will create the `waitFor` property on the `RunInstance`. It will receive the return value of the `setElements` function and should return an object with methods to fire interesting events on the elements in your component. It will return a new `kit` instance, allowing you to fluently build up your testing kit in a typesafe way.

```ts
kit = kit.setAsync(elements => ({
  buttonToBeRemoved: () => waitForElementToBeRemoved(elements.button),
}));
```

#### `kit.run`

Run the test kit and create a new RunInstance. Accepts an object of props to override from the default props. This RunInstance will have the following properties:

- `props` - The result of combining the component props & its overrides.
- `queries` - The result of the provided `render` function.
- `elements` - The result of the function provided to `setElements`.
- `fire` - The result of the function provided to `setFire`.
- `waitFor` - The result of the function provided to `setAsync`.

```ts
const run = kit.run({
  // ... override props
});
```
