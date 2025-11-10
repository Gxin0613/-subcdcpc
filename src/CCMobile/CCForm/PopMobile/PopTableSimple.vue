<template>
  <Spin :spinning="loadingList">
    <div class="list-picker">
      <Card style="border-radius: 10px; margin-bottom: 2px">
        <div class="flex">
          <Form layout="inline">
            <FormItem :label="'关键字'">
              <Input v-model:value="searchKey" :placeholder="searchTip" allow-clear @pressEnter="Search" />
            </FormItem>
            <FormItem>
              <Button type="primary" @click="Search(props.listSql)">{{ '查询' }}</Button>
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
        border
        :scroll="{ y: 400 }"
      />
    </div>
  </Spin>
</template>

<script lang="ts" setup>
  import { Card, Form, FormItem, Input, Button, Table, message, Spin } from 'ant-design-vue';
  import { onMounted, ref, watch } from 'vue';
  import DBAccess from '/@/utils/gener/DBAccess';
  import BSEntity from '/@/utils/gener/BSEntity';
  import { GetParamsUrl } from '/@/utils/gener/StringUtils';
import { GloGenerDBSrc } from '/@/CCFast/GenerDBSrc/GloGenerDBSrc';
import { showFailToast } from 'vant';
import { GenerDBSrc } from '/@/CCFast/GenerDBSrc/GenerDBSrc';

  const props = defineProps({
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
    params['Key'] = searchKey.value;
     try{
      //显示初始化数据
      if (searchKey.value.trim() == '') {
        const mypk = 'Frm.'+props.mapExt.FK_MapData+'_'+props.mapExt.AttrOfOper+".Pop.TableInit";
        const generDBSrc = new GenerDBSrc();
        generDBSrc.MyPK = mypk;
        if ((await generDBSrc.RetrieveFromDBSources()) == 1 && generDBSrc.DoWay != 'None') {
          const data = await GloGenerDBSrc.GenerData_ByMyPK_WithJson(mypk, params);
          tableData.value = data || [];
        }
        return;
      }
      const mypk = 'Frm.'+props.mapExt.FK_MapData+'_'+props.mapExt.AttrOfOper+".Pop.TableSearch";
      const data =  await GloGenerDBSrc.GenerData_ByMyPK_WithJson(mypk,params);
      tableData.value = data || [];
      return;
    }catch(e){
      showFailToast(e.toString());
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
      Search();
      if (props.selectedItems) checkedList.value = props.selectedItems.split(',');
    } catch (e: any) {
      showFailToast(e.toString());
      console.error(e);
    } finally {
      loadingList.value = false;
    }
  });

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
