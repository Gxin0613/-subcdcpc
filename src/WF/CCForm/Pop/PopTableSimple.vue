<template>
  <Spin :spinning="loadingList">
    <div class="list-picker">
      <Card style="border-radius: 10px; margin-bottom: 2px">
        <div class="flex">
          <Form layout="inline">
            <FormItem :label="'关键字'">
              <Input v-model:value="searchKey" :placeholder="searchTip" allow-clear @change="validateInputKey" @press-enter="() => Search(listSql, null)" />
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
        bordered
        :scroll="{ y: 400 }"
      />
    </div>
  </Spin>
</template>

<script lang="ts" setup>
  import { Card, Form, FormItem, Input, Button, Table, message, Spin } from 'ant-design-vue';
  import { onMounted, ref, watch } from 'vue';
  import BSEntity from '/@/utils/gener/BSEntity';
  import { GloGenerDBSrc } from '/@/CCFast/GenerDBSrc/GloGenerDBSrc';
  import { GenerDBSrc } from '/@/CCFast/GenerDBSrc/GenerDBSrc';

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
      type: String,
      default: '',
    },
    refPKVal: {
      type: [String, Number],
      default: '',
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
  const checkedNames = ref<string[]>([]);
  //查询字段值集合
  const searchKey = ref('');
  const columns = ref<Record<string, string>[]>([]);
  const tableData = ref<any[]>([]); //数据集合
  const mapExt = new BSEntity('BP.Sys.MapExt', props.mypk);
  const searchTip = ref('');

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
    const params = {};
    for (const key in props.rowData) {
      params[key] = props.rowData[key];
    }
    for (const key in props.mainData) {
      params[key] = props.mainData[key];
    }
    if (!!searchKey.value.trim()) params['Key'] = searchKey.value;
    try {
      //显示初始化数据
      if (searchKey.value.trim() == '') {
        const mypk = 'Frm.' + props.mapExt.FK_MapData + '_' + props.mapExt.AttrOfOper + '.Pop.TableInit';
        const generDBSrc = new GenerDBSrc();
        generDBSrc.MyPK = mypk;
        if ((await generDBSrc.RetrieveFromDBSources()) == 1 && generDBSrc.DoWay != 'None') {
          const data = await GloGenerDBSrc.GenerData_ByMyPK_WithJson(mypk, params);
          tableData.value = data || [];
        }
        return;
      }
      const mypk = 'Frm.' + props.mapExt.FK_MapData + '_' + props.mapExt.AttrOfOper + '.Pop.TableSearch';
      const data = await GloGenerDBSrc.GenerData_ByMyPK_WithJson(mypk, params);
      tableData.value = data || [];
      return;
    } catch (e) {
      message.error(e);
      tableData.value = [];
    }
  };
  onMounted(async () => {
    try {
      loadingList.value = true;
      let fieldText = props.fieldText;
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
      await Search();
      if (props.selectedItems) checkedList.value = props.selectedItems.split(',');
    } catch (e: any) {
      message.error(e.toString());
      console.error(e);
    } finally {
      loadingList.value = false;
    }
  });
  const validateInputKey = () => {
    let value: string = (searchKey.value || '') as string;
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
      searchKey.value = value;
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
</style>
