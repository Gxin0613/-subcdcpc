<template>
  <div class="p-1">
    <Spin :spinning="loading" style="background-color: white">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else class="content">
        <Card style="border-radius: 10px; margin-bottom: 12px">
          <div class="flex">
            <Form layout="inline" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
              <FormItem>
                <Input v-model:value="searchKey" :placeholder="'搜索'" @change="Search" allow-clear class="set_Input">
                  <template #prefix>
                    <i class="icon-magnifier"></i>
                  </template>
                </Input>
              </FormItem>
              <FormItem>
                <Button type="primary" @click="Search">{{ '查询' }}</Button>
              </FormItem>
              <FormItem>
                <Button type="primary" @click="SetTester">{{ '设置测试发起人' }}</Button>
              </FormItem>
              <FormItem>
                <Button type="primary" @click="MoreTester">{{ '更多发起人' }}</Button>
              </FormItem>
            </Form>
          </div>
        </Card>
        <BasicTable @register="registerTable" :pagination="false" ref="tableRef" />
      </div>
    </Spin>
  </div>
</template>

<script lang="tsx" setup>
  import { message, Spin, Card, Form, FormItem, Button, Input } from 'ant-design-vue';
  // 父组件传过来的属性
  import { nextTick, reactive, ref } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { useRoute, useRouter } from 'vue-router';
  import BasicTable from '/@/components/Table/src/BasicTable.vue';
  import { TableActionType, useTable } from '/@/components/Table';
  import { getAuthCache, setAuthCache } from '/@/utils/auth';
  import { ADMIN_TOKEN_KEY, TESTER_KEY, TOKEN_KEY } from '/@/enums/cacheEnum';
  import { useUserStoreWithOut } from '/@/store/modules/user';
  import { FlowExt } from '/@/WF/Admin/AttrFlow/FlowExt';
  import { GetUrlToJSON } from '/@/utils/gener/StringUtils';
  import WebUser from '/@/bp/web/WebUser';
  import { getAppEnvConfig } from '/@/utils/env';

  //错误提示
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const loading = ref(false);
  const userStore = useUserStoreWithOut();
  const route = useRoute();
  const { replace } = useRouter();
  const tableData = ref([]);
  const innerData = ref([]);
  const searchKey = ref('');
  const drawer = reactive({
    visible: false,
    title: '',
    current: '',
    width: window.innerWidth * 0.8 + 'px',
  });
  const tableRef = ref<Nullable<TableActionType>>();
  const InitPage = async () => {
    try {
      loading.value = true;
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_TestingContainer');
      handler.AddPara('FK_Flow', route.query.FlowNo);
      const data = await handler.DoMethodReturnString('TestFlow2020_Init');
      if (typeof data === 'string' && data.includes('err@')) {
        message.error(data.replace('err@', ''));
        return;
      }
      innerData.value = JSON.parse(JSON.stringify(data));
      /*//获取分组的集合
    const map = new Map()
    innerData.value.forEach((item, index, arr) => {
      if (!map.has(item['FK_DeptText'])) {
        map.set(
          item['FK_DeptText'],
          arr.filter(a => a['FK_DeptText'] == item['FK_DeptText'])
        )
      }
    })
    const arrData = Array.from(map).map(item => [...item[1]])
    let dataItem: Record<string, any> = {};
    arrData.forEach((item, index) => {
      dataItem = {};
      dataItem['FK_DeptText'] = item[0]['FK_DeptText'];
      dataItem['children'] = item;
      tableData.value.push(dataItem as never);
    });*/
      tableData.value = innerData.value;
      setTableData(tableData.value);
      onExpandAll();
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  InitPage();
  const [registerTable, { setTableData }] = useTable({
    title: '',
    columns: [
      {
        title: '部门',
        dataIndex: 'FK_DeptText',
        key: 'FK_DeptText',
      },
      {
        title: '用户',
        dataIndex: 'Name',
        key: 'Name',
        customRender: ({ text, record }) => {
          return (
            <Button type="link" onclick={StartFlow.bind(this, record)}>
              {text}
            </Button>
          );
        },
      },
    ],
    dataSource: tableData.value,
    showIndexColumn: false,
    showTableSetting: false,
    tableSetting: { fullScreen: false },
    maxHeight: window.innerHeight - 240,
  });

  const Search = () => {
    tableData.value = [];
    //匹配关键字段值
    const list = ref([]);
    if (searchKey.value) {
      const ar = JSON.parse(JSON.stringify(innerData.value));
      const str = new RegExp(searchKey.value, 'i');
      ar.forEach((item) => {
        for (const key in item) {
          if (str.test(item[key])) {
            list.value.push(item);
            break;
          }
        }
      });
    } else {
      list.value = innerData.value;
    }
    /*//获取分组的集合
  const map = new Map()
  list.value.forEach((item, index, arr) => {
    if (!map.has(item['FK_DeptText'])) {
      map.set(
        item['FK_DeptText'],
        arr.filter(a => a['FK_DeptText'] == item['FK_DeptText'])
      )
    }
  })
  const arrData = Array.from(map).map(item => [...item[1]])
  let dataItem: Record<string, any> = {};
  arrData.forEach((item, index) => {
    dataItem = {};
    dataItem['FK_DeptText'] = item[0]['FK_DeptText'];
    dataItem['children'] = item;
    tableData.value.push(dataItem as never);
  });*/
    tableData.value = list.value;
    setTableData(list.value);
  };
  function onExpandAll() {
    // 演示默认展开所有表项
    nextTick(tableRef.value?.expandAll);
  }
  // 重置抽屉
  //更多测试人员
  const MoreTester = async () => {
    const en = new FlowExt(route.query.FlowNo as string);
    await en.RetrieveFromDBSources();
    en.SetValByKey('Tester', '');
    await en.Update();
    await InitPage();
  };
  const emit = defineEmits(['changeUserInfo', 'changeFrameSrc']);
  const SetTester = async () => {
    let msg = '请输入测试人员的帐号，多个人员用逗号分开';
    msg += `	
 比如:zhangsan,lisi`;
    msg += `	
 帐号就是登录该系统的编号，如果输入的帐号没有发起该流程的权限，系统就会提示错误。`;
    const emps = window.prompt(msg, WebUser.No);
    const en = new FlowExt(route.query.FlowNo as string);
    await en.RetrieveFromDBSources();
    en.SetValByKey('Tester', emps);
    await en.Update();
    await InitPage();
  };
  //发起流程
  const StartFlow = async (record) => {
    //存储Admin的Token
    setAuthCache(ADMIN_TOKEN_KEY, getAuthCache(TOKEN_KEY));
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_TestingContainer');
    handler.AddPara('FK_Flow', route.query.FlowNo);
    handler.AddPara('TesterNo', record.No);
    handler.AddPara('OrgNo', WebUser.OrgNo);
    setAuthCache(TESTER_KEY, record.No);

    const data = await handler.DoMethodReturnString('TestFlow2020_StartIt');
    if (typeof data === 'string' && data.includes('err@')) {
      message.error(data.replace('err@', ''));
      return;
    }
    //data转JSON
    const result = GetUrlToJSON(data);
    //获取当前测试用户的Token
    setAuthCache(TOKEN_KEY, result.Token);

    //获取当前测试用户的信息
    // const { VITE_GLOB_IS_THIRDPART_SYSTEM } = getAppEnvConfig();
    // if (VITE_GLOB_IS_THIRDPART_SYSTEM) {
    //   userStore.setTestToken(result.Token);
    // } else {
    //   userStore.token = result.Token;
    // }
    userStore.token = result.Token;
    await userStore.getUserInfoAction();

    emit('changeUserInfo', result.Token);
    //跳转页面
    emit('changeFrameSrc', 'MyFlow');
    //页面跳转到测试容器
    //window.location.replace('/#/WF/Designer/TestingContainer?FlowNo='+route.query.FlowNo+'&TesterNo='+result.TesterNo);
  };
</script>
<style lang="less" scoped>
  .set_Input {
    width: 200px;
  }

  .tool-btn-groups {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    box-sizing: border-box;
    padding-right: 22px;
    text-align: left;

    .ant-btn {
      margin-left: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 26px;
      border-radius: 12px;
      color: #1890ff;
      border-color: #1890ff;

      i {
        margin-right: 6px;
      }
    }
  }
</style>
