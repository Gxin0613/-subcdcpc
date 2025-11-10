<template>
  <div class="list-picker-mobile">
    <!-- 搜索和筛选区域 -->
    <div class="search-filter-area">
      <VantSearch
        v-if="isHaveSearchKey"
        v-model="formItems['Key']"
        :fixed="true"
        placeholder="请输入搜索关键词"
        background="#4356ff"
        @search="onSearch"
        @cancel="onCancel"
        @update:model-value="onSearch"
        class="search"
      />

      <!-- 选项选择器 -->
      <!-- <VanPopup v-model:show="showOptionPopup" position="bottom" round>
        <VanPicker :columns="currentOptions" @confirm="onOptionConfirm" @cancel="showOptionPopup = false" />
      </VanPopup> -->

      <!-- 日期选择器 -->
      <!-- <VanPopup v-model:show="showDatePopup" position="bottom">
        <VanDatePicker v-if="currentDateType === 'date'" type="date" :min-date="minDate" :max-date="maxDate" @confirm="onDateConfirm" @cancel="showDatePopup = false" />
      </VanPopup> -->
    </div>

    <!-- 加载状态 -->
    <VanLoading v-if="loadingList" vertical size="24px">数据加载中...</VanLoading>

    <!-- 数据列表 -->
    <div v-else class="data-list">
      <VanCheckboxGroup v-model="checkedList" @change="onSelectChange">
        <VanCellGroup>
          <VanCell v-for="item in tableData" :key="item.No" clickable @click="toggleItem(item)">
            <template #icon>
              <VanCheckbox :name="item.No" shape="square" />
            </template>
            <template #title>
              <div class="item-content">
                <div v-for="column in columns" :key="column.dataIndex" class="item-field">
                  <span class="field-label">{{ column.title }}：</span>
                  <span class="field-value">{{ item[column.dataIndex] }}</span>
                </div>
              </div>
            </template>
          </VanCell>
        </VanCellGroup>
      </VanCheckboxGroup>

      <!-- 分页 -->
      <!-- <div v-if="isPagination" class="pagination">
        <VanPagination v-model="pageIdx" :items-per-page="pageSize" :total-items="pagination.total" :show-page-size="3" @change="changePage" />
      </div> -->
    </div>

    <!-- 底部操作栏 -->
    <!-- <div class="action-bar">
      <div class="selected-count">已选择 {{ checkedList.length }} 项</div>
      <VanButton type="primary" size="small" @click="confirmSelection">确认选择</VanButton>
    </div> -->
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, computed } from 'vue';
  import {
    Search as VantSearch,
    Popup as VanPopup,
    Loading as VanLoading,
    CheckboxGroup as VanCheckboxGroup,
    Checkbox as VanCheckbox,
    CellGroup as VanCellGroup,
    Cell as VanCell,
    Field as VanField,
    Picker as VanPicker,
    DatePicker as VanDatePicker,
    Pagination as VanPagination,
    Button as VanButton,
    Icon as VanIcon,
    showToast,
  } from 'vant';
  import DBAccess from '/@/utils/gener/DBAccess';
  import BSEntity from '/@/utils/gener/BSEntity';
  import { SysEnums } from '/@/WF/Admin/FrmLogic/SysEnum/SysEnum';
  import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';
  import WebUser from '/@/bp/web/WebUser';
  import { GetParamsUrl } from '/@/utils/gener/StringUtils';

  const props = defineProps({
    condSql: {
      type: String,
      default: '',
    },
    listSql: {
      type: String,
      default: '',
    },
    fieldText: {
      type: String,
      default: '',
    },
    mypk: {
      type: String,
      default: '',
    },
    isMultiSelect: {
      type: Boolean,
      default: true,
    },
    selectedItems: {
      type: Array,
      default: () => {
        return [];
      },
    },
    refPKVal: {
      type: String,
      default: '0',
    },
    mainData: {
      type: Object,
      default: () => {
        return {};
      },
    },
  });

  interface ConditionItem {
    type: string;
    value: string;
    key: string;
    label: string;
    options: any[];
  }

  interface OptionItem {
    value: any;
    label: string;
  }

  type Key = string | number;

  // 选中的节点
  const checkedList = ref<Key[]>([]);
  const checkInfoList = ref<any[]>([]);
  //其他查询条件集合
  const conditions = ref<ConditionItem[]>([]);
  //查询字段值集合
  const formItems = ref<Record<string, any>>({});
  const columns = ref<Record<string, string>[]>([]);
  const tableData = ref<any[]>([]);
  const mapExt = new BSEntity('BP.Sys.MapExt', props.mypk);
  //是否分页
  const isPagination = ref(false);
  const pageSize = ref(10);
  const pageIdx = ref(1);
  const pagination = ref({
    current: 1,
    defaultPageSize: 10,
    total: 0,
  });
  const loadingList = ref(false);
  const showFilter = ref(false);
  const showOptionPopup = ref(false);
  const showDatePopup = ref(false);
  const currentCondition = ref<ConditionItem | null>(null);
  const currentDateType = ref('date');
  const minDate = ref(new Date(2000, 0, 1));
  const maxDate = ref(new Date(2100, 11, 31));
  const isHaveSearchKey = ref(true);

  // 计算属性
  const currentOptions = computed(() => {
    if (!currentCondition.value) return [];
    return currentCondition.value.options.map((opt) => ({
      text: opt.label,
      value: opt.value,
    }));
  });

  // 方法
  const onSelectChange = (selectedRowKeys: Key[]) => {
    checkedList.value = selectedRowKeys;
    checkInfoList.value = tableData.value.filter((item) => selectedRowKeys.includes(item.No)).map((item) => ({ ...item, OID: 0 }));
  };

  const toggleItem = (item: any) => {
    const index = checkedList.value.indexOf(item.No);
    if (index > -1) {
      checkedList.value.splice(index, 1);
    } else {
      if (props.isMultiSelect) {
        checkedList.value.push(item.No);
      } else {
        checkedList.value = [item.No];
      }
    }
    onSelectChange(checkedList.value);
  };

  const onSearch = () => {
    // pageIdx.value = 1;
    Search();
  };

  const onCancel = () => {
    formItems.value['Key'] = '';
    onSearch();
  };

  const changePage = (page: number) => {
    // pageIdx.value = page;
    Search();
  };

  const showOptionPicker = (condition: ConditionItem) => {
    currentCondition.value = condition;
    showOptionPopup.value = true;
  };

  const showDatePicker = (condition: ConditionItem) => {
    currentCondition.value = condition;
    currentDateType.value = condition.type === 'DTFrom' || condition.type === 'DTTo' ? 'date' : 'datetime';
    showDatePopup.value = true;
  };

  const onOptionConfirm = (value: OptionItem) => {
    if (currentCondition.value) {
      formItems.value[currentCondition.value.key] = value.value;
    }
    showOptionPopup.value = false;
  };

  const onDateConfirm = (value: Date) => {
    if (currentCondition.value) {
      const dateStr = value.toISOString().split('T')[0];
      formItems.value[currentCondition.value.key] = dateStr;
    }
    showDatePopup.value = false;
  };

  const resetFilter = () => {
    conditions.value.forEach((condition) => {
      formItems.value[condition.key] = '';
    });
  };

  const applyFilter = () => {
    showFilter.value = false;
    onSearch();
  };

  const confirmSelection = () => {
    // 可以通过事件发射或者provide/inject将选择结果传递给父组件
    console.log('Selected items:', checkInfoList.value);
    showToast('选择完成');
  };

  const getSelectedOptionLabel = (condition: ConditionItem) => {
    const value = formItems.value[condition.key];
    const option = condition.options.find((opt) => opt.value === value);
    return option ? option.label : '请选择';
  };

  /**
   * 查询数据
   */
  const Search = async () => {
    loadingList.value = true;
    try {
      debugger;
      let listSql = props.listSql;
      formItems.value.PageSize = pageSize.value;
      formItems.value.PageIdx = pageIdx.value;

      const params = { ...props.mainData };
      const str = JSON.stringify(formItems.value);

      console.log('listSql', listSql);
      console.log('params', params);

      if (mapExt.DBType == 0) {
        const data = await mapExt.DoMethodReturnString('GetDataTableByTableSearch', encodeURIComponent(str), encodeURIComponent(JSON.stringify(params)));
        if (typeof data === 'string' && data.includes('err@')) {
          showToast(data.replace('err@', ''));
          tableData.value = [];
          return;
        }

        tableData.value = data.SearchData || [];
        pagination.value.current = pageIdx.value;
        pagination.value.total = data.DTCout?.[0]?.Count || data.SearchData.length;
      }
      if (mapExt.DBType == 1) {
        //转换
        if (listSql?.includes('?') == false) listSql += '?';
        await DBAccess.RunUrlReturnJSON(listSql + GetParamsUrl(str));
        tableData.value = DBAccess.data || [];
        pagination.value.current = pageIdx.value;
        pagination.value.total = DBAccess.data.length;
      }
      if (mapExt.DBType == 2) {
        if (listSql?.includes('(') == false) listSql += '(' + str + ')';
        tableData.value = (await DBAccess.RunFunctionReturnStr(listSql)) || [];
        pagination.value.current = pageIdx.value;
        pagination.value.total = tableData.value.length;
      }
      // 其他数据库类型的处理...
    } catch (error: any) {
      showToast(error.toString());
      console.error(error);
    } finally {
      loadingList.value = false;
    }
  };

  /**
   * 获取查询条件
   */
  const getConditions = async (condSql: string) => {
    // 实现与PC端相同的条件解析逻辑
    // 这里需要根据condSql解析出各种查询条件
  };

  // 生命周期
  onMounted(async () => {
    try {
      loadingList.value = true;

      if (!props.listSql) {
        showToast('请配置数据源');
        return;
      }

      await mapExt.Init();
      formItems.value = {};

      // 设置查询条件
      if (props.condSql) {
        await getConditions(props.condSql);
      }

      if (isHaveSearchKey.value) formItems.value['Key'] = '';

      // 设置列配置
      if (!props.fieldText) {
        columns.value.push({ title: '编码', dataIndex: 'No' }, { title: '名称', dataIndex: 'Name' });
      } else {
        const fields = props.fieldText.replace(/，/g, ',').split(',');
        fields.forEach((item) => {
          const [dataIndex, title] = item.split('=');
          columns.value.push({
            title: title || dataIndex,
            dataIndex: dataIndex,
          });
        });
      }

      await Search();

      if (props.selectedItems) {
        checkedList.value = props.selectedItems as Key[];
      }
    } catch (error: any) {
      showToast(error.toString());
      console.error(error);
    } finally {
      loadingList.value = false;
    }
  });

  defineExpose({
    checkInfoList,
    checkedList,
    confirmSelection,
  });
</script>

<style scoped lang="less">
  .list-picker-mobile {
    height: 100vh;
    display: flex;
    flex-direction: column;

    .search-filter-area {
      background: #fff;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .filter-panel {
      height: 100%;
      display: flex;
      flex-direction: column;

      .filter-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        border-bottom: 1px solid #eee;
        background: #fff;

        span:last-child {
          color: #1989fa;
        }
      }

      .filter-content {
        flex: 1;
        overflow-y: auto;
      }

      .filter-footer {
        padding: 16px;
        border-top: 1px solid #eee;
        background: #fff;
      }
    }
    .search {
      margin-top: 46px;
      padding: 12px 15px;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      z-index: 999;
    }
    .data-list {
      flex: 1;
      overflow-y: auto;
      margin-top: 110px;

      .item-content {
        margin-left: 12px;
        padding: 8px 0;

        .item-field {
          margin-bottom: 4px;

          .field-label {
            font-size: 14px;
          }

          .field-value {
            font-size: 14px;
          }
        }
      }
    }

    .pagination {
      padding: 16px;
      background: #fff;
    }

    .action-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #fff;
      border-top: 1px solid #eee;

      .selected-count {
        color: #666;
        font-size: 14px;
      }
    }
  }

  :deep(.van-cell) {
    .van-cell__icon {
      margin-right: 12px;
      margin-top: 16px;
    }
  }

  :deep(.van-checkbox__icon) {
    font-size: 18px;
  }
  :deep(.van-search__content) {
    border-radius: 10px;
  }
  :deep(.van-search__field) {
    height: 40px;
  }
</style>
