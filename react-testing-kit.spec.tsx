import React from 'react';
import {
  render,
  fireEvent,
  waitForElementToBeRemoved,
  cleanup,
  RenderOptions,
} from '@testing-library/react';
import { Kit } from './react-testing-kit';

type Props = {
  icon?: string;
  text: string;
  onClick: () => void;
};

const TestComponent: React.FC<Props> = ({ icon = null, text, onClick }) => (
  <button data-testid="button" onClick={onClick}>
    {icon && <span data-testid="icon">{icon}</span>}
    {text}
  </button>
);

const customRender = (ui: React.ReactElement, opts?: RenderOptions) =>
  render(ui, opts);

const baseKit = Kit.create(customRender, TestComponent, () => ({
  text: 'hello',
  onClick: jest.fn(),
}));
const kit = baseKit
  .setElements(rr => ({
    button: () => rr.getByTestId('button') as HTMLButtonElement,
    icon: () => rr.getByTestId('icon') as HTMLSpanElement,
    iconAsync: () => rr.findByTestId('icon') as Promise<HTMLSpanElement>,
  }))
  .setFire(elements => ({
    buttonClick: () => fireEvent.click(elements.button()),
  }))
  .setAsync(elements => ({
    iconToBeRemoved: () => waitForElementToBeRemoved(elements.icon),
  }));

afterEach(cleanup);

test('it can prebind to render', () => {
  const run = Kit.withRender(customRender)
    .create(TestComponent, () => ({
      text: 'hello',
      onClick: jest.fn(),
    }))
    .run();

  expect(run.queries.container.textContent).toEqual('hello');
});

test('it does not require anything set', () => {
  const run = baseKit.run();

  expect(run.queries.container.textContent).toEqual('hello');
});

test('it passes the default props to the component', () => {
  const run = kit.run();

  expect(run.queries.container.textContent).toEqual('hello');
});

test('it passes overriden props to the component', () => {
  const run = kit.run({
    text: 'world',
  });

  expect(run.queries.container.textContent).toEqual('world');
});

test('it passes options to the component', () => {
  const run = kit.run(
    {
      text: 'world',
    },
    {
      wrapper: ({ children }) => <div data-testid="wrapper">{children}</div>,
    },
  );

  expect(run.queries.getByTestId('wrapper')).not.toBeNull();
});

test('it returns the element queries', () => {
  const run = kit.run();

  const button = run.elements.button();

  expect(button.getAttribute('data-testid')).toEqual('button');
});

test('it returns the event fires', () => {
  const run = kit.run();

  run.fire.buttonClick();

  expect(run.props.onClick).toHaveBeenCalledTimes(1);
});

test('it returns the async waits', async () => {
  const run = kit.run();
  const waitForIcon = run.elements.iconAsync();
  run.queries.rerender(<TestComponent {...run.props} icon="👍" />);
  const icon = await waitForIcon;

  expect(icon.getAttribute('data-testid')).toEqual('icon');

  const waitForIconRemoved = run.waitFor.iconToBeRemoved();
  run.queries.rerender(<TestComponent {...run.props} />);

  // RTL 8 & 9 resolves this promise differently
  if (process.env.RTL_VERSION === '^8' || process.env.RTL_VERSION === '^9') {
    await expect(waitForIconRemoved).resolves.toBe(true);
  } else {
    await expect(waitForIconRemoved).resolves.toBeUndefined();
  }
});
