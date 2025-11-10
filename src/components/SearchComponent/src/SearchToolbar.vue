<template>
  <NConfigProvider :theme-overrides="GlobalThemeOverrides" :locale="zhCN" :date-locale="dateZhCN">
    <ThemeWrapper>
      <Card class="search-card">
        <div class="search-container">
          <!-- 标题插槽 -->
          <slot name="title"></slot>

          <!-- 搜索区域 -->
          <div class="search-content" :class="{ 'auto-width': isSpecialPageType }">
            <!-- 关键词输入 -->
            <div v-for="kwItem in keywordList" :key="kwItem.key" class="search-item">
              <Input v-model:value="kwItem.value" :placeholder="kwItem.placeholder" />
            </div>

            <!-- 第一个下拉选择 -->
            <div v-if="hasFirstSelect" class="search-item">
              <Select
                v-model:value="firstSelectVal"
                :mode="selectList[0].isMultiSelect ? 'multiple' : undefined"
                style="width: 100%"
                :placeholder="`请选择${selectList[0].label}`"
                @change="handleChangeEvent(selectList[0])"
                :disabled="selectList[0].readonly"
              >
                <SelectOption v-for="item in selectList[0].options" :key="item.value" :value="item.value">
                  {{ item.label }}
                </SelectOption>
              </Select>
            </div>

            <!-- 日期选择器 -->
            <template v-if="hasFirstSelect">
              <div v-for="dateItem in dateList" :key="dateItem.key" class="search-item date-picker">
                <RangePicker :clearable="true" v-model:value="dateItem.value" :placeholder="[dateItem.startPlaceholder!, dateItem.endPlaceholder!]" @change="dateItem.onChange" />
              </div>
            </template>

            <!-- 其他选择器 -->
            <div v-for="condition in otherSelectList" :key="condition.key" class="search-item condition">
              <div v-if="condition.label" class="label">{{ condition.label }}</div>

              <!-- 单选按钮组 -->
              <RadioGroup v-if="condition.display === 'radio'" v-model:value="condition.value">
                <RadioButton v-for="item in condition.options" :key="item.value" :value="item.value">
                  {{ item.label }}
                </RadioButton>
              </RadioGroup>

              <!-- 下拉选择 -->
              <Select
                v-else-if="condition.display === 'select'"
                v-model:value="condition.value"
                :mode="condition.isMultiSelect ? 'multiple' : undefined"
                style="width: 100%"
                :allow-clear="true"
                :placeholder="`请选择${condition.label}`"
                @change="handleChangeEvent(condition)"
                :disabled="condition.readonly"
              >
                <SelectOption v-for="item in condition.options" :key="item.value" :style="getEnumOptionColor(item)">
                  {{ item.label }}
                </SelectOption>
              </Select>
            </div>
          </div>

          <!-- 主要操作按钮 -->
          <div v-if="hasMainActions" class="search-item main-actions" :style="isMobile ? ({ width: '32px' } as StyleValue) : ({ width: '250px' } as StyleValue)">
            <Button v-for="button in queryButtons" :key="button.key" :style="button.style" :type="button.type" :shape="button.shape" @click="viewAsTable(button)">
              {{ button.name }}
            </Button>

            <Button v-for="button in reportButtons" :key="button.key" :style="button.style" :type="button.type" :shape="button.shape" @click="$emit('view-as-rpt')">
              {{ button.name }}
            </Button>
          </div>
          <!-- 更多操作按钮 -->
          <div v-if="hasOtherButtons" class="action-buttons" :class="{ mobile: isMobile }">
            <template v-if="displayButtonAsDropdown">
              <!-- 表格模式的直接操作按钮 -->
              <template v-if="displayMode === 'table'">
                <Button v-for="button in directActionButtons" :key="button.key" :style="button.style" :type="button.type" :shape="button.shape" @click="button.onClick!">
                  {{ button.name }}
                </Button>
                <Button v-for="button in dropdownNoZDButtons" :key="button.key" :style="button.style" :type="button.type" :shape="button.shape" @click="button.onClick!">
                  {{ button.name }}
                </Button>
              </template>

              <!-- 更多操作下拉菜单 -->
              <Dropdown v-if="displayMode !== 'rpt'">
                <Button type="primary" style="margin-right: 15px">更多</Button>
                <template #overlay>
                  <Menu>
                    <MenuItem v-for="button in analysisButtons" :key="button.key" @click="$emit('GroupInitPage')" class="menu-item">
                      {{ button.name }}
                    </MenuItem>
                    <MenuItem v-for="button in dropdownZDButtons" :key="button.key" @click="button.onClick!" class="menu-item">
                      {{ button.name }}
                    </MenuItem>
                  </Menu>
                </template>
              </Dropdown>
            </template>

            <!-- 非下拉模式的所有其他按钮 -->
            <template v-else>
              <Button v-for="button in otherActionButtons" :key="button.key" :style="button.style" :type="button.type" :shape="button.shape" @click="button.onClick!">
                {{ button.name }}
              </Button>
            </template>

            <!-- 设计按钮 -->

            <Dropdown v-if="showDesignButton && pageType != 'MyBill' && pageType != 'SearchAskFrm'" :trigger="['click']">
              <Button type="primary" style="margin-right: 15px; background-color: #f27140; border-color: #f27140">设计</Button>
              <template #overlay>
                <Menu @click="handleMenuClick">
                  <MenuItem key="design"><i class="icon-settings"></i> 表单设计 </MenuItem>
                  <MenuItem key="search"><i class="icon-eye"></i> 查询条件 </MenuItem>
                  <MenuItem key="button"><i class="icon-mouse"></i> 按钮设计 </MenuItem>
                  <MenuItem key="data"><i class="icon-layers"></i> 数据权限 </MenuItem>
                </Menu>
              </template>
            </Dropdown>
          </div>
          <div v-else>
            <!-- 设计按钮 -->
            <Dropdown v-if="showDesignButton && pageType != 'MyBill' && pageType != 'SearchAskFrm'" :trigger="['click']">
              <Button type="primary" style="margin-right: 15px; background-color: #f27140; border-color: #f27140">设计</Button>
              <template #overlay>
                <Menu @click="handleMenuClick">
                  <MenuItem key="design"><i class="icon-settings"></i> 表单设计 </MenuItem>
                  <MenuItem key="search"><i class="icon-eye"></i> 查询条件 </MenuItem>
                  <MenuItem key="button"><i class="icon-mouse"></i> 按钮设计 </MenuItem>
                  <MenuItem key="data"><i class="icon-layers"></i> 数据权限 </MenuItem>
                </Menu>
              </template>
            </Dropdown>
          </div>
          <!-- 工具栏区域 -->
          <div v-if="isSpecialPageType" class="toolbar-area">
            <ToolbarBill :params="params" :pageType="pageType" :billState="billState" @open-single-page="emit('open-single-design')" />
            <ToolbarStyle class="toolbar-style" :frmID="params.FrmID" />
          </div>
        </div>
      </Card>
    </ThemeWrapper>
  </NConfigProvider>
</template>

<script lang="ts" setup>
  import { computed, StyleValue } from 'vue';
  import { Button, Menu, MenuItem, Dropdown, Card, Input, Radio, Select, SelectOption, RangePicker, MenuProps } from 'ant-design-vue';
  import { NConfigProvider, zhCN, dateZhCN } from 'naive-ui';

  import ThemeWrapper from '/@/WF/Comm/ThemeWrapper.vue';
  import ToolbarStyle from '/@/WF/CCForm/ToolbarStyle.vue';
  import ToolbarBill from '/@/CCFast/CCBill/ToolbarBill.vue';
  import WebUser from '/@/bp/web/WebUser';
  import GlobalThemeOverrides from '/@/theme/naive-ui/GlobalThemeOverrides';
  import { IsMobile } from '/@/utils/gener/StringUtils';

  import type { DateConditionDef, KeyWordConditionDef, SelectConditionDef, ToolbarButtonDef } from '/@/components/SearchComponent/src/types';

  const { Group: RadioGroup, Button: RadioButton } = Radio;

  // Props 定义
  const props = defineProps({
    buttonList: {
      type: Array as PropType<ToolbarButtonDef[]>,
      default: () => [],
    },
    keywordList: {
      type: Array as PropType<KeyWordConditionDef[]>,
      default: () => [],
    },
    dateList: {
      type: Array as PropType<DateConditionDef[]>,
      default: () => [],
    },
    selectList: {
      type: Array as PropType<SelectConditionDef[]>,
      default: () => [],
    },
    displayButtonAsDropdown: {
      type: Boolean,
      default: false,
    },
    params: {
      type: Object,
      default: () => ({}),
    },
    displayMode: {
      type: String,
      default: 'table',
    },
    isShowSetting: {
      type: Boolean,
      default: true,
    },
    billState: {
      type: Number,
      default: 0,
    },
    pageType: {
      type: String,
      default: '',
    },
    compomentType: {
      type: String,
      default: '',
    },
  });

  // Events 定义
  const emit = defineEmits(['GroupInitPage', 'view-as-rpt', 'view-as-table', 'open-design', 'update-first-ddl', 'open-entity-design', 'open-bill-design', 'open-single-design']);

  // 基础状态
  const isMobile = IsMobile();

  // 计算属性 - 页面类型判断
  const isSpecialPageType = computed(() => props.pageType === 'MyBill' || props.pageType === 'MyEntityNoName');

  // 计算属性 - 按钮分类
  const MAIN_ACTION_NAMES = ['查询', '分析', '报表'];
  const DIRECT_ACTION_NAMES = ['新建', '删除', 'FlowBaseData', 'FlowEtc', 'FlowHostBill', 'FlowSingleCopyData'];

  const queryButtons = computed(() => props.buttonList.filter((btn) => btn.name === '查询'));

  const reportButtons = computed(() => props.buttonList.filter((btn) => btn.name === '报表' && btn?.isZD == 0 && !isMobile));

  const analysisButtons = computed(() => props.buttonList.filter((btn) => btn.name === '分析'));

  const directActionButtons = computed(() => props.buttonList.filter((btn) => DIRECT_ACTION_NAMES.includes(btn.name) || DIRECT_ACTION_NAMES.includes(btn.MethodModel)));

  const dropdownZDButtons = computed(() =>
    props.buttonList.filter((btn) => !['新建', '查询', '分析', '删除'].includes(btn.name) && !DIRECT_ACTION_NAMES.includes(btn?.MethodModel) && btn?.isZD == 1),
  );
  // const dropdownButtons = computed(() =>
  //   props.buttonList.filter((btn) => !['新建', '查询', '分析', '删除', '报表'].includes(btn.name) && !DIRECT_ACTION_NAMES.includes(btn.MethodModel)),
  // );
  const dropdownNoZDButtons = computed(() =>
    props.buttonList.filter((btn) => !['新建', '查询', '分析', '删除', '报表'].includes(btn.name) && !DIRECT_ACTION_NAMES.includes(btn?.MethodModel) && btn?.isZD == 0),
  );
  const otherActionButtons = computed(() => props.buttonList.filter((btn) => !MAIN_ACTION_NAMES.includes(btn.name)));

  // 计算属性 - 显示控制
  const hasFirstSelect = computed(() => Array.isArray(props.selectList) && props.selectList.length > 0 && props.selectList[0].key === 'date-query-key');
  const handleChangeEvent = (selectCondition: SelectConditionDef) => {
    if (typeof selectCondition.onChange === 'function') {
      selectCondition.onChange(selectCondition.value);
    }
  };
  const hasMainActions = computed(() => queryButtons.value.length > 0 || reportButtons.value.length > 0);

  const hasOtherButtons = computed(() => Array.isArray(props.buttonList) && props.buttonList.some((btn) => !MAIN_ACTION_NAMES.includes(btn.name)));

  const showDesignButton = computed(() => WebUser.No === 'admin' && (!props.params.IsHideDesign || props.params.IsHideDesign != 1));

  const otherSelectList = computed(() => props.selectList.slice(1).filter((item) => item.key !== 'date-query-key'));

  // 第一个下拉选择的双向绑定
  const firstSelectVal = computed({
    get() {
      return hasFirstSelect.value ? props.selectList[0].value : '';
    },
    set(val) {
      emit('update-first-ddl', val);
    },
  });

  // 事件处理
  const viewAsTable = async (button: ToolbarButtonDef) => {
    if (props.displayMode === 'group') {
      emit('GroupInitPage');
      return;
    }

    if (props.displayMode === 'rpt') {
      emit('view-as-rpt');
      return;
    }

    await button?.onClick!();

    if (props.displayMode !== 'table') {
      emit('view-as-table');
    }
  };

  const designSkip = () => {
    if (props.compomentType === 'SearchDBList') {
      emit('open-design');
      return;
    }

    const url = `/#/WF/Designer/Form?FrmID=${props.params.FrmID}`;
    window.open(url);
  };

  const handleMenuClick: MenuProps['onClick'] = async (e) => {
    if (e.key == 'design') {
      designSkip();
      return;
    }
    if (e.key == 'search' || e.key == 'button' || e.key == 'data') {
      if (props.compomentType == 'SearchBill') {
        emit('open-bill-design');
      } else if (props.compomentType == 'SearchEntityNoName') {
        emit('open-entity-design');
      }
      return;
    }
  };

  /**
   * 查询：枚举下拉设置背景色
   */
  const getEnumOptionColor = (option: any) => {
    const color = option?.color !== undefined && option.color !== '#fff' ? option.color : 'black';
    return { color };
  };
</script>

<style lang="less" scoped>
  .search-card {
    border-radius: 0;
    background-color: #f9f9f9;
    border: none;
    :deep(.ant-card-body) {
      padding: 5px 10px;
      background-color: #fff;
    }
  }

  .search-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .search-content {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      justify-content: flex-start;

      &.auto-width {
        width: auto;
      }

      .search-item {
        margin-top: 6px;
        margin-bottom: 6px;
        margin-left: 6px;
        width: 130px;

        // 日期选择器
        &.date-picker {
          width: 20%;
          min-width: 200px;
          max-width: 240px;
        }

        // 条件选择器
        &.condition {
          // display: flex;
          // align-items: center;
          // width: 25%;
          // min-width: 200px;
          // max-width: 240px;

          .label {
            min-width: 80px;
            text-align: center;
            height: 32px;
            line-height: 32px;
          }
        }
      }
    }

    .main-actions {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }

    .toolbar-area {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 15px;
    }

    .action-buttons {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex: 0.2;

      &.mobile {
        margin-left: 0;
      }

      .menu-item {
        text-align: center;
        width: 100px;
      }
    }

    :deep(.ant-btn) {
      border-radius: 5px;
    }
  }
</style>
