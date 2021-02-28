import { createElement } from 'react';

type Renderer<RR> = (ui: React.ReactElement) => RR;

export class Kit<RR, P, E = {}, F = {}, A = {}> {
  static create<RR, P>(
    render: Renderer<RR>,
    component: React.ComponentType<P>,
    defaultProps: () => P,
  ) {
    return new Kit(render, component, defaultProps);
  }

  static withRender<WRR>(render: Renderer<WRR>) {
    return {
      create<CP>(component: React.ComponentType<CP>, defaultProps: () => CP) {
        return Kit.create<WRR, CP>(render, component, defaultProps);
      },
    };
  }

  private elements?: (rr: RR) => E;
  private fire?: (e: E) => F;
  private async?: (e: E) => A;

  protected constructor(
    private render: Renderer<RR>,
    private component: React.ComponentType<P>,
    private defaultProps: () => P,
  ) {}

  setElements<NE extends E>(elements: (renderResult: RR) => NE) {
    const kit = new Kit(this.render, this.component, this.defaultProps) as Kit<
      RR,
      P,
      NE,
      F,
      A
    >;
    kit.elements = elements;
    kit.fire = this.fire;
    kit.async = this.async;

    return kit;
  }

  setFire<NF extends F>(fire: (renderResult: E) => NF) {
    const kit = new Kit(this.render, this.component, this.defaultProps) as Kit<
      RR,
      P,
      E,
      NF,
      A
    >;
    kit.elements = this.elements;
    kit.fire = fire;
    kit.async = this.async;

    return kit;
  }

  setAsync<NA extends A>(async: (e: E) => NA) {
    const kit = new Kit(this.render, this.component, this.defaultProps) as Kit<
      RR,
      P,
      E,
      F,
      NA
    >;
    kit.elements = this.elements;
    kit.fire = this.fire;
    kit.async = async;

    return kit;
  }

  run(overrides: Partial<P> = {}) {
    const props = { ...this.defaultProps(), ...overrides };
    const queries = this.render(createElement(this.component, props));
    const elements = this.elements?.(queries) ?? ({} as E);
    const fire = this.fire?.(elements) ?? ({} as F);
    const waitFor = this.async?.(elements) ?? ({} as A);

    return new RunInstance(props, queries, elements, fire, waitFor);
  }
}

class RunInstance<P, Q, E, F, A> {
  constructor(
    public props: P,
    public queries: Q,
    public elements: E,
    public fire: F,
    public waitFor: A,
  ) {}
}
