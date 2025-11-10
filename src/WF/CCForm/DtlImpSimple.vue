<template>
  <Spin :spinning="loadingList">
    <div class="list-picker">
      <Card style="border-radius: 10px; margin-bottom: 2px">
        <div class="flex">
          <Form layout="inline">
            <FormItem :label="'关键字'">
              <Input v-model:value="searchKey" :placeholder="searchTip" allow-clear @press-enter="() => Search(listSql, null)" />
            </FormItem>
            <FormItem>
              <Button type="primary" @click="Search(listSql, null)">{{ '查询' }}</Button>
            </FormItem>
          </Form>
        </div>
      </Card>
      <Table
        :row-selection="{ type: props.isMultiSelect == true ? 'checkbox' : 'radio', selectedRowKeys: checkedList, onChange: onSelectChange }"
        rowKey="No"
        :columns="columns"
        :dataSource="tableData"
        :pagination="false"
        :scroll="{ y: 400 }"
      />
    </div>
  </Spin>
</template>

<script lang="ts" setup>
  import { Card, Form, FormItem, Input, Button, Table, message, Spin } from 'ant-design-vue';
  import { onMounted, ref } from 'vue';
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

  const onSelectChange = (selectedRowKeys: Key[]) => {
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
  };
  onMounted(async () => {
    try {
      loadingList.value = true;
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
</style>
