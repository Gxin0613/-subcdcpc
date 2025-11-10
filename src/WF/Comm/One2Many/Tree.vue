<template>
  <div class="p-1">
    <Spin :spinning="loading" style="background-color: white">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else>
        <div class="vben-container">
          <Form layout="inline" :model="formData">
            <FormItem>
              <Input v-model:value="formData.key" :placeholder="'关键字'">
                <template #prefix>
                  <UserOutlined style="color: rgba(0, 0, 0, 0.25)" />
                </template>
              </Input>
            </FormItem>
            <FormItem>
              <Button type="primary" html-type="submit" @click="InitPage">{{ '查询' }}</Button>
              <Button type="primary" style="margin-left: 10px" @click="save">{{ '保存' }}</Button>
            </FormItem>
          </Form>
        </div>
        <div style="background: #fff; padding: 10px; padding-left: 20px">
          <Tree v-model:selectedKeys="selectedKeys" v-model:checkedKeys="checkedKeys" v-if="alldata.length" default-expand-all checkable :tree-data="alldata">
            {{ title }}
          </Tree>
        </div>
      </div>
    </Spin>
  </div>
</template>

<script lang="ts" setup>
  import { Spin, Form, FormItem, Input, Button, Tree, message } from 'ant-design-vue';
  import { reactive, ref, watch } from 'vue';
  import { ClassFactory } from '/@/bp/da/ClassFactory';
  import { EntitiesMyPK } from '/@/bp/en/EntityMyPK';
  import type { TreeSelectProps } from 'ant-design-vue';

  const formData = reactive({
    key: '',
  });
  // var pkval = "101";//GetQueryString("PKVal");
  // var EnsOfMyPKStr="TS.WF.Template.NodeDept"
  // var EnsOfDict = "TS.Port.Station";//GetQueryString("EnsOfDict");
  // var keyRefPK = "FK_Node";//GetQueryString("KeyRefPK");
  // var keyDict = "FK_Dept"//GetQueryString("KeyDict");
  // var EnsOfGroup="TS.Port.Dept"
  const props = defineProps({
    params: {
      type: Object,
      dafault: () => {
        return {};
      },
    },
  });
  console.log(props);
  const { EnsOfMyPK, EnsOfDict, KeyRefPK, KeyDict, RootNo, PKVal } = props.params;
  const checkedList = ref<any>([]);
  const Data = ref<any>([]);
  const alldata = ref<TreeSelectProps['treeData']>([]);
  let ensOfMyPK: EntitiesMyPK;
  const loading = ref(false);
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const InitPage = async () => {
    //获得数据 NodeStations  select MyPK,FK_Node,FK_Station FROM WF_NodeStation
    if (!EnsOfMyPK) {
      errorObj.hasError = true;
      errorObj.tips = '缺少参数 [ EnsOfMyPK ]';
      return;
    }

    ensOfMyPK = await ClassFactory.GetEns(EnsOfMyPK);
    await ensOfMyPK.Init();
    await ensOfMyPK.Retrieve(KeyRefPK, PKVal);
    // console.log(ensOfMyPK);
    //获得集合数据. Stations select No,Name,ParentNo FROM Port_Dept
    const treeEns = await ClassFactory.GetEns(EnsOfDict);
    await treeEns.Init();
    await treeEns.RetrieveAll();
    alldata.value = [];
    checkedList.value = [];

    Data.value = [];
    treeEns
      .filter((f: any) => f.ParentNo == '0')
      .forEach((f: any, i) => {
        let d = { title: f.Name, No: f.No, key: '0-' + i, children: [] };
        Data.value.push(d);
        ensOfMyPK
          .filter((p) => p.GetValByKey(KeyDict) == f.No)
          .forEach(() => {
            selectedKeys.value.push(d.key);
            checkedKeys.value.push(d.key);
            checkedList.value.push(d.No);
          });
        gettree(treeEns, d.No, d);
        alldata.value.push(d);
      });
  };

  function gettree(arr, parentid, t) {
    arr
      .filter((f) => f.ParentNo == parentid)
      .forEach((f, i) => {
        let d = { title: f.Name, No: f.No, key: t.key + '-' + i, children: [] };
        Data.value.push(d);
        ensOfMyPK
          .filter((p) => p.GetValByKey(KeyDict) == f.No)
          .forEach(() => {
            selectedKeys.value.push(d.key);
            checkedKeys.value.push(d.key);
            checkedList.value.push(d.No);
          });
        t.children.push(d);
        gettree(arr, d.No, d);
      });
  }

  InitPage();
  const expandedKeys = ref<string[]>([]);
  const selectedKeys = ref<string[]>([]);
  const checkedKeys = ref<string[]>([]);
  watch(expandedKeys, () => {
    console.log('expandedKeys', expandedKeys);
  });
  watch(selectedKeys, () => {
    console.log('selectedKeys', selectedKeys);
  });
  watch(checkedKeys, () => {
    console.log('checkedKeys', checkedKeys);
    checkedList.value = [];
    checkedKeys.value.forEach((f) => {
      if (Data.value.find((p) => p.key == f)) {
        checkedList.value.push(Data.value.filter((p) => p.key == f)[0].No);
      }
    });
  });

  function save() {
    ensOfMyPK.forEach((f) => {
      if (checkedList.value.indexOf(f.GetValByKey(KeyDict)) == -1) {
        f.Delete();
      }
    });
    checkedList.value
      .filter((f) => !ensOfMyPK.find((p) => p.GetValByKey(KeyDict) == f))
      .forEach((f) => {
        let enMyPK = ensOfMyPK.GetNewEntity;
        enMyPK.SetValByKey(KeyRefPK, PKVal);
        enMyPK.SetValByKey(KeyDict, f);

        enMyPK.SetValByKey('MyPK', PKVal + '_' + f); //设置主键.
        enMyPK.Insert();
      });
    message.success('保存成功');
    //执行重新查询.
    InitPage();
  }
</script>
<style lang="less" scoped>
  .vben-container {
    padding: 0px;

    .ant-form {
      padding: 12px 10px 6px;
      margin-bottom: 16px;
      background-color: #fff;
      border-radius: 2px;
    }
  }

  :deep(.ant-tree-treenode-checkbox-checked) {
    font-weight: bold;
  }
</style>
