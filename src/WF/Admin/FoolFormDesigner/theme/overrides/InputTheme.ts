import { InputProps } from 'naive-ui';
type InputThemeOverride = NonNullable<InputProps['themeOverrides']>;

const InputTheme: InputThemeOverride = {
  // borderFocus: theme.primaryColor,
  // caretColor: theme.primaryColor,
  // borderHover: theme.primaryColor,
  // boxShadowFocus: `inset 0 0 0 1px ${theme.primaryColor}, 0 0 0 2px ${theme.primaryColorRgba}`,
};

export default InputTheme;
