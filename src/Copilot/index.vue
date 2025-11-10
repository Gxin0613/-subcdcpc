<template xmlns:value="">
  <h2 style="margin: 10px">CCFlow AI Copilot</h2>
  <Textarea id="content" :style="{ margin: '10px', width: '95%', height: '150px' }"
    :auto-size="{ minRows: 4, maxRows: 5 }" :placeholder="'响应内容'" v-model:value="content" type="textarea" showCount
    :maxlength="100" allow-clear:="true" />

  <a-input :placeholder="'请输入需求或命令'" ref="inputRef" v-model:value="words" allow-clear @change="handleSearch"
    style="margin: 10px; width: 80%; height: 36px" />
  <a-button style="margin: 10px; width: 120px" block @click="Menu_Start">
    <RedoOutlined class="mr-2" />{{'提交'}}</a-button>
  <div style="margin: 10px; width: 95%; height: 150px">
    <h4>{{'说明：AI助手可以通过文字对话方式进行菜单控制或命令执行，使用自然语言代替鼠标键盘操作。'}}</h4>
    <h5>{{'示例：在命令框中输入如下提示词，就可以执行对应的操作'}}</h5>
    <h5>打开流程菜单或流程页面 => 打开流程页面 </h5>
    <h5>{{'可以帮我打开一个页面吗？好像是流程的正在进行的页面'}}</h5>
    <h5>{{'可以帮我打开一个页面吗？大概是待办菜单后面的菜单命令'}}</h5>
    <h5>发起流程或请发起流程 => 启动流程发起 </h5>
    <h5>发起请假流程 => 启动请假流程 </h5>
    <h5>发起请假流程 => 启动请假流程 </h5>
    <h5>查询当前流程的总数 => 获得流程定义的数量 </h5>
  </div>
</template>

<!--嵌入式表单 组件例子-->

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onMounted } from 'vue';
import { message } from 'ant-design-vue';
import HttpHandler from '/@/utils/gener/HttpHandler';
import GenerFuncs from '/@/Copilot/GenerFuncs.ts';
import { useGo } from '/@/hooks/web/usePage';
const go = useGo();

const words = ref('请打开待办菜单');
const content = ref('');

function handleSearch(searchValue: string) {
  console.log(searchValue);

  /*
  if (searchValue !== searchState.searchText) searchState.searchText = searchValue;
  emit('update:searchValue', searchValue);
  if (!searchValue) {
      searchState.startSearch = false;
      return;
  }
  */
}

async function Menu_Start() {
  console.log('start page');

  const wordsText = '';
  console.log('words.value: ', words.value);

  const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AI');
  handler.AddPara('Words', words.value);

  const data = await handler.DoMethodReturnString('CopilotCmd');
  // content.value = JSON.stringify (data);
  content.value = data.key;

  console.log(data);
  const key = data.key;
  const res_t = data.content;

  switch (key) {
    case 'FlowStart':
      go('/WF/GL/Start');
      break;
    case 'TODO':
      go('/WF/GL/TodoList');
      break;
    case 'Running':
      go('/WF/GL/Running');
      break;
    case 'Recent':
      go('/WF/GL/Recent');
      break;
    case 'BILL':
      go('/WF/GL/GenerBill?PKVal=admin');
      break;
    default:
      content.value += res_t;
      break;
  }
  // go('/WF/Comm/TreeEns?EnName=TreeEns_Dept2Emp');
}

onMounted(async () => {
  console.log('onMounted');
  const handler = new HttpHandler('BP.WF.HttpHandler.WF_Portal');
  const sysInfo = await handler.DoMethodReturnJson('Login_InitInfo');
  console.log(sysInfo);
  // if (sysInfo.OSModel == 1) loginType.value = 'Group';
  // else if (sysInfo.OSModel == 0) loginType.value = 'Single';
  // else if (sysInfo.OSModel == 2) loginType.value = 'SAAS';
});
</script>
