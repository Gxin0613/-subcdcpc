import { InputNumberProps } from 'naive-ui';
type NumberInputThemeOverride = NonNullable<InputNumberProps['themeOverrides']>;

// load store
import { useDesignerTheme } from '/@/store/modules/form';
const theme = useDesignerTheme();

const NumberInputTheme: NumberInputThemeOverride = {
  peers: {
    Input: {
      borderFocus: theme.primaryColor,
      caretColor: theme.primaryColor,
      borderHover: theme.primaryColor,
      boxShadowFocus: `inset 0 0 0 1px ${theme.primaryColor}, 0 0 0 2px ${theme.primaryColorRgba}`,
    },
  },
};

export default NumberInputTheme;
