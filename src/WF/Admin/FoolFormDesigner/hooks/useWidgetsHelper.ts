import { FormItem } from '../props/form/FormComponents';
import * as WidgetsProps from '../props/widgets/index';

const modules: {
  [propName: string]: unknown;
} = WidgetsProps;
export default function useWidgetHelper() {
  const mergeWidgetObject = (elem: FormItem) => {
    if (!elem.category) {
      return elem;
    }
    try {
      const key = `${elem.category}_${elem.key}_Props`;
      return {
        ...JSON.parse(JSON.stringify(elem)),
        ...JSON.parse(JSON.stringify(modules[key])),
      };
    } catch (_) {
      return {
        ...JSON.parse(JSON.stringify(elem)),
      };
    }
  };

  return {
    mergeWidgetObject,
  };
}
