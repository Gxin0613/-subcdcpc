<template>
  <div class="list-picker">
    <VantSearch
      v-model="searchKey"
      :fixed="true"
      :placeholder="'请输入搜索关键词'"
      background="#4356ff"
      @search="onSearch"
      @cancel="onSearch"
      @update:model-value="onSearch"
      class="search"
    />
    <VantLoading v-if="loading" vertical size="70px">数据加载中...</VantLoading>
    <CheckboxGroup v-else v-model="checkList" class="checkbox">
      <template v-for="(item, idx) in tableData" :key="idx">
        <div class="vant-address-item">
          <div class="vant-cell vant-cell--borderless">
            <Checkbox :name="item.No" shape="square" v-model="item.isChecked" @click="onSelectChange(checkList)" class="checked" />
            <div class="vant-cell__value vant-cell__value--alone">
              <span v-for="column in columns" :key="column.No">
                <div class="vant-gl-link-text">
                  <span>{{ column.title }}:{{ item[column.dataIndex] }}</span>
                </div>
              </span>
            </div>
          </div>
        </div>
      </template>
    </CheckboxGroup>
    <VantPopup v-model:show="ShowFailToast.visible" round closeable :style="{ padding: '64px' }">
      <p>{{ ShowFailToast.msg }}</p>
    </VantPopup>
  </div>
</template>

<script lang="ts" setup>
  import { message } from 'ant-design-vue';
  import { Checkbox, CheckboxGroup, Search as VantSearch, Loading as VantLoading, Popup as VantPopup } from 'vant';
  import { onMounted, ref, reactive } from 'vue';
  import DBAccess from '/@/utils/gener/DBAccess';
  import BSEntity from '/@/utils/gener/BSEntity';
  import { GetParamsUrl } from '/@/utils/gener/StringUtils';

  const props = defineProps({
    initSql: {
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
      default: false,
    },
    selectedItems: {
      type: Array,
      default: () => {
        return [];
      },
    },
    refPKVal: {
      type: [Number, String],
      default: '0',
    },
    mapExt: {
      type: Object,
      default: () => {
        return {};
      },
    },
    rowData: {
      type: Object,
      default: () => {
        return {};
      },
    },
    mainData: {
      type: Object,
      default: () => {
        return {};
      },
    },
  });

  type Key = string | number;
  // 选中的节点
  const checkedList = ref<Key[]>([]);
  const checkInfoList = ref<any[]>([]);
  //查询字段值集合
  const searchKey = ref('');
  const columns = ref<Record<string, string>[]>([]);
  const tableData = ref<any[]>([]); //数据集合
  const mapExt = new BSEntity('BP.Sys.MapExt', props.mypk);
  const searchTip = ref('');

  const checkList = ref([]);

  //加载
  const loading = ref(false);

  //显示错误信息
  const ShowFailToast = reactive({
    visible: false,
    msg: '',
  });

  const onSelectChange = (selectedRowKeys: Key[]) => {
//    debugger;
    checkedList.value = selectedRowKeys;
    checkInfoList.value = tableData.value.filter((item) => {
      item['OID'] = 0;
      if (selectedRowKeys.includes(item.No)) {
        return item;
      }
      // return selectedRowKeys.includes(item.No);
    });
    console.log('checkInfoList', checkInfoList.value);
  };
  const loadingList = ref(false);

  /**
   * 查询
   */
  const Search = async (sql, field) => {
    loading.value = true;
  //  debugger;
    try {
      const params = {};
      for (const key in props.rowData) {
        params[key] = props.rowData[key];
      }
      for (const key in props.mainData) {
        params[key] = props.mainData[key];
      }
      if (searchKey.value.trim() == '') {
        sql = props.initSql;
        field = 'Tag1';
      } else {
        params['Key'] = searchKey.value;
      }
      if (mapExt.DBType == 0) {
        if (!field) field = 'Tag2';
        const data = await mapExt.DoMethodReturnString('GetDataTableByTableSimple', encodeURIComponent(JSON.stringify(params)), field);
        if (typeof data === 'string' && data.includes('err@')) {
          message.error(data);
          tableData.value = [];
          return;
        }
        tableData.value = data || [];
      }
      if (mapExt.DBType == 1) {
        //转换
        if (sql?.includes('?') == false) sql += '?';
        await DBAccess.RunUrlReturnJSON(sql + GetParamsUrl(searchKey.value));
        tableData.value = DBAccess.data || [];
      }
      if (mapExt.DBType == 2) {
        if (sql?.includes('(') == false) sql += '(' + searchKey.value + ')';
        tableData.value = (await DBAccess.RunFunctionReturnStr(sql)) || [];
      }
    } catch (e: any) {
      ShowFailToast.visible = true;
      ShowFailToast.msg = e;
    } finally {
      loading.value = false;
    }
  };
  onMounted(async () => {
    try {
      loadingList.value = true;
      checkList.value = [];
      const { listSql, initSql } = props;
      let fieldText = props.fieldText;
      if (!listSql) {
        message.error('请配置查询数据源');
        return;
      }
      await mapExt.Init();
      searchTip.value = mapExt.getPara('SearchTip') || '请输入关键字';
      if (!fieldText) {
        columns.value.push({
          title: '编码',
          dataIndex: 'No',
        });
        columns.value.push({
          title: '名称',
          dataIndex: 'Name',
        });
      } else {
        fieldText = fieldText.replace(/，/g, ',');
        fieldText.split(',').forEach((item) => {
          const strs = item.split('=');
          if (strs.length == 2) {
            columns.value.push({
              title: strs[1],
              dataIndex: strs[0],
            });
          }
          if (strs.length == 1) {
            columns.value.push({
              title: strs[0],
              dataIndex: strs[0],
            });
          }
        });
      }
      //如果初始化数据源为空初始化数据为空
      if (!!initSql) Search(initSql, 'Tag1');
      if (props.selectedItems.length > 0) checkedList.value = props.selectedItems;
    } catch (e: any) {
      message.error(e.toString());
      console.error(e);
    } finally {
      loadingList.value = false;
    }
  });

  /**
   * 查询 我发起的
   */
  const onSearch = () => {
    //清空之前的搜索结果
    const list = ref<any[]>([]);
    if (searchKey.value) {
      const ar = JSON.parse(JSON.stringify(tableData.value));
      const str = new RegExp(searchKey.value, 'i');
      ar.forEach((item) => {
        for (const key in item) {
          if (str.test(item[key])) {
            list.value.push(item);
            break;
          }
        }
      });
      tableData.value = list.value;
    } else {
      const { initSql } = props;
      if (!!initSql) Search(initSql, 'Tag1');
    }
  };

  defineExpose({
    checkInfoList,
    checkedList,
  });
</script>

<style scoped lang="less">
  .form-item {
    line-height: 43px;
  }
  :deep(.ant-col) {
    width: auto;
  }
  .checked {
    margin-right: 10px;
  }
  .vant-cell--borderless {
    display: flex;
    align-items: flex-start;
  }
  .vant-address-item {
    padding: 10px;
    box-shadow: 0px 0px 4px 0px #cccccc57;
    margin-bottom: 10px;
    background-color: #fff;
    border-radius: 10px;
  }
  .vant-gl-link-text {
    display: flex;
    align-items: center;
    margin-bottom: var(--van-padding-xs);
    font-size: var(--van-font-size-mg);
    line-height: var(--van-line-height-lg);
    font-weight: bold;
  }
  .search {
    margin-top: 45px;
    padding: 12px 15px;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 999;
  }
  .checkbox {
    margin-top: 110px;
  }
  :deep(.van-search__content) {
    border-radius: 10px;
  }
  :deep(.van-search__field) {
    height: 40px;
  }
  :deep(.van-loading--vertical) {
    padding-top: 50%;
  }
</style>
