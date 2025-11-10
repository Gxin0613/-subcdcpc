<template>
  <div style="background-color: rgb(240, 242, 245); height: 100%">
    <Spin :spinning="loading">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else style="background-color: rgb(240, 242, 245)">
        <!--表单内容-->
        <div class="content wrapper" :style="contentStyle">
          <FrmFool v-if="frmData" ref="basicData" :frmData="frmData" :isReadonly="false" :params="query" />
        </div>
      </div>
      <!--居中弹窗-->
      <Modal
        v-model:open="modal.modalVisible"
        centered
        :closable="modal.closable"
        :title="modal.modalTitle"
        :width="modal.modalWidth"
        :body-style="modal.modalHeight"
        :footer="null"
      >
        <div class="h-100">
          <!--退回小纸条显示-->
          <div style="padding: 10px; overflow-y: auto; height: 100%">
            <template v-for="(item, index) in dataInfo" :key="index">
              <div v-if="item.title === '退回信息'" style="line-height: 24px; color: red; font-weight: bold">{{ item.title }}</div>
              <div v-else style="line-height: 24px; font-weight: bold">{{ item.title }}</div>
              <p v-html="item.content" style="line-height: 24px"></p>
            </template>
          </div>
        </div>
      </Modal>
    </Spin>
  </div>
</template>

<script lang="ts" setup>
  import { useRoute } from 'vue-router';
  import { reactive, ref, shallowRef } from 'vue';
  import { Flow } from '/@/WF/TSClass/Flow';
  import { Node } from '/@/WF/TSClass/Node';
  import { message, Modal, Spin } from 'ant-design-vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import FrmFool from '/@/WF/CCForm/FrmFool.vue';

  //获取传的参数
  const route = useRoute();
  const query = route.query || {};
  const loading = ref(false);
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });
  //弹窗显示
  const modal = reactive({
    modalVisible: false,
    closable: true,
    modalType: '',
    modalTitle: '',
    modalWidth: 800,
    modalHeight: {},
  });
  const dataInfo = ref<Record<string, any>[]>([]);
  const frmData = ref(null);
  //流程编号
  const flowNo = ref(query.FK_Flow as string);
  //节点编号
  const nodeID = ref(parseInt((query.FK_Node as string) || '0'));

  const contentStyle = reactive({
    width: 'calc(100vw - 230px)',
  });
  //初始化页面，判断当前流程表单类型
  const InitPage = async () => {
    try {
      loading.value = true;
      //获取流程属性的信息
      const flow = new Flow();
      await flow.Init();
      flow.No = flowNo.value;
      await flow.RetrieveFromDBSources();

      //获取当前节点的属性信息
      const node = new Node();
      await node.Init();
      node.NodeID = nodeID.value;
      await node.RetrieveFromDBSources();
    //  debugger;
      //获取表单的数据
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
      handler.AddJson(query);
      const data = await handler.DoMethodReturnString('GenerWorkNode');
      if (typeof data == 'string' && data.includes('err@') == true) {
        errorObj.hasError = true;
        errorObj.tips = data.replace('err@', '');
        console.log('GenerWorkNode获取失败:' + data);
        return;
      }
      frmData.value = JSON.parse(JSON.stringify(data));
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };

  InitPage();
</script>

<style lang="less" scoped>
  .toolBar {
    background-color: white;
    position: fixed;
    width: 100%;
    height: 50px;
    z-index: 1000;
  }
  .wrapper {
    margin: 0 auto;
    padding: 60px 24px 24px;
  }
</style>
