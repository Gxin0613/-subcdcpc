import { GenerListPageShowModel, PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import BSEntity from '/@/utils/gener/BSEntity';
import { GloComm } from '../../Comm/GloComm';
import { defineComponent, h } from 'vue';
import { Modal } from 'ant-design-vue';
import { getAppEnvConfig } from '/@/utils/env';

export class GL_FlowCheckInfo extends PageBaseGenerList {
  override OnTextBlur(_object: Record<string, any>) {
    //throw new Error('Method not implemented.');
  }
  constructor() {
    super('GL_FlowCheckInfo');
    this.PageTitle = '流程检查';
  }
  //重写的构造方法，初始化参数.
  async Init() {
    const flowNo = this.RequestVal('FlowNo');
    this.GroupFields = 'NodeName'; //分组字段.
    // this.GroupFieldDefault = 'InfoType'; //分组字段.
    this.LabFields = 'InfoType';
    this.HisGLShowModel = GenerListPageShowModel.Table; //窗口的模式.
    const { VITE_GLOB_HIDE_HELP_DOCS } = getAppEnvConfig();
    if (!VITE_GLOB_HIDE_HELP_DOCS) {
      this.BtnOfToolbar = '帮助,测试运行';
    } else {
      this.BtnOfToolbar = '测试运行';
    }
    this.Columns = [
      { Key: 'NodeID', Name: '节点ID', IsShow: false, width: '10%' },
      { Key: 'NodeName', Name: '节点名称', IsShow: true, width: '30%' },
      { Key: 'ChekOption', Name: '检查内容', IsShow: true, width: '35%' },
      { Key: 'Msg', Name: '信息', IsShow: true, width: '10%' },
      { Key: 'InfoType', Name: '状态', IsShow: true, width: '15%' },
    ];

    //获得数据源.
    const flow = new BSEntity('BP.WF.Flow', flowNo);
    await flow.Retrieve();
    const data = await flow.DoMethodReturnString('DoCheck');
    data.forEach((en) => {
      if (en.InfoType == '警告') en.InfoType = '@警告=yellow';
      if (en.InfoType == '信息') en.InfoType = '@信息=green';
      if (en.InfoType == '错误') en.InfoType = '@错误=red';
    });
    //设置数据源.
    this.Data = data;
  }

  //打开页面.
  async LinkFieldClick(record: Record<string, any>) {}

  async BtnClick(btnName: string, _object: Record<string, any>) {
    if (btnName == '帮助') {
      const msg = `
        <div>
          <h2>说明：</h2>
          <p>1. 检测局限性：请注意，由于内外部环境的复杂性，我们的质检程序无法百分之百确保流程设计中不存在任何问题。</p>
          <p>2. 问题分级：质检程序将检测到的问题分为以下三个级别，以便您更好地理解和处理：</p>
          <ul>
            <li><strong style="color: green">信息</strong>：记录节点检测信息，不影响流程运转。</li>
            <li><strong style="color: #dada88">警告</strong>：较严重问题，根据实际情况进行调整，建议注意但不一定立即修改，不影响流程运转。</li>
            <li><strong style="color: red">错误</strong>：严重问题，必须<span style="color: red">立即修改</span>，否则可能影响流程运转。</li>
          </ul>
          <p>3. 错误处理：对于"错误"级别的问题，它们代表程序运行中的实际错误，必须立即进行修正以确保流程设计的准确性和有效性。</p>
          <p>4. 自动更正：CCBPM系统具备自动更正功能，能够识别并自动修复系统设置中的错误部分，减轻您的工作负担。</p>
          <p>5.数据表结构修复：此外，CCBPM还具备自动修复数据表结构的能力，确保数据的一致性和完整性，进一步提升流程设计的稳定性和可靠性。</p>
        </div>
      `;
      const HtmlContent = defineComponent({
        render() {
          return h('div', { innerHTML: msg });
        },
      });
      Modal.success({
        title: 'CCBPMP流程设计检测报告',
        content: h(HtmlContent),
        width: window.innerWidth * 0.5,
      });

      return;
    }
    if (btnName == '测试运行') {
      const flowNo = this.RequestVal('FlowNo');
      const url = GloComm.UrlGenerList('GL_FlowTester', '&FlowNo=' + flowNo);
      return new GPNReturnObj(GPNReturnType.Replace, url);
    }
  }
}
