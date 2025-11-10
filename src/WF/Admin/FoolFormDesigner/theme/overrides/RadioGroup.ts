import { RadioGroupProps } from 'naive-ui';
type RadioGroupThemeOverrides = NonNullable<RadioGroupProps['themeOverrides']>;

// load store
import { useDesignerTheme } from '/@/store/modules/form';
const theme = useDesignerTheme();

const radioGroupTheme: RadioGroupThemeOverrides = {
  buttonTextColorActive: theme.primaryColor,
  buttonBorderColorActive: theme.primaryColor,
  boxShadowHover: theme.primaryColor,
  buttonTextColorHover: theme.primaryColor,
  buttonBoxShadowFocus: `inset 0 0 0 1px ${theme.primaryColor}, 0 0 0 2px ${theme.primaryColorRgba}`,
};

export default radioGroupTheme;
