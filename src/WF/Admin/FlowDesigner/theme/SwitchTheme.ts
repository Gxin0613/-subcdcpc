import { SwitchProps } from 'naive-ui';
import { primaryColor } from '/@flow/theme/index';
type SwitchThemeOverrides = NonNullable<SwitchProps['themeOverrides']>;
const switchTheme: SwitchThemeOverrides = {
  railColorActive: primaryColor,
};

export default switchTheme;
