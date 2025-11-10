import { TabsProps } from 'naive-ui';

type TabsThemeOverrides = NonNullable<TabsProps['themeOverrides']>;

// load store
import { useDesignerTheme } from '/@/store/modules/form';
const theme = useDesignerTheme();

const TabsThemeOverrides: TabsThemeOverrides = {
  barColor: theme.primaryColor,
  tabTextColorHoverLine: theme.primaryColor,
  tabTextColorActiveLine: theme.primaryColor,
};

export default TabsThemeOverrides;
