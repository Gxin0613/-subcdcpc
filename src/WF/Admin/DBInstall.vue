<template>
  <Spin :spinning="loading" :tip="loadingMessage" size="large">
    <BaseComponent style="display: flex; justify-content: center">
      <div style="width: 50vw; display: flex; justify-content: space-between; flex-direction: column; align-items: center; height: 100vh; border-width: 1px">
        <div style="width: 100%">
          <Row style="justify-content: space-between; height: 150px">
            <img src="../Img/DBInstall/LogBiger.png" alt="ccbpm" :width="300" :height="150" style="margin: 0px" />
            <img src="../Img/DBInstall/ccflowWX.jpg" :alt="'微信'" :width="150" :height="150" style="margin: 0px" />
          </Row>
          <Row>
            <div style="width: 100%; background-color: #f2f2f2; text-align: left; font-weight: bolder; height: 25px; margin: 10px 0; padding-left: 10px">{{ '需要帮助？' }}</div>
          </Row>
          <Row>
            <Col>
              <ul style="list-style-type: disc; padding-left: 44px">
                <li>购买ccbpm的技术支持，请联系我们: 0531-82374939,18660153393(微信同号).</li>
                <li>{{ '自助服务文档：' }}<a href="http://doc.ccbpm.cn/" target="_blank"> http://doc.ccbpm.cn/ </a> </li>
                <li>{{ '视频教程：' }}<a href="http://ccflow.org/ke.htm" target="_blank"> http://ccflow.org/ke.htm </a> </li>
                <li
                  >{{ '数据库脚本下载：' }}<a href="https://gitee.com/opencc/JFlow/attach_files" target="_blank">{{ '点击进入下载页面' }}</a>
                </li>
              </ul>
            </Col>
          </Row>
          <Row>
            <div style="width: 100%; background-color: #f2f2f2; text-align: left; font-weight: bolder; height: 25px; margin: 10px 0; padding-left: 10px"
              >{{ '当前数据库安装类型,' }}<a href="https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=4343068&doc_id=31094" target="_blank">修改数据库配置信息.</a>
            </div>
          </Row>
          <Row>
            <Col>
              <RadioGroup style="padding-left: 30px; display: flex; flex-direction: column" :value="InitData?.DBType">
                <Radio :disabled="true" value="MSSQL">SQLServer2000,2005,2008,....系列版本</Radio>
                <Radio :disabled="true" value="Oracle">Oracle,Oracle9i,10g...系列版本</Radio>
                <Radio :disabled="true" value="MySQL">{{ 'MySQL系列版本' }}</Radio>
                <Radio :disabled="true" value="Informix">Informix 系列版本(首先需要执行:D:\\ccflow\\trunk\\CCFlow\\WF\\Data\\Install\\Informix.sql)</Radio>
                <Radio :disabled="true" value="PostgreSQL">PostgreSQL</Radio>
                <Radio :disabled="true" value="UX">{{ '优炫' }}</Radio>
                <Radio :disabled="true" value="DM">{{ 'DM达梦数据库' }}</Radio>
                <Radio :disabled="true" value="KingBaseR3">{{ '人大金仓数据库R3' }}</Radio>
                <Radio :disabled="true" value="KingBaseR6">{{ '人大金仓数据库R6' }}</Radio>
                <Radio :disabled="true" value="HGDB">{{ '瀚高数据库' }}</Radio>
                <Radio :disabled="true" value="GBASE8CByOracle">{{ '基于Oracle的南通8C' }}</Radio>
                <Radio :disabled="true" value="GBASE8CByMySQL">{{ '基于MySQL的南通8C' }}</Radio>
                <Radio :disabled="true" value="GBASE8A">{{ '南通8A' }}</Radio>
              </RadioGroup>
            </Col>
          </Row>
          <Row>
            <div style="width: 100%; background-color: #f2f2f2; text-align: left; font-weight: bolder; height: 25px; margin: 10px 0; padding-left: 10px">{{
              'ccbpm的运行模式？'
            }}</div>
          </Row>
          <Row>
            <RadioGroup :value="InitData?.CCBPMRunModel?.toString()" style="padding-left: 30px; display: flex; flex-direction: row">
              <Radio :disabled="true" value="0">{{ '单机版' }}</Radio>
              <Radio :disabled="true" value="1">{{ '集团版' }}</Radio>
              <Radio :disabled="true" value="2">{{ 'SAAS版' }}</Radio>
            </RadioGroup>
          </Row>
        </div>
        <Row>
          <Col>
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: space-between; height: 160px">
              <div>
                <Button @click="DoInstall">{{ '接受ccbpm的GPL开源协议并执行安装' }}</Button>
                <div style="text-align: center"
                  ><a href="https://baike.baidu.com/item/GPL/2357903?fr=aladdin" target="_blank">{{ '什么是GPL开源协议?' }}</a></div
                >
              </div>
              <div style="text-align: center; color: green"
                >{{ '当前小版本号：' }}<div style="display: inline-block" id="Ver">{{ InitData?.Ver }}</div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </BaseComponent>
  </Spin>
</template>
<script lang="ts" setup>
  import BaseComponent from '../Comm/BaseComponent.vue';
  import { Col, Row, RadioGroup, Radio, Button, Divider, message, Spin, Alert, Modal } from 'ant-design-vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { h, ref } from 'vue';

  const loading = ref<boolean>(false);
  const loadingMessage = ref();
  const AlertVisiable = ref<boolean>(false);
  const InitData = ref<any>({});
  const InitPage = async () => {
    try {
      loading.value = true;
      loadingMessage.value = '检查安装环境';
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin');
      InitData.value = await handler.DoMethodReturnString('DBInstall_Init'); //执行方法，返回执行结果.
      console.log(InitData);
    } catch (e) {
      message.error(`错误信息：${e}`);
      loading.value = false;
      loadingMessage.value = '';
      return;
    } finally {
      loading.value = false;
      loadingMessage.value = '';
    }
  };
  //安装数据库
  const DoInstall = async () => {
    Modal.info({
      title: '提示信息',
      width: 1000,
      content: h('div', {}, [
        h('h3', '安装即将进行，如下几个问题，需要确认：'),
        h('p', '1. 您必须遵守GPL开源协议，点击确定就表明您已经理解了GPL协议内容。'),
        h('p', ['2. 如果您需要商务评估，请', h('a', { href: 'http://ccflow.org', target: '_blank' }, '联系我们'), '。']),
        h('p', '3. 您配置的连接数据库的用户必须是管理员权限，因为系统会创建删除：表、视图、索引、主键、以及数据的权限。'),
        h('p', ['4. 由于执行时间太长，浏览器会出现【此页面没有响应】,请点击【', h('span', { style: 'color: red' }, '等待'), '】按钮。']),
      ]),
      onOk() {
        handleInstall();
      },
    });
  };
  //安装操作
  const handleInstall = async () => {
    try {
      loading.value = true;
      loadingMessage.value = '正在安装数据库，请稍后... 由于执行时间太长，浏览器会出现【此页面没有响应】,请点击【等待】按钮。';
      // loadingMessage.value = h('p', [
      //   '正在安装数据库，请稍后... 由于执行时间太长，浏览器会出现【此页面没有响应】,请点击【',
      //   h('span', { style: 'color: red' }, '等待'),
      //   '】按钮。',
      // ]);
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin');
      handler.AddPara('DemoType', '2'); //不安装demo.
      const data = await handler.DoMethodReturnString('DBInstall_Submit');

      if (data.indexOf('err@') == 0) {
        //发生错误
        var reg = new RegExp('err@', 'g');
        var err = data.replace(reg, '');
        alert(err);
        return;
      }
      if (data.indexOf('info@') == 0) {
        var info = data.replace('info@', '');
        alert(info);
      }

      var url = '';
      var osModel = 0;

      const pathname = location.pathname;
      //saas模版
      if (osModel == 2) url = pathname + 'Log';
      else url = pathname;

      window.location.href = url;

      // if (data.indexOf('url@') == 0) {
      //   var url = data.replace('url@', '');
      //   SetHref(url);
      // }
    } catch (e) {
      message.error(`安装失败，错误信息：${e}`);
      return;
    } finally {
      loading.value = false;
      loadingMessage.value = '';
    }
    message.success('安装成功');
  };
  InitPage();
</script>
<style>
  /* style="flex-direction: row; flex-wrap: nowrap; width: 100%; justify-content: space-between" */
  .ant-row {
    display: flex;
    flex-flow: row nowrap;
    width: 100%;
  }
  .ant-spin-blur {
    opacity: 0.9;
  }
</style>
