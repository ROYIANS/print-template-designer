import type { App } from 'vue';
import * as components from './components';
import '../style/index.css'
import pkg from '../../package.json' with {
  type: 'json',
};

type ComponentMap = typeof components;
export function install(app: App, config?: Record<string, unknown>): void {
  Object.keys(components).forEach((key: string) => {
    if (/directive/i.test(key)) return;
    const component = components[key as keyof ComponentMap];
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    /plugin/i.test(key) ? app.use(component) : app.use(component, config);
  });
}

export * from './components';
export const version = pkg.version;
