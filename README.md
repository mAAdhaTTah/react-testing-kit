# react-testing-kit

[![Actions Status](https://github.com/mAAdhaTTah/react-testing-kit/workflows/Run tests/badge.svg)](https://github.com/mAAdhaTTah/react-testing-kit/actions)


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
import { createRender } from 'react-testing-library';
import { render, fireEvent, waitForElement, waitForElementToBeRemoved } '@testing-library/react';
```

Create your reusable render function.

```js
const renderComponent = createRender({
  defaultProps: {
    // ...
  },
  component: TestComponent,
  render,
  elements: queries => ({
    button: () => queries.getByTestId('button')
  }),
  fire: elements => ({
    buttonClick: () => fireEvent.click(elements.button())
  }),
  waitFor: elements => ({
    button: () => waitForElement(elements.button),
    buttonToBeRemoved: () => waitForElementToBeRemoved(elements.button)
  })
});
```

Create an instance of the component. You can override any default props by passing in those values.

```js
const { container, elements, fire, waitFor } = renderComponent({
  // ...
});
```

Test the component instance.

```js
const button = elements.button();
fire.buttonClick();
await waitFor.button();
await waitFor.buttonToBeRemoved();
expect(container).toMatchSnapshot();
```

## How It Works

The created `renderComponent` function will render the component with the provided render function and return it composed with the provided functions.

`elements` is called with the return of `render`, enabling the creation of functions to fetch particular elements in the component. These `elements` are then passed to `fire` & `waitFor`, allowing those elements to be bound to particular interactions.

This encourages a test API that's consistent, making complex tests more readable by providing named functions instead of a complex binding between RTL's queries & `fireEvent`. It also removes the ability to write custom queries & events in your tests, ensuring the bare minimum amount of logic is in your tests.


## API

### `createRender` - `(config: RenderConfig) => RenderFunction`

Create a render function for use in a test. `config` takes these properties:

* `defaultProps`: The properties the component should be rendered with by default.
* `component`: The component to test.
* `render`: The render function to create an instance.
* `elements`: Function to create the component elements.
* `fire`: Function to create the component events.
* `waitFor`: Function to create async events.

The `RenderFunction` accepts any component property overrides. The returned instance has these properties:

* `container`, `baseElement`, `debug`, `rerender`, `unmount`, `asFragment`: API from RTL.
* `elements`, `fire`, `waitFor`: Result of calling above functions.
