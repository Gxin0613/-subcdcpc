import { colorIsDark, lighten, darken } from '/@/utils/color';
import { useAppStore } from '/@/store/modules/app';
import { ThemeEnum } from '/@/enums/appEnum';
import { setCssVar } from './util';

const HEADER_BG_COLOR_VAR = '--header-bg-color';
const HEADER_BG_HOVER_COLOR_VAR = '--header-bg-hover-color';
const HEADER_MENU_ACTIVE_BG_COLOR_VAR = '--header-active-menu-bg-color';

const SIDER_DARK_BG_COLOR = '--sider-dark-bg-color';
const SIDER_DARK_DARKEN_BG_COLOR = '--sider-dark-darken-bg-color';
const SIDER_LIGHTEN_BG_COLOR = '--sider-dark-lighten-bg-color';

const SYSTEM_BG_COLOR = '--system-bg-color';
const SYSTEM_HOVER_BG_COLOR = '--system-hover-bg-color';
const SYSTEM_ACTIVE_BG_COLOR = '--system-active-bg-color';
const channel = new BroadcastChannel('update-theme');
channel.onmessage = (ev) => {
  const color = ev.data.color;
  updateSystemBgColor(color);
};
/**
 * Change the background color of the top header
 * @param color
 */
export function updateHeaderBgColor(color?: string) {
  const appStore = useAppStore();
  const darkMode = appStore.getDarkMode === ThemeEnum.DARK;
  if (!color) {
    if (darkMode) {
      color = '#151515';
    } else {
      color = appStore.getHeaderSetting.bgColor;
    }
  }
  // bg color
  setCssVar(HEADER_BG_COLOR_VAR, color);

  // hover color
  const hoverColor = lighten(color!, 6);
  setCssVar(HEADER_BG_HOVER_COLOR_VAR, hoverColor);
  setCssVar(HEADER_MENU_ACTIVE_BG_COLOR_VAR, hoverColor);

  // Determine the depth of the color value and automatically switch the theme
  const isDark = colorIsDark(color!);

  appStore.setProjectConfig({
    headerSetting: {
      theme: isDark || darkMode ? ThemeEnum.DARK : ThemeEnum.LIGHT,
    },
  });

  // let siderColor = color;
  // hack掉白色主题的时候
  // if (['#fff', '#ffffff'].includes(color?.toLowerCase()) || !color) {
  //   color = '#459dff';
  //   siderColor = '#151515';
  // }

  // // bg color
  // setCssVar(CCFLOW_BG_COLOR, color);

  // // hover color
  // const ccflowHoverColor = lighten(color!, 6);
  // setCssVar(CCFLOW_BG_HOVER_COLOR, ccflowHoverColor);
  // setCssVar(CCFLOW_ACTIVE_BG_COLOR, ccflowHoverColor);
  // // 这个地方为了实现全局主题统一， 修改了部分代码，实现顶栏更新的时候更新掉 主题颜色
  // updateSidebarBgColor(siderColor);
}

/**
 * Change the background color of the left menu
 * @param color  bg color
 */
export function updateSidebarBgColor(color?: string) {
  const appStore = useAppStore();

  // if (!isHexColor(color)) return;
  const darkMode = appStore.getDarkMode === ThemeEnum.DARK;
  if (!color) {
    if (darkMode) {
      color = '#212121';
    } else {
      color = appStore.getMenuSetting.bgColor;
    }
  }
  setCssVar(SIDER_DARK_BG_COLOR, color);
  setCssVar(SIDER_DARK_DARKEN_BG_COLOR, darken(color!, 6));
  setCssVar(SIDER_LIGHTEN_BG_COLOR, lighten(color!, 5));

  // only #ffffff is light
  // Only when the background color is #fff, the theme of the menu will be changed to light
  const isLight = ['#fff', '#ffffff'].includes(color!.toLowerCase());

  appStore.setProjectConfig({
    menuSetting: {
      theme: isLight && !darkMode ? ThemeEnum.LIGHT : ThemeEnum.DARK,
    },
  });
}

/**
 * Change the background color of the content 对应系统主题
 * @param color  bg color
 */
export function updateSystemBgColor(color?: string) {
  const appStore = useAppStore();

  // if (!isHexColor(color)) return;
  const darkMode = appStore.getDarkMode === ThemeEnum.DARK;
  if (!color) {
    if (darkMode) {
      color = '#212121';
    } else {
      color = appStore.getProjectConfig.themeColor;
    }
  }
  setCssVar(SYSTEM_BG_COLOR, color);
  setCssVar(SYSTEM_ACTIVE_BG_COLOR, darken(color!, 10));
  setCssVar(SYSTEM_HOVER_BG_COLOR, lighten(color!, 10));

  // only #ffffff is light
  // Only when the background color is #fff, the theme of the menu will be changed to light
  const isLight = ['#fff', '#ffffff'].includes(color!.toLowerCase());

  appStore.setProjectConfig({
    themeColor: color,
    menuSetting: {
      theme: isLight && !darkMode ? ThemeEnum.LIGHT : ThemeEnum.DARK,
    },
  });
}
