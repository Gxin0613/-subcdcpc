import WebUser from '/@/bp/web/WebUser';
import { FlowExt } from '/@/WF/Admin/AttrFlow/FlowExt';
import { getAuthCache, setAuthCache } from '/@/utils/auth';
import { ADMIN_TOKEN_KEY, TOKEN_KEY } from '/@/enums/cacheEnum';
import { message } from 'ant-design-vue';
import { GetUrlToJSON } from '/@/utils/gener/StringUtils';
import { useUserStoreWithOut } from '/@/store/modules/user';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import { DataType } from '/@/bp/en/DataType';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { GloComm } from '../Comm/GloComm';
import dayjs from 'dayjs';

export class GL_FrmDBVerHZ extends PageBaseGenerList {
  override OnTextBlur(_object: Record<string, any>) {
    throw new Error('Method not implemented.');
  }
  constructor() {
    super('GL_FrmDBVerHZ');
    this.PageTitle = '对比汇总';
  }
  //重写的构造方法.
  async Init() {
    this.LinkField = 'RecName';
    this.GroupFields = ''; //分组字段.
    this.GroupFieldDefault = ''; //分组字段.
    this.PageSize = 0; // 分页的页面行数, 0不分页.
    const frmID = this.RequestVal('FrmID'); //表单ID.
    const workID = this.RequestVal('WorkID');

    // 日期，操作人，是否变更?，节点名称,
    //定义列.
    // {
    //     "MyPK": "a9a93c60-2a10-4130-ba05-675372e7586a",
    //     "FrmID": "Frm_CeShi001",
    //     "FrmName": "测试001",
    //     "NodeID": 9101,
    //     "NodeName": "Start Node",
    //     "FrmVer": 1,
    //     "RefPKVal": "117",
    //     "ChangeFields": "",
    //     "ChangeNum": 0,
    //     "TrackID": "1961712993750220800",
    //     "RecNo": "admin",
    //     "RecName": "admin",
    //     "RDT": "2025-08-30 16:49",
    //     "KeyOfEn": "",
    //     "TrackIDs": ",1961712993750220800,",
    //     "IsChange": "1"
    // }

    this.Columns = [
      { Key: 'MyPK', Name: 'MyPK', IsShow: false, IsShowMobile: false, DataType: 1, width: 100 },
      { Key: 'FrmID', Name: '表单ID', IsShow: false, IsShowMobile: false, DataType: 1, width: 100 },
      { Key: 'FrmName', Name: '表单名称', IsShow: false, IsShowMobile: false, DataType: 1, width: 100 },
      { Key: 'RecName', Name: '操作人', IsShow: true, IsShowMobile: false, DataType: 1, width: 100 },
      { Key: 'NodeID', Name: '节点ID', IsShow: false, IsShowMobile: false, DataType: 1, width: 100 },
      { Key: 'NodeName', Name: '节点名称', IsShow: true, IsShowMobile: false, DataType: 1, width: 100 },
      { Key: 'RDT', Name: '日期', IsShow: true, IsShowMobile: false, DataType: DataType.AppDateTime, width: 150 },
      { Key: 'TrackID', Name: 'TrackID?', IsShow: false, IsShowMobile: false, DataType: 1, width: 100 },
      { Key: 'IsChange', Name: '是否变更?', IsShow: true, IsShowMobile: false, DataType: 1, width: 100 },
    ];

    const en = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
    en.AddPara('WorkID', workID || '');
    en.AddPara('FrmID', frmID || '');
    const data = await en.DoMethodReturnJson('FrmDBVer_GenerVerByFrmID');
    data.forEach((en) => {
      if (en.IsChange == 1) {
        en.IsChange = '是';
      } else if (en.IsChange) {
        en.IsChange = '否';
      }
      en.RDT = !!en.RDT ? (en.RDT == '无' ? '无' : dayjs(en.RDT).format('YYYY-MM-DD HH:mm')) : '';
    });

    //设置数据源.
    this.Data = data;
  }

  //打开页面.
  async LinkFieldClick(record: Record<string, any>) {
    const frmID = this.RequestVal('FrmID'); //表单ID.
    const workID = this.RequestVal('WorkID');
    const flowNo = this.RequestVal('FK_Flow') || this.RequestVal('FlowNo') || 0;
    const myPK = record.MyPK;
    const nodeID = record.NodeID;
    const TrackID = record.TrackID;
    const url = `/#/WF/FrmDBGener?WorkID=${workID}&FrmID=${frmID}&FK_Flow=${flowNo}&FlowNo=${flowNo}&FK_Node=${nodeID}&NodeID=${nodeID}&TrackID=${TrackID}&IshistoryData=1&MyPK=${myPK}`;
    return new GPNReturnObj(GPNReturnType.OpenIframeByModal, url, record.NodeName);
  }

  /**
   * 按钮操作，包含工具栏、行操作 ，
   * @param btnName 按钮名称
   * @param object 行数据
   * @param params 组件参数
   * @param callback 回调函数
   * @constructor
   */
  async BtnClick(btnName: string, record: Record<string, any>) {
    return;
  }
}
