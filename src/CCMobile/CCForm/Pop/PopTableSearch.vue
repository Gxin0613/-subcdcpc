<template>
  <Spin :spinning="loadingList">
    <div class="list-picker">
      <Card style="border-radius: 10px; margin-bottom: 2px">
        <div>
          <Form layout="inline">
            <FormItem :label="'关键字'">
              <Input v-model:value="formItems['Key']" :placeholder="searchTip" allow-clear @change="validateInputKey('Key')" />
            </FormItem>
            <template v-for="condition in conditions" :key="condition.key">
              <FormItem v-if="condition.type === 'input'" :label="condition.label">
                <Input v-model:value="formItems[condition.key]" @change="validateInputKey(condition.key)" />
              </FormItem>
              <FormItem v-else-if="condition.type === 'DTFrom'" :label="condition.label">
                <DatePicker v-model:value="formItems[condition.key]" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
              </FormItem>
              <FormItem v-else-if="condition.type === 'DTTo'" :label="condition.label">
                <DatePicker v-model:value="formItems[condition.key]" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
              </FormItem>
              <FormItem v-else :label="condition.label">
                <Select v-model:value="formItems[condition.key]" style="width: 120px" :listHeight="30 * condition.options.length">
                  <SelectOption v-for="item in condition.options" :key="item.value" :value="item.value" :title="item.label">{{ item.label }}</SelectOption>
                </Select>
              </FormItem>
            </template>
            <FormItem>
              <Button type="primary" @click="Search">{{ '查询' }}</Button>
            </FormItem>
          </Form>
        </div>
      </Card>
      <Table
        :row-selection="{ type: props.isMultiSelect == true ? 'checkbox' : 'radio', selectedRowKeys: checkedList, onChange: onSelectChange }"
        rowKey="No"
        :columns="columns"
        :dataSource="tableData"
        :pagination="pagination"
        border
        :scroll="{ y: 400 }"
        @change="ChangePageSizeORIdx"
      />
    </div>
  </Spin>
</template>

<script lang="ts" setup>
  import { Card, Form, FormItem, Input, Select, SelectOption, DatePicker, Button, Table, message, Spin } from 'ant-design-vue';
  import { onMounted, ref, watch } from 'vue';
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
      default: false,
    },
    selectedItems: {
      type: String,
      default: '',
    },
    refPKVal: {
      type: Number,
      default: 0,
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
  interface conditionItem {
    type: string;
    value: string;
    key: string;
    label: string;
    options: any[];
  }
  type Key = string | number;
  // 选中的节点
  const checkedList = ref<Key[]>([]);
  const checkedNames = ref<string[]>([]);
  //其他查询条件集合
  const conditions = ref<conditionItem[]>([]);
  //查询字段值集合
  const formItems = ref<Record<string, string | number>>({});
  const columns = ref<Record<string, string>[]>([]);
  const tableData = ref<any[]>([]); //数据集合
  const mapExt = new BSEntity('BP.Sys.MapExt', props.mypk);
  const searchTip = ref('');
  const pageSize = ref(10);
  const pageIdx = ref(1);
  const pagination = ref({
    current: 1,
    defaultPageSize: 10,
    total: 0,
    showTotal: () => `共 ${0} 条`,
  });
  watch(
    () => checkedList.value,
    (val) => {
      const tempArr: string[] = [];
      for (const option of tableData.value) {
        if (val.includes(option.No)) {
          tempArr.push(option.Name);
        }
      }
      checkedNames.value = tempArr;
    },
  );

  const onSelectChange = (selectedRowKeys: Key[]) => {
    checkedList.value = selectedRowKeys;
  };
  const loadingList = ref(false);

  /**
   * 查询
   */
  const Search = async () => {
    let listSql = props.listSql;
    formItems.value.PageSize = pageSize.value;
    formItems.value.PageIdx = pageIdx.value;
    const params = {};
    for (const key in props.rowData) {
      params[key] = props.rowData[key];
    }
    for (const key in props.mainData) {
      params[key] = props.mainData[key];
    }
    const str = JSON.stringify(formItems.value);
    if (mapExt.DBType == 0) {
      const data = await mapExt.DoMethodReturnString('GetDataTableByTableSearch', encodeURIComponent(str), encodeURIComponent(JSON.stringify(params)));
      if (typeof data === 'string' && data.includes('err@')) {
        message.error(data);
        tableData.value = [];
        return;
      }
      tableData.value = data.SearchData || [];

      pagination.value.current = pageIdx.value;
      pagination.value.total = data.DTCout[0].Count;
      pagination.value.showTotal = () => `共 ${data.DTCout[0].Count} 条`;
    }
    if (mapExt.DBType == 1) {
      //转换
      if (listSql?.includes('?') == false) listSql += '?';
      await DBAccess.RunUrlReturnJSON(props.listSql + GetParamsUrl(formItems.value));
      tableData.value = DBAccess.data || [];
    }
    if (mapExt.DBType == 2) {
      const str = JSON.stringify(formItems.value);
      if (listSql?.includes('(') == false) listSql += '(' + str + ')';
      tableData.value = (await DBAccess.RunFunctionReturnStr(listSql)) || [];
    }
  };

  const ChangePageSizeORIdx = async (pagination) => {
    pageIdx.value = pagination.current;
    await Search();
  };

  onMounted(async () => {
    try {
      loadingList.value = true;
      const { listSql, condSql } = props;
      let fieldText = props.fieldText;
      if (!listSql) {
        message.error('请配置数据源');
        return;
      }
      await mapExt.Init();
      searchTip.value = mapExt.getPara('SearchTip') || '请输入关键字';
      formItems.value = {};
      formItems.value['Key'] = '';
      //设置查询条件
      if (!!condSql) {
        await getConditions(condSql);
      }
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
      const isFirstLoad = mapExt.getPara('IsFirstLoad') || true;
      if (isFirstLoad == true) await Search();
      if (props.selectedItems) checkedList.value = props.selectedItems.split(',');
    } catch (e: any) {
      message.error(e.toString());
      console.error(e);
    } finally {
      loadingList.value = false;
    }
  });
  /**
   * 获取查询条件
   * @param condSql
   */
  const isHaveSearchKey = ref(true);
  const getConditions = async (condSql) => {
    condSql = condSql.replaceAll(/[\r\n]/g, '');
    const conds = condSql.split('$');
    let isDateFrom = false;
    let dateFiled = '';
    for (const cond of conds) {
      if (!!cond) {
        let conditionItem: conditionItem = {
          type: '',
          value: '',
          key: '',
          label: '',
          options: [],
        };
        let condItems = cond.split('#');
        if (condItems.length == 3) {
          for (const condItem of condItems) {
            if (condItem.includes('Para=')) conditionItem.key = condItem.replace('Para=', '');
            if (condItem.includes('Label=')) conditionItem.label = condItem.replace('Label=', '');
            if (condItem.includes('ListURL=')) {
              conditionItem.type = 'ListURL';
              conditionItem.value = condItem.replace('ListURL=', '');
              await DBAccess.RunUrlReturnJSON(conditionItem.value);
              conditionItem.options = DBAccess.data;
            }
            if (condItem.includes('ListSQL=')) {
              conditionItem.type = 'ListSQL';
              conditionItem.value = condItem.replace('ListSQL=', '');

              const data = await mapExt.DoMethodReturnString('GetDataTableByTag1', conditionItem.key, '', props.refPKVal);
              if (typeof data === 'string') {
                message.info(data);
                conditionItem.options = [];
              } else {
                conditionItem.options = data.map((item) => {
                  return {
                    value: item.No || item.NO || item.no,
                    label: item.Name || item.NAME || item.name,
                  };
                });
                conditionItem.options.unshift({
                  value: '',
                  label: '全部',
                });
              }
            }
            if (condItem.includes('ListFuncName=')) {
              conditionItem.type = 'ListFuncName';
              conditionItem.value = condItem.replace('ListFuncName=', '');
              const data = await DBAccess.RunFunctionReturnStr(conditionItem.value);
              if (typeof data === 'string') {
                message.info(data);
                conditionItem.options = [];
              } else {
                conditionItem.options = data.map((item) => {
                  return {
                    value: item.No || item.NO || item.no,
                    label: item.Name || item.NAME || item.name,
                  };
                });
                conditionItem.options.unshift({
                  value: '',
                  label: '全部',
                });
              }
            }
            if (condItem.includes('EnumKey=')) {
              conditionItem.type = 'EnumKey';
              conditionItem.value = condItem.replace('EnumKey=', '');
              const enums = new SysEnums();
              if (WebUser.CCBPMRunModel === CCBPMRunModel.Single) await enums.Retrieve('EnumKey', conditionItem.value);
              else await enums.Retrieve('EnumKey', conditionItem.value, 'OrgNo', WebUser.OrgNo);
              conditionItem.options = enums.map((item) => {
                return {
                  value: item.IntKey,
                  label: item.Lab,
                };
              });
              conditionItem.options.unshift({
                value: '',
                label: '全部',
              });
            }
            if (condItem.includes('DefVal=')) {
              if (isDateFrom == false) {
                conditionItem.type = 'DTFrom';
                dateFiled = conditionItem.key;
                conditionItem.key = 'DTFrom_' + conditionItem.key;
                conditionItem.value = condItem.replace('DefVal=', '');
                isDateFrom = true;
              } else {
                conditionItem.type = 'DTTo';
                conditionItem.value = condItem.replace('DefVal=', '');
                if (conditionItem.key != dateFiled && conditionItem.key != 'DTTo') message.error('请检查配置时间的同一字段的先后顺序');
                else {
                  conditionItem.key = 'DTTo_' + conditionItem.key;
                }
                isDateFrom = false;
                dateFiled = '';
              }
            }
          }
          formItems.value[conditionItem.key] = '';
          conditions.value.push(conditionItem);
        }
        if (condItems.length == 2) {
          for (const condItem of condItems) {
            if (condItem.includes('Para=')) conditionItem.key = condItem.replace('Para=', '');
            if (condItem.includes('Label=')) conditionItem.label = condItem.replace('Label=', '');
            conditionItem.type = 'input';
            if (!conditionItem.key || !conditionItem.label) continue;
            formItems.value[conditionItem.key] = '';
            conditions.value.push(conditionItem);
            isHaveSearchKey.value = false;
          }
        }
      }
    }
  };
  const validateInputKey = (key: string) => {
    let value: string = (formItems.value[key] || '') as string;
    if (!!value) {
      const forbiddenChars = ';*--\'"';
      let isHave = false;
      for (const c of forbiddenChars) {
        if (value.includes(c)) {
          isHave = true;
          value = value.replaceAll(c, '');
        }
      }
      if (isHave) message.warn('禁止输入含有' + forbiddenChars + '的字符,防止SQL注入');
      formItems.value[key] = value;
    }
  };
  defineExpose({
    checkedList,
    checkedNames,
  });
</script>

<style scoped lang="less">
  .form-item {
    line-height: 43px;
  }
  :deep(.ant-col) {
    width: auto;
  }
  :deep(.ant-form-inline .ant-form-item > .ant-form-item-label, .ant-form-inline .ant-form-item > .ant-form-item-control) {
    flex: none !important;
  }
</style>
