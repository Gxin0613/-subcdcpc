import { InputProps } from 'naive-ui';
import { primaryColor } from '/@flow/theme/index';
type InputThemeOverrides = NonNullable<InputProps['themeOverrides']>;
const inputTheme: InputThemeOverrides = {
  caretColor: primaryColor,
  borderHover: primaryColor,
  borderFocus: primaryColor,
  boxShadowFocus: '0 0 0 1px rgba(69, 157, 255, 1)',
};

export default inputTheme;
