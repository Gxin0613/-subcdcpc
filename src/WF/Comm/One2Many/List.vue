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
              <Button v-if="uac.IsUpdate" type="primary" style="margin-left: 10px" @click="save">{{ '保存' }}</Button>
            </FormItem>
          </Form>
        </div>
        <div style="background: #fff; padding: 10px">
          <CheckboxGroup class="check-group" v-model:value="checkedList">
            <template v-for="item in options" :key="item.value">
              <checkbox :style="checkedList.find((p) => item.checked && item.value == p) ? 'font-weight: bold' : ''" v-model:value="item.value">{{ item.label }}</checkbox>
            </template>
          </CheckboxGroup>
        </div>
      </div>
    </Spin>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, ref, unref } from 'vue';
  import { Spin, Form, FormItem, Input, Button, CheckboxGroup, Checkbox, message } from 'ant-design-vue';
  import { ClassFactory } from '/@/bp/da/ClassFactory';
  import { EntitiesMyPK } from '/@/bp/en/EntityMyPK';
  import { UserOutlined } from '@ant-design/icons-vue';
  import type { CheckboxValueType } from 'ant-design-vue/es/checkbox/interface';
  import { UAC } from '/@/bp/en/Map/UAC';

  const formData = reactive({
    key: '',
  });

  let props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
  });
  const { PKVal, EnsOfMyPK, EnsOfDict, KeyRefPK, KeyDict } = unref(props.params);

  const checkedList = ref<CheckboxValueType[]>([]);
  type CheckboxOption = {
    label: string;
    value: string;
    checked: boolean;
  };
  const options = ref<CheckboxOption[]>([]);
  const Data = ref<any>([]);
  let ensOfMyPK: EntitiesMyPK;
  const loading = ref(false);
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });

  const uac = ref(new UAC());
  const InitPage = async () => {
    //获得数据 NodeStations  select MyPK,FK_Node,FK_Station FROM WF_NodeStation
    if (!EnsOfMyPK) {
      errorObj.hasError = true;
      errorObj.tips = '缺少参数LIst [ EnsOfMyPK ]';
      return;
    }
    ensOfMyPK = await ClassFactory.GetEns(EnsOfMyPK);
    await ensOfMyPK.Init();
    await ensOfMyPK.Retrieve(KeyRefPK, PKVal);
    checkedList.value = [];
    ensOfMyPK.forEach((f) => {
      checkedList.value.push(f.GetValByKey(KeyDict));
    });
    const en = ensOfMyPK.GetNewEntity;
    uac.value = en.HisUAC;
    //获得集合数据. Stations select No,Name FROM Port_Station
    const ensOfDict = await ClassFactory.GetEns(EnsOfDict);
    await ensOfDict.Init();
    await ensOfDict.RetrieveAll();
    Data.value = [];
    ensOfDict.forEach((f: any) => {
      Data.value.push({ No: f.No, Name: f.Name });
    });

    options.value = Data.value
      .map((f) => ({
        label: f.Name,
        value: f.No,
        checked: checkedList.value.find((p) => p == f.No),
      }))
      .filter((f) => f.label.indexOf(formData.key) != -1);
  };
  // 使用async/await批处理
  const save = async () => {
    try {
      // 删除不在选中列表中的数据
      const prevSelectedItems = ensOfMyPK.map((en) => ({ pk: en.PKVal, value: en[KeyDict] }));
      const delList: Promise<any>[] = [];
      for (const item of prevSelectedItems) {
        if (!checkedList.value.includes(item.value)) {
          const en = ensOfMyPK.GetNewEntity;
          en.MyPK = item.pk;
          delList.push(en.Delete());
        }
      }
      await Promise.all(delList);
      // 插入新的数据到中间表
      const insertItems = checkedList.value.filter((item) => !prevSelectedItems.some((ps) => ps.value == item));
      const insertList: Promise<any>[] = [];
      for (const item of insertItems) {
        const en = ensOfMyPK.GetNewEntity;
        en.SetValByKey(KeyRefPK, PKVal);
        en.SetValByKey(KeyDict, item);
        en.SetValByKey(KeyDict + 'T', options.value.find((ps) => ps.value == item).label);
        insertList.push(en.Insert());
      }
      await Promise.all(insertList);
      message.success('保存成功');
      //执行重新查询.
    } catch (error) {
      message.error('保存失败');
    } finally {
      InitPage();
    }
  };
  InitPage();
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
  .check-group {
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
