import { GlobalThemeOverrides } from 'naive-ui';

const primaryColor = '#459dff';
const primaryTextColor = '#333';

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: primaryColor,
  },
  Input: {
    borderFocus: primaryColor,
    borderHover: primaryColor,
  },
  Button: {
    borderHover: primaryColor,
    textColorFocus: primaryColor,
    textColorHover: primaryColor,
    textColorPressed: primaryColor,
    borderFocus: primaryColor,
    borderPressed: primaryColor,
    borderPressedInfo: primaryColor,
  },
  Select: {
    peers: {
      InternalSelection: {
        textColor: primaryTextColor,
        borderHover: `1px solid ${primaryColor}`,
        borderFocus: `1px solid ${primaryColor}`,
      },
      InternalSelectMenu: {
        borderRadius: '6px',
      },
    },
  },
  DataTable: {
    paginationMargin: '10px 0 0 0',
    peers: {
      Empty: {
        textColor: '#ccc',
      },
      Pagination: {
        itemTextColor: primaryTextColor,
      },
    },
  },
};

export default themeOverrides;
