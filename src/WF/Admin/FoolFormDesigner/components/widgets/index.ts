const Widgets: {
  [propsName: string]: any;
} = {};
const modules = import.meta.glob('./**/*.vue', { eager: true });
const pathList = Object.keys(modules);
for (const path of pathList) {
  const componentName = modules[path].default.name;
  Widgets[componentName] = modules[path].default;
}

export default Widgets;
