import { FrmTrack } from './Components/FrmTrack';
import { SubTablePosition } from '/@/bp/en/Config';
import { Entities } from '/@/bp/en/Entities';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import HttpHandler from '/@/utils/gener/HttpHandler';
export class GloComm {
  public static GenerButton(btnName: string) {
    if (btnName == '') return;
  }
  public static GenerBtnICON(btnName: string) {
    if (btnName.indexOf('新建') > 0) return 'icon-plus';
    if (btnName.indexOf('删除') > 0) return 'icon-close';
    if (btnName.indexOf('修改') > 0 || btnName.indexOf('编辑') > 0) return 'icon-note';

    switch (btnName) {
      case '发起':
      case '发起流程':
      case '启动流程':
        return 'icon-paper-plane';
      case '近期发起':
        return 'icon-user';
      case '近期':
      case '近期工作':
        return 'icon-envelope';
      case '超时工作':
        return 'icon-bell';
      case '催办':
        return 'icon-bell';
      case '撤销发送':
        return 'icon-drop';
      default:
        return '';
    }
  }
  public static MyWorkToolbarICON(btnName: string) {
    switch (btnName) {
      case 'Send': //发送.
        return 'icon-paper-plane';
      case 'Return': //退回
        return 'icon-arrow-left-circle';
      case 'Shift': //移交
        return 'icon-control-forward';
      case 'Track': //轨迹.
        return 'icon-film';
      case 'Delete': //删除流程.
      case 'Del':
        return 'icon-trash';
      case 'EndFlow': //结束流程.
        return 'icon-minus';
      case 'ShowParentForm': //查看父流程.
        return 'icon-eye';
      case 'Thread': //子线程
        return 'icon-shuffle';
      case 'JumpWay': //跳转
        return 'icon-arrow-right';
      case 'Press': //催办
        return 'icon-bell';
      case 'PrintHtml': //打印Html
        return ' icon-envelope-letter';
      case 'PrintZip': //打包下载
        return 'icon-arrow-down-circle';
      case 'PrintDoc': //打印单据
        return 'icon-printer';
      case 'HuiQian': //按钮标签
        return 'icon-tag';
      case 'AddLeader': //加主持人
        return 'icon-plus';
      case 'OfficeBtn': //OfficeBtn. 打开公文
        return 'icon-book-open';
      case 'Hungup': //挂起
        return 'icon-minus';
      case 'Search': //查询
        return 'icon-magnifier';
      case 'TransferCustom': //流转自定义
        return 'icon-cursor-move';
      case 'FrmDBVer': //数据版本
        return 'icon-layers';
      case 'FrmDBRemark': //数据批阅
        return 'icon-eye';
      case 'PR': //重要性
        return 'icon-exclamation';
      case 'CH': //节点时限
        return 'icon-hourglass';
      case 'Allot': //分配
        return 'icon-shuffle';
      case 'Focus': //关注
        return 'icon-user-following';
      case 'Confirm': //确认
        return 'icon-check';
      case 'List': //列表
        return 'icon-list';
      case 'Batch': //批量审核
        return 'icon-social-dropbox';
      case 'Note': //备注
        return 'icon-note';
      case 'Help': //帮助
        return ' icon-question';
      case 'Scrip': //小纸条
        return 'icon-cursor';
      case 'FlowBBS': //评论
        return 'icon-speech';
      case 'IM': //即时通讯
        return 'icon-phone';
      case 'Next': //下一条
        return 'icon-arrow-right-circle';
      case 'UnSend': //撤销
        return 'icon-action-undo';
      case 'FixFlow': //冻结
        return 'icon-target';
      case 'ChangeOrg': //切换部门
        return 'icon-refresh';
      case 'TZWorkerEnable': //未来处理人
        return 'icon-people';
      case 'Save': //保存
        return 'icon-check';
      case 'DelayedSend':
        return 'icon-speedometer';
      case 'CC': //抄送
        return 'icon-cursor';
      case 'OfficeTrackEnalbe': //公文版本
        return 'icon-book-open';
      case 'KKViewEnable': //kk在线预览
        return 'icon-eye';
      case 'DownGovPDFLab': //下载公文正文
        return 'icon-envelope-letter';
      case 'DownVSTOEnable': //下载vsto插件
        return 'icon-cloud-upload';
      case 'DocWord':
        return 'icon-doc';
      case 'FlowRpt': // 流程干预
        return 'icon-settings';
      default:
        return 'icon-drop';
    }
  }

  public static UrlGPN(enName: string, sortNo: string, myparas?: string) {
    if (myparas == null || myparas == undefined) myparas = '';
    return `/@/WF/Comm/UIEntity/GroupPageNew.vue?EnName=${enName}&SortNo=${sortNo}${myparas}`;
    // return `//WF/Comm/UIEntity/GroupPageNew.vue?EnName=${enName}&SortNo=${sortNo}${myparas}`;
  }
  public static UrlGPE(en: PageBaseGroupEdit, pkval: string, paras = '') {
    return `/@/WF/Comm/UIEntity/GroupPageEdit.vue?EnName=${en.classID}&PKVal=${pkval}${paras}`;
  }
  public static UrlGPEExt(ens: string, pkval: string, paras = '') {
    return `/@/WF/Comm/UIEntity/GroupPageEdit.vue?EnName=${ens}&PKVal=${pkval}${paras}`;
  }
  public static UrlComponent(enName: string, pkval: string, paras = '') {
    if (enName.startsWith('TS.')) return `/src/WF/Comm/En.vue?EnName=${enName}&PKVal=${pkval}${paras}`;
    if (enName.startsWith('GL_')) return `/src/WF/views/GenerList.vue?EnName=${enName}&PKVal=${pkval}${paras}`;
    if (enName.startsWith('TreeEns_')) return `/src/WF/Comm/TreeEns.vue?EnName=${enName}&PKVal=${pkval}${paras}`;
    if (enName.startsWith('GPN_')) return `/src/WF/Comm/UIEntity/GroupPageNew.vue?EnName=${enName}&PKVal=${pkval}${paras}`;
    if (enName.startsWith('DataV_')) return `/src/views/data_visualization/index.vue?EnName=${enName}&PKVal=${pkval}${paras}`;
  }
  // 创建实体，不带主键，url参数形式，key1=val1&key2=val2
  public static UrlCreateEn(enName: string, createParams: string) {
    return `/src/WF/Comm/En.vue?EnName=${enName}&${createParams}`;
  }
  public static UrlEn(enName: string, pkval: string, paras = '') {
    return `/src/WF/Comm/En.vue?EnName=${enName}&PKVal=${pkval}&${paras}`;
  }
  public static UrlEnOnly(enName: string, pkval: string) {
    return `/src/WF/Comm/EnOnly.vue?EnName=${enName}&PKVal=${pkval}`;
  }
  public static UrlSearch(enName: string, paras = '') {
    return `/src/WF/Comm/Search.vue?EnName=${enName}${paras}`;
  }
  public static UrlMobileSearch(enName: string, paras = '') {
    return `/src/CCMobile/Comm/Search.vue?EnName=${enName}${paras}`;
  }
  public static UrlTree(enName: string, pkval = '') {
    return `/src/WF/Comm/Tree.vue?EnName=${enName}&PKVal=${pkval}`;
  }
  public static UrlTreeEns(enName: string, paras = '') {
    return `/src/WF/Comm/TreeEns.vue?EnName=${enName}${paras}`;
  }
  public static UrlDtlSearch2024(enName: string, pkval: string, dtlEnName: string, refField: string) {
    return `/src/WF/Comm/Dtl/DtlSearch.vue?EnName=${dtlEnName}&PKVal=${pkval}&RefPK=${refField}&RefMainEnName=${enName}`;
  }
  public static UrlDtlSearch(
    mainEnName: string,
    enDtlEnName: string,
    refKey: string,
    pkval: string,
    butsTableTop: string | null = '',
    butsItem: string | null = '',
    showAttrs: string | null = '',
    isMove: boolean | null = false,
    filterExp: string | null = '',
  ) {
    const url = `/src/WF/Comm/Dtl/DtlSearch.vue?PKVal=${pkval}&EnName=${enDtlEnName}&RefPK=${refKey}&RefMainEnName=${mainEnName}&ButsTableTop=${butsTableTop || ''}&ButsItem=${
      butsItem || ''
    }&ShowAttrs=${showAttrs}&IsMove=${isMove ? '1' : '0'}${filterExp}`;

    return url;
  }
  public static UrlDtlBatch(enName: string, paras = '') {
    return `/src/WF/Comm/Dtl/DtlBatch.vue?EnName=${enName}${paras}`;
  }
  public static UrlEns(enName: string, paras = '') {
    return `/src/WF/Comm/Ens.vue?EnName=${enName}${paras}`;
  }
  public static UrlPanelGroup(enName: string, paras = '') {
    return `/src/WF/Comm/PanelGroup.vue?EnName=${enName}${paras}`;
  }
  public static UrlGroup(enName: string, paras = '') {
    return `/src/WF/Comm/Group.vue?EnName=${enName}${paras}`;
  }

  public static UrlFlowD(flowNo: string, paras = '') {
    return `/#/WF/Comm/Entity?EnName=TS.WF.FD.FlowJiJian&PKVal=${flowNo}${paras}`;
  }

  public static UrlMyFlow(flowNo: string, paras = '') {
    return `/#/WF/MyFlow?FlowNo=${flowNo}${paras}`;
  }

  public static UrlMyView(workID: number, paras = '') {
    return `/src/WF/MyView.vue?WorkID=${workID}${paras}`;
  }
  public static UrlMyCC(workID: number, paras = '') {
    return `/src/WF/MyCC.vue?WorkID=${workID}${paras}`;
  }
  public static UrlGenerList(enName: string, paras = '') {
    return `/@/WF/views/GenerList.vue?EnName=${enName}${paras}`;
  }
  public static UrlSearchGenerList(paras = '') {
    return `/@/WF/views/GenerList.vue?EnName=GL_SearchLinkField${paras}`;
  }
  public static UrlDept(enName: string, _paras = '') {
    return `/src/Portal/Standard/SelectOneOrg.vue`;
  }
  public static IframeGenerList(enName: string, paras = '') {
    return `/#/WF/GenerList?EnName=${enName}${paras}`;
  }
  public static UrlSearchBill(frmID: string) {
    return `/src/CCFast/CCBill/SearchBill.vue?displayMode=table&FrmID=${frmID}`;
  }
  public static UrlGroupBill(frmID: string) {
    return `/src/CCFast/CCBill/SearchBill.vue?displayMode=group&FrmID=${frmID}`;
  }
  public static UrlRptBill(frmID: string) {
    return `/src/CCFast/CCBill/SearchBill.vue?displayMode=rpt&FrmID=${frmID}`;
  }
  public static UrlMyBill(frmID: string, oid: number) {
    return `/src/CCFast/CCBill/MyBill.vue?FrmID=${frmID}&OID=${oid}&WorkID=${oid}`;
  }
  public static UrlAskFrm(myPK: string, paras = '') {
    return `/src/CCFast/CCBill/AskFrm/MyAskFrm.vue?RefNo=${myPK}${paras}`;
  }
  public static UrlSearchAskFrm(myPK: string, paras: string) {
    return `/src/CCFast/CCBill/AskFrm/SearchAskFrm.vue?RefMyPK=${myPK}${paras}`;
  }
  public static UrlMyEntityNoName(frmID: string, oid: number) {
    return `/src/CCFast/CCBill/MyBillEntityNoName.vue?FrmID=${frmID}&OID=${oid}&WorkID=${oid}`;
  }
  public static UrlSearchDict(frmID: string) {
    return `/src/CCFast/CCBill/SearchDict.vue?displayMode=table&FrmID=${frmID}`;
  }
  public static UrlGroupDict(frmID: string) {
    return `/src/CCFast/CCBill/SearchDict.vue?displayMode=group&FrmID=${frmID}`;
  }

  public static UrlSearchEntityNoName(frmID: string) {
    return `/src/CCFast/CCBill/SearchEntityNoName.vue?displayMode=table&FrmID=${frmID}`;
  }
  public static UrlGroupEntityNoName(frmID: string) {
    return `/src/CCFast/CCBill/SearchEntityNoName.vue?displayMode=group&FrmID=${frmID}`;
  }
  public static UrlRptEntityNoName(frmID: string) {
    return `/src/CCFast/CCBill/SearchDict.vue?displayMode=rpt&FrmID=${frmID}`;
  }

  public static UrlRptDict(frmID: string) {
    return `/src/CCFast/CCBill/SearchDict.vue?displayMode=rpt&FrmID=${frmID}`;
  }
  public static UrlRpt3D(frmID: string, nd: string) {
    return `/src/WF/Comm/Rpt3D.vue?EnName=${frmID}&${nd}`;
  }
  public static Dtl2DFixRow(
    title: string,
    ensDtl: Entities,
    refKey: string,
    sort1: string,
    sort2: string,
    sort12RefKey: string,
    icon: string,
    filterExp: string,
    _pos: SubTablePosition,
    sort2IsMerge: '0' | '1' = '0',
    isReloadSort: boolean,
    isOrderBySort1: boolean,
    butsTableTop: string,
  ) {
    const urlStart = '/src/WF/Comm/Dtl/Dtl2DFixRow.vue';
    return `${urlStart}?Sort1=${sort1}&Sort2=${sort2}&Sort12RefKey=${sort12RefKey}&EnName=${ensDtl.GetNewEntity.classID}&RefPK=${refKey}&RefMainEnName=${ensDtl.EnClassID}&DtlPK=${
      ensDtl.GetNewEntity.PK
    }${filterExp}&Sort2IsMerge=${sort2IsMerge}&isReloadSort=${isReloadSort ? 1 : 0}
      &IsOrderBySort1=${isOrderBySort1 ? 1 : 0}&ButsTableTop=${butsTableTop}`;
  }
  public static UrlWhiteScreenDesigner(pageID: string, frmID = '') {
    let url = `/src/CCFast/Views/RptWhiteMain.vue?PageID=${pageID}`;
    if (frmID) {
      url += '&FrmID=' + frmID;
    }
    return url;
  }
  public static UrlWhiteScreenViewer(pageID: string, frmID = '') {
    let url = `/src/CCFast/Views/RptWhiteMain.vue?PageID=${pageID}`;
    if (frmID) {
      url += '&FrmID=' + frmID;
    }
    return url;
  }

  /**
   *
   * @param frmID 表单实体ID
   * @param pkval 主键WorkID/No/MyPK
   * @param ActionType 活动标记
   * @param actionName 名称
   * @param msg 消息.
   */
  public static async WriteFrmTrack(frmID: string, pkval: string, ActionType: string, actionName: string, msg: string) {
    const en = new FrmTrack();
    en.FrmID = frmID;
    en.WorkID = pkval;
    en.ActionType = ActionType;
    en.ActionTypeText = actionName;
    en.Msg = msg;
    await en.Insert();
  }
  /**
   *  语言翻译.
   * @param txt 要翻译的文本
   * @param toLang 翻译的语言编号.
   * @returns 翻译内容
   */
  public static async ToLang(txt: string, toLang: string) {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Comm');
    handler.AddPara('Txt', txt);
    handler.AddPara('ToLang', toLang);
    try {
      const data = await handler.DoMethodReturnJson('ToLang');
      return data.translateResults;
    } catch {
      return '';
    }
  }
}
