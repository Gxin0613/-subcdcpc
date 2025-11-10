<template>
  <div class="toolbar">
    <div class="toolbar-left">
      <button class="btn" @click="goBack">
        <!-- <LeftOutlined /> -->
        <i class="icon-action-undo"></i>{{ '返回' }}</button
      >
      <div class="divider"></div>
      <!--4列/6列-->
      <div class="btn-group" style="margin-left: 12px">
        <template v-if="activeDevice == 'pc'">
          <button v-for="option in columnOptions" :key="option.value" class="btn" :class="{ 'btn-primary': activeColumns === option.value }" @click="setColumns(option.value)">
            {{ option.label }}
          </button>
        </template>
      </div>
      <div class="divider"></div>
    </div>
    <!-- 表单展示方式/Tab页合并 -->
    <div class="toolbar-center">
      <div class="btn-group">
        <template  v-if="activeDevice == 'pc'">
          <button v-for="fStyle in frmStyles" :key="fStyle.value" class="btn" :class="{ 'btn-primary': activeFrmStyle === fStyle.value }" @click="setFrmStyle(fStyle.value)">
            <component :is="fStyle.icon" style="margin-right: 6px" />
            {{ fStyle.label }}
          </button>
        </template>
        <template v-else>
          <button v-for="mfStyle in mobileFrmStyles" :key="mfStyle.value" class="btn" :class="{ 'btn-primary': activeMobileFrmStyle === mfStyle.value }" @click="setMobileFrmStyle(mfStyle.value)">
            <component :is="mfStyle.icon" style="margin-right: 6px" />
            {{ mfStyle.label }}
          </button>
        </template>
       
      </div>
      <!-- 表单布局 -->
      <div class="btn-group">
        <button v-for="fLayout in frmLayouts" :key="fLayout.value" class="btn" :class="{ 'btn-primary': activeFrmLayout === fLayout.value }" @click="setFrmLayout(fLayout.value)">
          <component :is="fLayout.icon" style="margin-right: 6px" />
          {{ fLayout.label }}
        </button>
      </div>
    </div>

    <Select v-model:value="activeLang" :options="languageOptions" style="width: 80px; height: 32px" @select="(val) => setSysLang(val)" />
    <div class="toolbar-center">
      <div class="screen-control">
        <div class="btn-group">
          <button v-for="device in deviceOptions" :key="device.value" class="btn" :class="{ 'btn-primary': activeDevice === device.value }" @click="setDevice(device.value)">
            <span :class="`icon icon-${device.icon}`"></span>
            {{ device.label }}
          </button>
        </div>

        <div class="dropdown">
          <template v-if="activeDevice == 'pc'">
            <div style="width: 200px; display: flex; justify-content: space-between">
              <ToolbarStyle />
              <button class="btn dropdown-toggle" @click.stop="toggleSizeMenu"> <ExpandAltOutlined />{{ '页面大小' }}</button>
            </div>
            <div class="dropdown-menu" :class="{ show: showSizeMenu }">
              <div class="width-selector" :class="{ show: showSizeMenu }">
                <div class="header">
                  <div class="title">页面大小:</div>
                  <div class="current-width">{{ formWidth }}px</div>
                </div>

                <div class="button-group">
                  <button
                    v-for="option in widthOptions"
                    :key="option.value"
                    @click="updateFormWidth(option.value)"
                    :class="['width-button', formWidth === option.value ? 'active' : '']"
                  >
                    {{ option.label }}
                    <div class="size-value">{{ option.value }}px</div>
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import {
    FileOutlined,
    ExpandAltOutlined,
    InsertRowAboveOutlined,
    TableOutlined,
    ColumnWidthOutlined,
    VerticalAlignBottomOutlined,
    PicLeftOutlined,
    ContainerOutlined,
  } from '@ant-design/icons-vue';
  import { message, Select } from 'ant-design-vue';
  import { ref, onMounted, onUnmounted } from 'vue';
  import { getAuthCache, setAuthCache } from '/@/utils/auth';
  import WebUser, { User } from '/@/bp/web/WebUser';
  import { WEB_USER_INFO_KEY } from '/@/enums/cacheEnum';
  import { MapFrmFool } from '../Admin/FrmLogic/MapData/MapFrmFool';
  import { useLocale } from '/@/locales/useLocale';
  import { LocaleType } from '/#/config';
  import ToolbarStyle from '/@/WF/CCForm/ToolbarStyle.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  const { t } = useI18n();
  const props = defineProps({
    initWidth: {
      type: Number,
      default: 0,
    },
    initCol: {
      type: Number,
      default: 0,
    },
    initDisplayMode: {
      type: Number,
      default: 2,
    },
    initDisplayMobileMode: {
      type: Number,
      default: 2,
    },
    initLayoutMode: {
      type: Number,
      default: 0,
    },
    frmID: {
      type: String,
      default: '',
    },
  });
  interface ColumnOption {
    label: string;
    value: number;
  }

  interface DeviceOption {
    label: string;
    value: string;
    icon: string;
  }

  // 列选项
  const columnOptions: ColumnOption[] = [
    { label: '4列', value: 0 },
    { label: '6列', value: 1 },
  ];
  const activeColumns = ref<number>(4);
  interface WidthOption {
    label: string;
    value: number;
  }
  const widthOptions: WidthOption[] = [
    { label: '最小', value: 600 },
    { label: '小', value: 700 },
    { label: '中', value: 800 },
    { label: '大', value: 900 },
    { label: '最大', value: 1000 },
  ];
  interface LanguageOption {
    label: string;
    value: string;
  }

  const languageOptions: LanguageOption[] = [
    { label: '中文', value: 'CH' },
    { label: '繁体', value: 'FT' },
    { label: 'English', value: 'EN' },
    { label: 'Japanese', value: 'JA' },
  ];

  // 设备选项
  const deviceOptions: DeviceOption[] = [
    { label: 'PC', value: 'pc', icon: 'desktop' },
    { label: 'Mobile', value: 'mobile', icon: 'mobile' },
  ];
  const activeDevice = ref<string>('pc');

  // 页面大小相关
  const formWidth = ref<number>(600);
  // const minWidth = ref<number>(600);
  const maxWidth = ref<number>(window.innerWidth - 40);
  const showSizeMenu = ref<boolean>(false);

  // 监听窗口大小变化以更新最大宽度
  const updateMaxWidth = () => {
    maxWidth.value = window.innerWidth - 40;
    if (formWidth.value > maxWidth.value) {
      formWidth.value = maxWidth.value;
    }
  };

  const initArgs = () => {
    formWidth.value = props.initWidth;
    activeColumns.value = props.initCol;
    activeFrmStyle.value = props.initDisplayMode;
    activeMobileFrmStyle.value = props.initDisplayMobileMode;
    activeFrmLayout.value = props.initLayoutMode;
  };
  onMounted(() => {
    window.addEventListener('resize', updateMaxWidth);
    document.addEventListener('click', closeSizeMenu);
    initArgs();
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateMaxWidth);
    document.removeEventListener('click', closeSizeMenu);
  });
  const emit = defineEmits(['update-columns', 'update-form-display-mode', 'update-mobile-form-display-mode', 'update-device', 'update-form-width', 'update-form-frm-layout', 'update-lang']);
  // 监听表单宽度变化，发出事件
  const updateFormWidth = (width: number) => {
    formWidth.value = width;
    emit('update-form-width', width);
  };

  // 下拉菜单的关闭函数
  const closeSizeMenu = () => {
    showSizeMenu.value = false;
  };

  const goBack = () => {
    history.back();
  };
  const setColumns = (columns: number) => {
    activeColumns.value = columns;
    emit('update-columns', columns);
  };
  const frmStyles = [
    { label: '平铺', value: 0, icon: FileOutlined },
    { label: 'Tab模式', value: 1, icon: InsertRowAboveOutlined },
    { label: '从表合并', value: 2, icon: ContainerOutlined },
    { label: '左右', value: 3, icon: TableOutlined },
  ];

  const mobileFrmStyles = [
    { label: '平铺', value: 0, icon: FileOutlined },
    { label: 'Tab模式', value: 1, icon: InsertRowAboveOutlined },
  ];

  const frmLayouts = [
    { label: '水平', value: 0, icon: ColumnWidthOutlined },
    { label: '垂直', value: 1, icon: VerticalAlignBottomOutlined },
    { label: '行内', value: 2, icon: PicLeftOutlined },
  ];
  const activeFrmStyle = ref(0);
  const activeFrmLayout = ref(0);
  const activeMobileFrmStyle = ref(0);
  const { changeLocale } = useLocale();
  const activeLang = ref(WebUser.SysLang || 'CH');
  const setSysLang = async (langVal: string) => {
    activeLang.value = langVal;
    //修改语言
    const user = getAuthCache<User>(WEB_USER_INFO_KEY);
    user.SysLang = activeLang.value;
    setAuthCache(WEB_USER_INFO_KEY, user);
    WebUser.userInfo = user;
    const lang = langVal === 'CH' ? 'zh_CN' : langVal.toLowerCase();
    changeLocale(lang as LocaleType);
    //如果是其他语言.
    if (activeLang.value != 'CH') {
      message.info('正在执行自动翻译请稍后....');
      //1.首先检测是否翻译?
      const frm = new MapFrmFool();
      frm.No = props.frmID; //@yln 如何获得，外部表单id参数?
      await frm.Retrieve();
      try {
        await frm.SysLange(activeLang.value);
      } catch (e) {}
    }

    emit('update-lang', langVal);
  };

  const setFrmStyle = (styleVal: number) => {
    activeFrmStyle.value = styleVal;
    emit('update-form-display-mode', styleVal);
  };
  const setMobileFrmStyle = (styleVal: number)=>{
    activeMobileFrmStyle.value = styleVal;
    emit('update-mobile-form-display-mode', styleVal);
  }
  const setFrmLayout = (layoutVal: number) => {
    activeFrmLayout.value = layoutVal;
    emit('update-form-frm-layout', layoutVal);
  };
  const setDevice = (device: string) => {
    activeDevice.value = device;
    emit('update-device', device);
  };

  const toggleSizeMenu = (event: Event) => {
    event.stopPropagation();
    showSizeMenu.value = !showSizeMenu.value;
  };
</script>

<style lang="less" scoped>
  // 变量定义
  @bg-color: white;
  @border-color: #e5e7eb;
  @text-color: #4b5563;
  @light-gray: #f3f4f6;
  @medium-gray: #6b7280;
  @border-radius: 8px;
  @shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #fff;
    padding: 10px 16px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    border-bottom: 1px solid #e8e8e8;

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .toolbar-center {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .btn {
      border: 1px solid #d9d9d9;
      border-radius: 2px;
      padding: 4px 12px;
      font-size: 14px;
      cursor: pointer;
      background-color: #fff;
      display: flex;
      align-items: center;
      gap: 4px;
      height: 32px;
      transition: all 0.3s;
    }

    .btn:hover {
      border-color: var(--system-bg-color);
      color: var(--system-bg-color);
    }

    .btn-primary {
      background-color: var(--system-bg-color);
      color: white;
      border-color: var(--system-bg-color);
    }

    .btn-primary:hover {
      background-color: color-mix(in srgb, var(--system-bg-color) 60%, transparent);
      color: white;
      border-color: color-mix(in srgb, var(--system-bg-color) 60%, transparent);
    }

    .btn-group {
      display: flex;
    }

    .btn-group .btn {
      border-radius: 0;
      margin-right: -1px;
    }

    .btn-group .btn:first-child {
      border-top-left-radius: 2px;
      border-bottom-left-radius: 2px;
    }

    .btn-group .btn:last-child {
      border-top-right-radius: 2px;
      border-bottom-right-radius: 2px;
      margin-right: 0;
    }

    .divider {
      width: 1px;
      height: 24px;
      background-color: #e8e8e8;
    }

    .select-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      border: 1px solid #d9d9d9;
      border-radius: 2px;
      padding: 0 8px;
      background-color: #fff;
      height: 32px;
    }

    .select-wrapper:hover {
      border-color: var(--system-bg-color);
    }

    .select-wrapper .icon {
      color: #999;
      margin-right: 6px;
    }

    .select {
      border: none;
      outline: none;
      font-size: 14px;
      cursor: pointer;
      background-color: transparent;
      height: 30px;
      appearance: none;
      padding-right: 20px;
    }

    .select-wrapper::after {
      content: '';
      position: absolute;
      right: 8px;
      top: 45%;
      width: 0;
      height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 5px solid #999;
      pointer-events: none;
    }

    .screen-control {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* 开关样式 */
    .switch-wrapper {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-size: 14px;
      gap: 8px;
    }

    .switch-input {
      display: none;
    }

    .switch-slider {
      position: relative;
      display: inline-block;
      width: 40px;
      height: 20px;
      background-color: #e8e8e8;
      border-radius: 10px;
      transition: all 0.3s;
    }

    .switch-slider:before {
      position: absolute;
      content: '';
      height: 16px;
      width: 16px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      border-radius: 50%;
      transition: all 0.3s;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .switch-input:checked + .switch-slider {
      background-color: var(--system-bg-color);
    }

    .switch-input:checked + .switch-slider:before {
      transform: translateX(20px);
    }

    .switch-label {
      user-select: none;
    }

    /* 下拉菜单样式 */
    .dropdown {
      position: relative;
      display: inline-block;
    }

    .dropdown-toggle {
      position: relative;
      padding-right: 24px;
    }

    .dropdown-toggle::after {
      content: '';
      position: absolute;
      right: 10px;
      top: 45%;
      width: 0;
      height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 5px solid currentColor;
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      z-index: 1000;
      display: none;
      min-width: 360px;
      margin-top: 4px;
      background-color: #fff;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

      .width-selector {
        background-color: @bg-color;
        padding: 24px;
        border-radius: @border-radius;
        box-shadow: @shadow;
        max-width: 800px;
        margin: 0 auto;

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;

          .title {
            font-size: 18px;
            font-weight: 500;
          }

          .current-width {
            font-size: 18px;
            font-weight: 500;
            color: var(--system-bg-color);
          }
        }

        .button-group {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
          margin-bottom: 24px;

          .width-button {
            padding: 8px 4px;
            border-radius: 6px;
            font-size: 14px;
            transition: all 0.2s;
            background-color: @light-gray;
            color: @text-color;
            border: none;
            cursor: pointer;

            &:hover {
              background-color: darken(@light-gray, 5%);
            }

            &.active {
              background-color: var(--system-bg-color);
              color: white;
              font-weight: 500;
              box-shadow: 0 2px 4px color-mix(var(--system-bg-color), 30%, transparent);
            }

            .size-value {
              font-size: 12px;
              margin-top: 4px;
            }
          }
        }
      }
    }

    .dropdown-menu.show {
      display: block;
    }

    /* 滑块样式 */
    .slider-container {
      padding: 10px 5px;
    }

    .slider-label {
      margin-bottom: 12px;
      font-size: 14px;
      font-weight: 500;
    }

    .width-slider {
      width: 100%;
      height: 6px;
      background: #e8e8e8;
      outline: none;
      border-radius: 3px;
    }

    .width-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--system-bg-color);
      cursor: pointer;
      border: none;
    }

    .width-slider::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--system-bg-color);
      cursor: pointer;
      border: none;
    }

    .slider-limits {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
      font-size: 12px;
      color: #999;
    }

    /* 图标样式 */
    .icon {
      display: inline-block;
      width: 16px;
      height: 16px;
      margin-right: 4px;
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
      vertical-align: middle;
    }

    .icon-back {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='currentColor' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z'/%3E%3C/svg%3E");
    }

    .icon-expand {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='currentColor' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M5.828 10.172a.5.5 0 0 0-.707 0l-4.096 4.096V11.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H4.5a.5.5 0 0 0 0-1H1.732l4.096-4.096a.5.5 0 0 0 0-.707zm4.344-4.344a.5.5 0 0 0 .707 0l4.096-4.096V4.5a.5.5 0 1 0 1 0V.525a.5.5 0 0 0-.5-.5H11.5a.5.5 0 0 0 0 1h2.768l-4.096 4.096a.5.5 0 0 0 0 .707z'/%3E%3C/svg%3E");
    }

    .icon-desktop {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='currentColor' viewBox='0 0 16 16'%3E%3Cpath d='M0 4s0-2 2-2h12s2 0 2 2v6s0 2-2 2h-4c0 .667.083 1.167.25 1.5H11a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1h.75c.167-.333.25-.833.25-1.5H2s-2 0-2-2V4zm1.398-.855a.758.758 0 0 0-.254.302A1.46 1.46 0 0 0 1 4.01V10c0 .325.078.502.145.602.07.105.17.188.302.254a1.464 1.464 0 0 0 .538.143L2.01 11H14c.325 0 .502-.078.602-.145a.758.758 0 0 0 .254-.302 1.464 1.464 0 0 0 .143-.538L15 9.99V4c0-.325-.078-.502-.145-.602a.757.757 0 0 0-.302-.254A1.46 1.46 0 0 0 13.99 3H2c-.325 0-.502.078-.602.145z'/%3E%3C/svg%3E");
    }

    .icon-mobile {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='currentColor' viewBox='0 0 16 16'%3E%3Cpath d='M11 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h6zM5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H5z'/%3E%3Cpath d='M8 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2z'/%3E%3C/svg%3E");
    }

    .icon-time {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='currentColor' viewBox='0 0 16 16'%3E%3Cpath d='M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z'/%3E%3Cpath d='M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z'/%3E%3C/svg%3E");
    }

    .btn-primary .icon-back,
    .btn-primary .icon-expand,
    .btn-primary .icon-desktop,
    .btn-primary .icon-mobile {
      filter: brightness(0) invert(1);
    }
  }

  @media (max-width: 768px) {
    .toolbar {
      flex-wrap: wrap;
    }

    .toolbar-right {
      margin-top: 8px;
      width: 100%;
      justify-content: flex-end;
    }
  }
</style>
