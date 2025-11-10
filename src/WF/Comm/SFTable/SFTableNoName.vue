<template>
  <div class="en-wrapper">
    <ThemeWrapper>
      <Spin :spinning="loading">
        <div v-if="errorObj.hasError" class="ant-tag-red">
          {{ errorObj.tips }}
        </div>
        <div class="p-1" v-else>
          <div class="p-4" style="box-sizing: border-box; text-align: right; background-color: white">
            <!-- <Button type="primary" style="margin-right: 20px" v-if="HisUAC.IsInsert" @click="add">{{'新增'}}</Button> -->
            <Button type="primary" @click="Save" class="btn">{{'保存'}}</Button>
            <Button type="primary" @click="Insert" class="btn">{{'新增'}}</Button>
            <Button type="primary" @click="Delete" class="btn">{{'删除'}}</Button>
          </div>
          <BasicTable @register="registerTable">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key == 'No'">
                <Input v-if=" NoGenerModel===0" v-model:value="record.No" />
                <span v-else>{{ record.No }}</span>
              </template>
              <template v-if="column.key == 'Name'">
                <Input v-model:value="record.Name" />
              </template>
            </template>
          </BasicTable>
        </div>
      </Spin>
    </ThemeWrapper>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { Input, Spin, Button, message } from 'ant-design-vue';
  import BSEntity from '/@/utils/gener/BSEntity';
  import { useTable, BasicTable } from '/@/components/Table';
  import ThemeWrapper from '/@/WF/Comm/ThemeWrapper.vue';
  import BSEntities from "/@/utils/gener/BSEntities";
import HttpHandler from '/@/utils/gener/HttpHandler';

  const fk_sftable = ref();
  const loading = ref(false);
  const data = ref<any>([]); //表格数据
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const selectRowKeys = ref<any>([]);
  const NoGenerModel = ref();
  const isSave = ref(true);
  const currenNo = ref();
  const newNode =ref(0);
  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
  });
  const route = useRoute();
  const TableColumn = [
    {
      title: '编号',
      dataIndex: 'No',
      key: 'No',
    },
    {
      title: '名称',
      dataIndex: 'Name',
      key: 'Name',
    },
  ];
  const InitPage = async () => {
    console.log({props})
    fk_sftable.value = props.params.FK_SFTable || route.query.FK_SFTable || props.params.PKVal;
    try {
      loading.value = true;
      //获取数据
      const en = new BSEntity('BP.Sys.SFTable', fk_sftable.value);
      en.No = fk_sftable.value;
      await en.Init();
      await en.Retrieve();
      NoGenerModel.value = en.NoGenerModel;
      data.value = await en.DoMethodReturnJSON('GenerDataOfJson');
    } catch (e: any) {
      errorObj.hasError = true;
      errorObj.tips = e;
      message.error(`获取数据列表失败：${e}`);
      loading.value = false;
      return;
    } finally {
      loading.value = false;
    }
  };

  //表格渲染
  const [registerTable, { clearSelectedRowKeys }] = useTable({
    title: '',
    rowKey: 'No',
    rowSelection: {
      type: 'checkbox',
      onChange: (keys) => {
        selectRowKeys.value = keys;
      },
    },
    showIndexColumn: true,
    dataSource: data,
    columns: TableColumn,
    bordered: true,
    pagination: false,
    maxHeight: 700,
    formConfig: {
      labelWidth: 120,
      // schemas: ensFormSchema,
      autoSubmitOnEnter: false,
      showResetButton: false,
      showSubmitButton: false,
      // showActionButtonGroup: false,
    },
  });

  //保存
  const Save = async () => {
    try {
      loading.value = true;
      const en = new BSEntity('BP.Sys.SFTable', fk_sftable.value);
      en.No = fk_sftable.value;
      await en.Init();
      await en.Retrieve();
      const oldData = await en.DoMethodReturnJSON('GenerDataOfJson');
      const saves:any[] = [];
      if(NoGenerModel.value === 0){
        //删除数据重新保存
        const ens = new BSEntities('BP.Sys.SFTableDtls');
        await ens.Delete('FK_SFTable',  fk_sftable.value)
      }
      data.value.forEach(async (item, index) => {
        if (!item.MyPK) {
          if (item.Name) {
            if (NoGenerModel.value === 1 || NoGenerModel.value === 4)
          {
            saves.push(en.DoMethodReturnString('SaveData', item.No, item.Name, fk_sftable.value));
          }
            else if (NoGenerModel.value === 2) {
              //全拼编号
              const no = await ParsePinYin(item.Name, true);
              saves.push(en.DoMethodReturnString('SaveData', no, item.Name, fk_sftable.value));
            } else if (NoGenerModel.value === 3) {
              //简拼编号
              const no = await ParsePinYin(item.Name, false);
              saves.push(en.DoMethodReturnString('SaveData', no, item.Name, fk_sftable.value));
            } else if (NoGenerModel.value === 0) {
              saves.push(en.DoMethodReturnString('SaveData', item.No, item.Name, fk_sftable.value));
            }
          }
        } else if (item.Name != oldData[index].Name) {
          saves.push(en.DoMethodReturnString('SaveData', item.No, item.Name, fk_sftable.value));
        }
      });
      await Promise.all(saves).then(() => {
        isSave.value = true;
        InitPage();
      });
    } catch (e) {
      message.error(`保存失败,错误信息：${e}`);
      loading.value = false;
      InitPage();
      return;
    } finally {
      loading.value = false;
    }
  };
  //新增
  const Insert = async () => {
    const maxIndex = data.value.length + 1;
    let newNo = '';
    if (NoGenerModel.value === 4) {
      const en = new BSEntity('BP.Sys.SFTable', fk_sftable.value);
      en.No = fk_sftable.value;
      await en.Init();
      await en.Retrieve();
      newNo = await en.DoMethodReturnString('GenerSFTableNewNo');
    } else if (NoGenerModel.value === 1) {
      if (isSave.value) {
        const en = new BSEntity('BP.Sys.SFTable', fk_sftable.value);
        en.No = fk_sftable.value;
        await en.Init();
        await en.Retrieve();
        newNo = await en.DoMethodReturnString('GenerSFTableNewNo');
        currenNo.value = newNo;
      } else {
        let num = parseInt(currenNo.value) + 1;
        if (num < 10) newNo = '00' + num.toString();
        else if (num >= 10 && num < 100) newNo = '0' + num.toString();
        else newNo = num.toString();
        currenNo.value = newNo.toString();
      }
      isSave.value = false;
    } else if (NoGenerModel.value === 0) {
      newNo = prompt('请输入编号', '') || '';
      if (newNo === '') {
        alert('编号不能为空');
        return;
      }
    }
    newNode.value++;
    data.value.push({ No: newNo, Name: `新建节点${newNode.value}` });
  };
  //删除
  const Delete = async () => {
    if (selectRowKeys.value.length == 0) {
      message.error('请选择需要删除的数据');
      return;
    }
    if (window.confirm('确定删除这些数据吗') === false) {
      clearSelectedRowKeys();
      return;
    }
    const deletes = <any>[];
    try {
      loading.value = true;
      const en = new BSEntity('BP.Sys.SFTableDtl', fk_sftable.value);
      en.setVal('FK_SFTable', fk_sftable.value);
      selectRowKeys.value.forEach(async (item) => {
        en.setPK(fk_sftable.value+'_'+item);
        deletes.push(en.Delete());
      });
      await Promise.all(deletes).then(() => {
        InitPage();
      });
    } catch (e) {
      message.error(`删除失败，错误信息：${e}`);
      loading.value = false;
      InitPage();
      return;
    } finally {
      clearSelectedRowKeys();
      loading.value = false;
    }
  };
  //生成拼音编号
  const ParsePinYin = async (str, model) => {
    let pinYin;
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_FoolFormDesigner');
    handler.AddPara('name', str);
    handler.AddPara('flag', model);

    pinYin = await handler.DoMethodReturnString('ParseStringToPinyin');

    return pinYin;
  };
  InitPage();
</script>

<style scoped>
  .btn {
    height: 30px;
    border-radius: 5px;
    margin-left: 12px;
  }
</style>
