import React from 'react';
import {
  render,
  fireEvent,
  waitForElement,
  waitForElementToBeRemoved,
  RenderResult,
} from '@testing-library/react';
import { createRender } from './react-testing-kit';

const TestComponent: React.FC<{
  icon?: string;
  text: string;
  onClick: () => void;
}> = ({ icon = null, text, onClick }) => (
  <button data-testid="button" onClick={onClick}>
    {icon && <span data-testid="icon">{icon}</span>}
    {text}
  </button>
);

const renderComponent = createRender({
  defaultProps: { text: 'hello', onClick: jest.fn() },
  component: TestComponent,
  render,
  // @TODO(mAAdhaTTah) required to get inference working - why?
  elements: (queries: RenderResult) => ({
    button: () => queries.getByTestId('button') as HTMLButtonElement,
    icon: () => queries.getByTestId('icon') as HTMLSpanElement,
  }),
  fire: elements => ({
    buttonClick: () => fireEvent.click(elements.button()),
  }),
  waitFor: elements => ({
    icon: () => waitForElement(elements.icon),
    iconToBeRemoved: () => waitForElementToBeRemoved(elements.icon),
  }),
});

test('it passes the default props to the component', () => {
  const instance = renderComponent();

  expect(instance.container.textContent).toEqual('hello');
});

test('it passes overriden props to the component', () => {
  const instance = renderComponent({
    text: 'world',
  });

  expect(instance.container.textContent).toEqual('world');
});

test('it returns the element queries', () => {
  const instance = renderComponent();
  const button = instance.elements.button();

  expect(button.getAttribute('data-testid')).toEqual('button');
});

test('it returns the event fires', () => {
  const instance = renderComponent();

  instance.fire.buttonClick();

  expect(instance.props.onClick).toHaveBeenCalledTimes(1);
});

test('it returns the async waits', async () => {
  const instance = renderComponent();
  const waitFor = instance.waitFor.icon();
  instance.rerender(<TestComponent {...instance.props} icon="👍" />);
  const icon = await waitFor;

  expect(icon.getAttribute('data-testid')).toEqual('icon');

  const waitForRemoved = instance.waitFor.iconToBeRemoved();
  instance.rerender(<TestComponent {...instance.props} />);

  await expect(waitForRemoved).resolves.toEqual(true);
});

test('it accepts a function for props', () => {
  const renderComponent = createRender({
    // @TODO(mAAdhaTTah) why cast to any?
    defaultProps: () => ({ text: 'hello', onClick: jest.fn() as any }),
    component: TestComponent,
    render,
    elements: (queries: RenderResult) => ({
      button: () => queries.getByTestId('button') as HTMLButtonElement,
      icon: () => queries.getByTestId('icon') as HTMLSpanElement,
    }),
    fire: elements => ({
      buttonClick: () => fireEvent.click(elements.button()),
    }),
    waitFor: elements => ({
      icon: () => waitForElement(elements.icon),
      iconToBeRemoved: () => waitForElementToBeRemoved(elements.icon),
    }),
  });

  const first = renderComponent();
  const second = renderComponent();

  expect(first.props).not.toBe(second.props);
});

test('fire and waitFor are optional', () => {
  const renderComponent = createRender({
    defaultProps: { text: 'hello', onClick: jest.fn() },
    component: TestComponent,
    render,
    // @TODO(mAAdhaTTah) required to get inference working - why?
    elements: (queries: RenderResult) => ({
      button: () => queries.getByTestId('button') as HTMLButtonElement,
      icon: () => queries.getByTestId('icon') as HTMLSpanElement,
    }),
  });

  const instance = renderComponent();

  expect(instance.container.textContent).toEqual('hello');
});
