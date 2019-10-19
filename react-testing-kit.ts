import React from 'react';
import { RenderResult } from '@testing-library/react';

interface RenderConfig<P, E, F, A> {
  defaultProps: P;
  component: React.ComponentType<P>;
  render: (ui: React.ReactElement<P>) => RenderResult;
  elements: (queries: RenderResult) => E;
  fire: (elements: E) => F;
  waitFor: (elements: E) => A;
}

interface RenderInstance<P, E, F, A> {
  props: P;
  container: RenderResult['container'];
  baseElement: RenderResult['baseElement'];
  debug: RenderResult['debug'];
  rerender: RenderResult['rerender'];
  unmount: RenderResult['unmount'];
  asFragment: RenderResult['asFragment'];
  elements: E;
  fire: F;
  waitFor: A;
}

export const createRender = <P, E, F, A>({
  defaultProps,
  component,
  render,
  elements: getElements,
  fire: getEvents,
  waitFor: getAsync
}: RenderConfig<P, E, F, A>) => (
  overrides: Partial<P> = {}
): RenderInstance<P, E, F, A> => {
  const props: P = { ...defaultProps, ...overrides };
  const queries = render(React.createElement(component, props));
  const elements = getElements(queries);
  const fire = getEvents(elements);
  const waitFor = getAsync(elements);

  const {
    container,
    baseElement,
    debug,
    rerender,
    unmount,
    asFragment
  } = queries;

  return {
    props,
    container,
    baseElement,
    debug,
    rerender,
    unmount,
    asFragment,
    elements,
    fire,
    waitFor
  };
};
