<template>
  <div class="p-1">
    <Spin :spinning="loading" style="background-color: white">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else class="content">
        <Checkbox v-model:checked="checkAll" :indeterminate="indeterminate" @change="onCheckAllChange" :disabled="isMultiSelect == false">{{ '全选' }}</Checkbox>
        <div style="text-align: right; display: inline; margin-left: 251px">
          <Button type="primary" style="margin-right: 0.5em" @click="BtnOK">{{ '确定' }}</Button>
          <Button type="primary" style="margin-right: 0.5em" @click="Cancel">{{ '取消' }}</Button>
        </div>
        <Divider />
        <div style="max-height: 400px; overflow-y: auto">
          <div v-for="dept in depts" :key="dept.No">
            <Collapse v-model:activeKey="activeKey" ghost>
              <CollapsePanel :key="dept.No" :header="dept.Name">
                <p>
                  <template v-if="isMultiSelect">
                    <CheckboxGroup v-model:value="dept.Selected">
                      <Checkbox v-for="emp in dept.Emps" :key="emp.No" :value="emp.No" :name="emp.Name">
                        {{ emp.Name }}
                      </Checkbox>
                    </CheckboxGroup>
                  </template>
                  <template v-else>
                    <RadioGroup v-model:value="selected">
                      <Radio v-for="emp in dept.Emps" :key="emp.No" :value="emp.No" :name="emp.Name">
                        {{ emp.Name }}
                      </Radio>
                    </RadioGroup>
                  </template>
                </p>
              </CollapsePanel>
            </Collapse>
          </div>
        </div>
      </div>
    </Spin>
  </div>
</template>

<script lang="ts" setup>
  import { message, Spin, Divider, Checkbox, CheckboxGroup, RadioGroup, Radio, Button, Collapse, CollapsePanel } from 'ant-design-vue';
  // 父组件传过来的属性
  import { reactive, ref } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  interface Emp {
    No: string;
    Name: string;
    FK_Dept: string;
  }
  interface Dept {
    No: string;
    Name: string;
    Selected: Array<string>;
    Emps: Array<Emp>;
  }

  const props = defineProps({
    params: {
      //请求参数集合
      type: Object,
      default: () => {},
    },
  });
  //错误提示
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const loading = ref(false);
  const pageName = ref('');
  const depts = ref<Array<Dept>>([]);
  const emps = ref<Array<Emp>>([]);
  const selected = ref<string[]>([]);
  const isMultiSelect = ref(true); //true 多选
  const checkAll = ref(false);
  const indeterminate = ref(true);
  const isSend = ref(false);
  const activeKey = ref<any>([]);

  const query = ref<Record<string, any>>();

  //初始化页面
  const InitPage = async () => {
    try {
      loading.value = true;
      query.value = props.params;
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
      handler.AddJson(query.value);
      const data = await handler.DoMethodReturnString('Accepter_Init');
      if (typeof data === 'string' && data.includes('err@')) {
        message.error(data.replace('err@', ''));
        return;
      }
      const result = JSON.parse(JSON.stringify(data));
      pageName.value = result.PageName || '';
      isSend.value = !!result.IsSend;
      //返回JSON数据时直接解析内容
      if (pageName.value == '') {
        emps.value = result.Emps || [];
        if (emps.value.length == 0) {
          loading.value = false;
          message.error('当前节点设置的接收人范围为空,请联系管理员配置接收人范围');
          return;
        }
        depts.value = result.Depts;

        isMultiSelect.value = parseInt(result.Selector[0]?.IsSimpleSelector || 0) === 0 ? true : false;
        const data = result.Selected || [];
        data.forEach((item) => {
          selected.value.push(item.No);
        });
        depts.value.forEach((dept) => {
          dept.Emps = result.Emps.filter((emp) => emp.FK_Dept == dept.No);
          activeKey.value.push(dept.No);
          dept.Selected = [];
          dept.Emps.filter((emp) => data.find((t) => t.No == emp.No)).forEach((item) => dept.Selected.push(item.No));
        });
      }
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  InitPage();

  const onCheckAllChange = (e: any) => {
    depts.value.forEach((dept) => {
      dept.Selected = [];
      if (e.target.checked == true) {
        dept.Emps.forEach((emp) => {
          dept.Selected.push(emp.No);
        });
      }
    });
    indeterminate.value = false;
  };
  const emit = defineEmits(['AddEmps']);
  /**
   * 确定
   * @constructor
   */
  const BtnOK = () => {
    if (isMultiSelect.value == true) {
      selected.value = [];
      depts.value.forEach((dept) => {
        if (dept.Selected) selected.value = [...selected.value, ...dept.Selected];
      });
    }
    if (selected.value.length == 0) {
      message.error('请选择接收人');
      return;
    }
    emit('AddEmps', selected.value);
  };
  /**
   * 取消
   * @constructor
   */
  const Cancel = () => {
    emit('AddEmps', []);
  };
</script>
<style lang="less" scoped>
  .ant-divider-horizontal {
    margin: 12px !important;
  }
  .messageStyle {
    margin-left: auto;
    margin-top: 40px;
    box-shadow: 0px 0px 4px 2px #cccccc57;
    padding: 20px;
    border: 1px solid #cccc;
    margin-right: auto;
    width: 70%;
  }
</style>
