import { SelectProps } from 'naive-ui';
import { primaryColor } from '/@flow/theme/index';
type SelectThemeOverrides = NonNullable<SelectProps['themeOverrides']>;
const selectTheme: SelectThemeOverrides = {
  menuBoxShadow: '0 6px 16px -9px rgba(0, 0, 0, .08), 0 9px 28px 0 rgba(0, 0, 0, .05), 0 12px 48px 16px rgba(0, 0, 0, .03)',
  peers: {
    InternalSelection: {
      textColor: '#333',
      borderFocus: primaryColor,
      borderActive: primaryColor,
      borderHover: primaryColor,
      boxShadowActive: '0 0 0 1px rgba(69,157,255, 1)',
      boxShadowFocus: '0 0 0 1px rgba(69, 157, 255, 1)',
      caretColor: primaryColor,
    },
    InternalSelectMenu: {
      optionTextColorActive: primaryColor,
      optionCheckColor: primaryColor,
      optionTextColorPressed: primaryColor,
    },
  },
};

export default selectTheme;
