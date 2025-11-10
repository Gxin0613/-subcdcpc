<template>
  <BaseComponent ref="wrapperRef" :close-drawer-func="InitSearch" :close-modal-func="InitSearch">
    <Spin :spinning="loading">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <template v-else>
        <Tabs v-model:activeKey="activeKey" @change="handleTabChange" style="padding: 10px 25px 0; background-color: #fff">
          <TabPane v-for="(group, idx) in Groups" :key="group.MsgType" :tab="group.TypeName">
            <div class="item" v-for="(item, index) in msgList" :key="index">
              <template v-if="activeKey == item.MsgType">
                <div class="header" @click="OpenIt(item)">
                  <div :class="item.IsRead == 0 ? 'title' : 'title isread'">
                    {{ item.EmailTitle }}
                    <Badge color="red" v-if="item.IsRead == 0" />
                  </div>
                </div>
                <div class="attr adjust">
                  <span class="tag">发布于 {{ item.RDT }}</span>
                  <a class="tag explain" @click="DoDelete(item.MyPK)">
                    <DeleteOutlined />
                  </a>
                </div>
              </template>
            </div>
          </TabPane>
        </Tabs>
      </template>
    </Spin>
  </BaseComponent>
</template>
<script setup lang="ts">
  import { reactive, ref, shallowRef } from 'vue';
  import { Tabs, TabPane, Badge, Spin, message } from 'ant-design-vue';
  import { DeleteOutlined } from '@ant-design/icons-vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import BSEntity from '/@/utils/gener/BSEntity';
  import { GloWF } from '../Admin/GloWF';
  import { windowOpen } from '/@/utils/windowOpen';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';

  const wrapperRef = shallowRef<InstanceType<typeof BaseComponent>>();
  const loading = ref(false);
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });

  const Groups = ref();
  const msgList = ref();
  const activeKey = ref('');
  const dataList: any = ref();
  const tabClickType = ref();
  //删除
  const DoDelete = async (MyPK) => {
    if (confirm('确认要删除吗?')) {
      const en = new BSEntity('BP.WF.SMS');
      await en.setPK(MyPK as string);
      await en.Delete();
      InitPage();
    }
  };
  //打开
  const OpenIt = (item) => {
    DoRead(item.MyPK);
    const paraStr = GloWF.AtParaStringToJson(item.AtPara);
    var url = '/#/WF/MyView?FK_Flow=' + paraStr.FK_Flow + '&WorkID=' + paraStr.WorkID;
    wrapperRef.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url));
    // windowOpen(url, '');
  };
  const DoRead = async (mypk) => {
    console.log(mypk);
    var en = new BSEntity('BP.WF.SMS', mypk);
    await en.RetrieveFromDBSources();
    await en.DoMethodReturnString('DoRead');
    InitPage();
  };
  const Replay = async (doc, myPK) => {
    var en = new BSEntity('BP.WF.SMS', myPK);
    await en.RetrieveFromDBSources();
    await en.DoMethodReturnString('DoRead');
  };
  //tab切换
  const handleTabChange = (Key) => {
    activeKey.value = Key;
    //切换数据
    tabClickType.value = Key;
    msgList.value = dataList.value['Messages'].filter((item) => item.MsgType == tabClickType.value);
  };
  const InitPage = async () => {
    try {
      loading.value = true;
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Portal');
      let data = await handler.DoMethodReturnJson('Message_Init');
      if (data.toString().indexOf('err@') != -1) {
        alert(data);
        return;
      }
      dataList.value = data;
      //获得消息分组.
      let groups = data['Groups'];
      //前台处理消息类型.
      for (var i = 0; i < groups.length; i++) {
        if (i == 0) {
          //选择第一个
          if (!tabClickType.value) {
            tabClickType.value = groups[i].MsgType;
            activeKey.value = groups[i].MsgType;
          }
          // {
          //默认选择挂起
          // activeKey.value = groups[i].MsgType;
          // if (groups[i].MsgType == 'HangUp') {
          //   groups[i].TypeName = '挂起消息';
          // }
          // }
        }
        if (groups[i].MsgType == 'SendSuccess') {
          groups[i].TypeName = '新工作';
          continue;
        }
        if (groups[i].MsgType == 'HuiQian') {
          groups[i].TypeName = '会签邀请';
          continue;
        }
        if (groups[i].MsgType == 'ReturnAfter') {
          groups[i].TypeName = '退回';
          continue;
        }
      }
      Groups.value = groups;
      console.log(Groups.value);
      //获得消息.
      msgList.value = dataList.value['Messages'].filter((item) => item.MsgType == tabClickType.value);
      console.log(msgList.value);
    } catch (e: any) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      console.trace(e);
    } finally {
      loading.value = false;
    }
  };
  InitPage();
</script>
<style scoped lang="less">
  .item {
    border-bottom: 1px solid #e2e9ee;
    padding: 20px;
    width: 100%;
    box-sizing: border-box;
    text-align: left;
    cursor: pointer;
    .header .title {
      color: #40485b;
      height: 22px;
      line-height: 22px;
      text-decoration: none;
      font-size: 1.1em;
      font-weight: 700;
      letter-spacing: 0.2px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      max-width: 90%;
    }
    .header .isread {
      color: #98a0b3;
    }
    .attr.adjust {
      margin-top: 10px;
      overflow: hidden;
      display: flex;
      justify-content: space-between;
      .explain {
        color: #837276;
      }
    }
  }
  .fa-fw {
    color: #837276;
  }
</style>
