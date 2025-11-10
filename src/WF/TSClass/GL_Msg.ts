import dayjs from 'dayjs';
import { GenerListPageShowModel, PageBaseGenerList } from '../../bp/UIEntity/PageBaseGenerList';
import HttpHandler from '../../utils/gener/HttpHandler';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import BSEntity from '/@/utils/gener/BSEntity';
import { GloWF } from '../Admin/GloWF';
import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';
import { IsMobile } from '/@/utils/gener/StringUtils';
import { router } from '/@/router';
import { isComPage } from '/@/utils/gl';
import { message } from 'ant-design-vue';
import { SMS } from '../WorkOpt/Email/SMS';
import { GenerWorkFlowExt } from '/@/WF/TSClass/FlowData/GenerWorkFlowExt';
import { useI18n } from '/@/hooks/web/useI18n';
const { t } = useI18n();

export class GL_Msg extends PageBaseGenerList {
  constructor() {
    super('GL_Msg');
    this.PageTitle = '消息列表';
  }
  //重写的构造方法，初始化参数.
  async Init() {
    this.Icon = '';
    this.DTFieldOfSearch = ''; //按照日期范围查询的字段.
    this.DTFieldOfLabel = ''; //日期字段名.
    this.LinkField = 'EmailTitle'; //关键字段.
    this.DTFieldOfSearch = 'RDT';
    this.DTFieldOfLabel = '日期';
    this.PageSize = 15; // 分页的页面行数, 0不分页.
    this.HisGLShowModel = GenerListPageShowModel.Table;
    this.BtnOfToolbar = `${'批量删除'},${'设置已读'}`;
    this.ShowCheckBox = true;
    this.LabFields = 'MsgType';
    // 定义列，这些列用于显示.
    this.Columns = [
      { Key: 'MyPK', Name: '主键', IsShow: false },
      { Key: 'EmailTitle', Name: '标题', IsShow: true, width: 350 },
      { Key: 'RDT', Name: '日期', IsShow: true, width: 150 },
      { Key: 'FlowName', Name: '流程名称', IsShow: false },
      { Key: 'WordID', Name: 'WordID', IsShow: false },
      { Key: 'SenderName', Name: '发送人', IsShow: true, width: 150 },
      { Key: 'Btns', Name: '操作', IsShow: false },
    ];
    //获得数据源.
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Portal');
    let data: any = await handler.DoMethodReturnJson('Message_Init');
    if (data.hasOwnProperty('Messages') == true) data = data['Messages'];
    //处理数据,增加ICON
    for (let index = 0; index < data.length; index++) {
      const en = data[index];
      if (en.MsgType == 'SendSuccess') en.MsgType = '@新工作=green';
      if (en.MsgType.startsWith('HuiQian') || en.MsgType == 'HuiQianType') en.MsgType = '会签邀请';
      if (en.MsgType == 'ReturnAfter') en.MsgType = '@退回=red';
      if (en.MsgType == 'DoPress') en.MsgType = '@催办=red';
      if (en.MsgType == 'HangUp') en.MsgType = '@挂起=yellow';
      if (en.MsgType == 'CC') en.MsgType = '@抄送=blue';
      if (en.MsgType == 'Self') en.MsgType = '@自定义=red';
      if (en.MsgType == 'Etc') en.MsgType = '@其他=gray';
      if (en.MsgType == 'AskFor') en.MsgType = '@加签=green';
      if (en.MsgType == 'Shift') en.MsgType = '@移交=red';
      if (en.MsgType == 'RejectHungup') en.MsgType = '@拒绝挂起=red';
      if (en.MsgType == 'Err') en.MsgType = '@错误=red';
      if (en.MsgType == 'UndoneAfter') en.MsgType = '@撤销=red';
      en.RDT = !!en.RDT ? (en.RDT == '无' ? '无' : dayjs(en.RDT).format('YYYY-MM-DD HH:mm')) : '';
      en.Btns = '删除';
    }
    //设置数据源.
    this.Data = data;
  }

  //打开页面.
  async LinkFieldClick(object: Record<string, any>) {
    const flowOpenModel = CommonConfig.FlowOpenModel || 0;
    const en = new BSEntity('BP.WF.SMS', object.MyPK);
    await en.RetrieveFromDBSources();
    await en.DoMethodReturnString('DoRead');
    const paraStr = GloWF.AtParaStringToJson(object.AtPara);
    //消息有可能是过时的处理信息
    const gwf = new GenerWorkFlowExt();
    gwf.WorkID = paraStr.WorkID;
    const count = await gwf.RetrieveFromDBSources();
    const nodeID = count != 0 ? gwf.FK_Node : paraStr?.FK_Node;
    let url =
      '/#/WF/MyView?FK_Flow=' +
      (paraStr?.FlowNo || paraStr?.FK_Flow) +
      '&FlowNo=' +
      (paraStr?.FlowNo || paraStr?.FK_Flow) +
      '&WorkID=' +
      paraStr?.WorkID +
      '&FK_Node=' +
      nodeID +
      '&NodeID=' +
      paraStr?.NodeID;

    const PathHash = location.hash;
    let urlPath: any = '';
    if (IsMobile()) {
      const mobileUrl = url.replace('/src/WF/', '/CCMobile/').replace('.vue', '');
      try {
        router.push(mobileUrl);
      } catch (e: any) {
        location.hash = '#' + mobileUrl;
      }
      return;
    }
    if (PathHash.includes('/WF/Port') || PathHash.includes('/FEForward') || flowOpenModel == 3) {
      urlPath = isComPage(url);
      url = urlPath + '&win=true';
      // 新标签页打开;
      window.open(url);
      return;
    }
    return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);

    if (flowOpenModel === 0) return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
    if (flowOpenModel === 1) return new GPNReturnObj(GPNReturnType.OpenUrlByModal, url);
    if (flowOpenModel === 2) return new GPNReturnObj(GPNReturnType.OpenUrlByTab, url);
    if (flowOpenModel === 3) return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
  }

  async BtnClick(btnName: string, object: Record<string, any>, rowKeys: string) {
    // 行操作-删除
    if (btnName === '删除') {
      if (!confirm('确认要删除吗?')) {
        return new GPNReturnObj(GPNReturnType.Message, '取消删除');
      }
      const en = new SMS(object.MyPK);
      await en.Delete();
      return new GPNReturnObj(GPNReturnType.Reload); //要刷新.
    }
    // 批量操作-设置已读
    const ids = !!rowKeys ? rowKeys.split(',') : [];
    if (btnName === '设置已读') {
      if (ids.length == 0) {
        message.info('请选择要设置已读的数据');
        return;
      }
      if (!confirm(`确定要将所选的[${ids.length}]条数据设置已读吗？`)) {
        return new GPNReturnObj(GPNReturnType.Message, '取消设置已读');
      }
      for (const id of ids) {
        const en = new SMS(id);
        const i = await en.RetrieveFromDBSources();
        if (i == 0) {
          message.error(`数据不存在，无法设置已读。表[Sys_SMS]，主键[${id}]`);
          continue;
        }
        en.IsRead = 1;
        await en.Update();
      }
      // 所有操作完成后再执行刷新
      return new GPNReturnObj(GPNReturnType.Reload);
    }
    // 批量操作-删除
    if (btnName === '批量删除') {
      if (ids.length == 0) {
        message.info('请选择要删除的数据');
        return;
      }
      if (!confirm(`确定要删除所选的[${ids.length}]条数据吗？`)) {
        return new GPNReturnObj(GPNReturnType.Message, '取消删除');
      }
      for (const id of ids) {
        const en = new SMS(id);
        await en.Delete();
      }
      return new GPNReturnObj(GPNReturnType.Reload);
    }
  }
}
