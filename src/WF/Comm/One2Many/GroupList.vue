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
                <template #prefix><UserOutlined style="color: rgba(0, 0, 0, 0.25)" /></template>
              </Input>
            </FormItem>
            <FormItem>
              <Button type="primary" html-type="submit" @click="InitPage">{{ '查询' }}</Button>
              <Button type="primary" style="margin-left: 10px" @click="save">{{ '保存' }}</Button>
            </FormItem>
          </Form>
        </div>
        <div style="background: #fff; padding: 10px; padding-left: 20px">
          <div v-for="(item, index) in alldata" :key="index">
            <Collapse v-model:activeKey="activeKey" ghost>
              <CollapsePanel :key="item.value" :header="item.label">
                <p>
                  <CheckboxGroup class="lie" @change="(t) => change(t, item)" style="margin-left: 10px; padding: 10px" v-model:value="item.checkedList">
                    <template v-for="(item1, index) in item.item" :key="index">
                      <checkbox :style="item.checkedList.find((p) => item1.checked && item1.value == p) ? 'font-weight: bold' : ''" v-model:value="item1.value">{{
                        item1.label
                      }}</checkbox>
                    </template>
                  </CheckboxGroup>
                </p>
              </CollapsePanel>
            </Collapse>
            <div>
              <!--              <Checkbox-->
              <!--                v-model:checked="item.checkAll"-->
              <!--                :indeterminate="item.indeterminate"-->
              <!--                @change="(t)=>onCheckAllChange(t,item)"-->
              <!--              >-->
              <!--                {{ item.label }}-->
              <!--              </Checkbox>-->
            </div>
          </div>
        </div>
      </div>
    </Spin>
  </div>
</template>

<script lang="ts" setup>
  import { Spin, Form, FormItem, Input, Button, CheckboxGroup, Checkbox, Collapse, CollapsePanel, message } from 'ant-design-vue';
  import { reactive, ref } from 'vue';
  import { ClassFactory } from '/@/bp/da/ClassFactory';
  import { EntitiesMyPK } from '/@/bp/en/EntityMyPK';

  const formData = reactive({
    key: '',
  });

  let props = defineProps(['params']);
  console.log(props.params);
  const { PKVal, EnsOfMyPK, EnsOfDict, KeyRefPK, KeyDict, EnsOfGroup, KeyGroupDict } = props.params;
  const checkedList = ref<any>([]);
  const alldata = ref<any>([]);
  const activeKey = ref<any>([]);
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

    //获得集合数据. Stations select No,Name FROM Port_Station
    let ensOfDict = await ClassFactory.GetEns(EnsOfDict);
    await ensOfDict.Init();
    await ensOfDict.RetrieveAll();

    //获得分组数据. StationTypes select No,Name FROM Port_StationType
    const ensOfGroup = await ClassFactory.GetEns(EnsOfGroup);
    await ensOfGroup.Init();
    await ensOfGroup.RetrieveAll();
    alldata.value = [];
    ensOfGroup.forEach((f: any) => {
      let d: any = {
        label: f.Name,
        value: f.No,
        checkAll: false,
        indeterminate: false,
        checkedList: [],
        item: [],
      };
      ensOfDict
        .filter((p: any) => p.GetValByKey(KeyGroupDict) == f.No)
        .forEach((p: any) => {
          d.item.push({ label: p.Name, value: p.No });
        });
      d.item = d.item.filter((t) => t.label.indexOf(formData.key) != -1);
      if (d.item.length > 0) {
        alldata.value.push(d);
        activeKey.value.push(d.value);
      } else {
        alldata.value.push(d);
      }

      d.checkedList = [];
      ensOfMyPK
        .filter((p) => d.item.find((t) => t.value == p.GetValByKey(KeyDict)))
        .forEach((p) => {
          d.checkedList.push(p.GetValByKey(KeyDict));
        });
      if (d.checkedList.length > 0) {
        d.indeterminate = true;
        if (d.checkedList.length == d.item.length) {
          d.checkAll = true;
        }
      }
      d.item.forEach((t) => {
        t.checked = d.checkedList.find((g) => g == t.value);
      });
    });
    console.log(alldata.value);
  };
  InitPage();
  function save() {
    checkedList.value = [];
    alldata.value.forEach((f) => {
      f.checkedList.forEach((p) => {
        checkedList.value.push(p);
      });
    });
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

  // const onCheckAllChange = (t, item) => {
  //   item.checkedList = item.checkAll ? item.item.map((f) => f.value) : [];
  // };
  const change = (t, d) => {
    if (d.checkedList.length > 0) {
      d.indeterminate = true;
      if (d.checkedList.length == d.item.length) {
        d.checkAll = true;
      }
    }
  };
</script>
<style lang="less">
  .vben-container {
    .ant-form {
      padding: 12px 10px 6px;
      margin-bottom: 16px;
      background-color: #fff;
      border-radius: 2px;
    }
  }

  .lie {
    width: 80%;
    display: flex;
    flex-wrap: nowrap;
    flex-direction: row;
    flex-wrap: wrap;
    .ant-checkbox-wrapper {
      flex: 0 0 25%;
      margin-bottom: 10px;
      margin-left: 0;
    }
    //.ant-checkbox-wrapper-checked{
    //  font-weight: bold;
    //}
  }
</style>
