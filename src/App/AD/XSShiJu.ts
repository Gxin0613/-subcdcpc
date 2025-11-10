import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import WebUser from '/@/bp/web/WebUser';
import { EntitiesNoName, EntityNoName } from '/@/bp/en/EntityNoName';
import { DataType } from '/@/bp/en/DataType';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { DTSearchWay } from '/@/bp/en/Map/SearchNormal';
import { XiangZhen } from './Dict/XiangZhen';
import { DiQu } from './Dict/DiQu';
import { MeiTi } from './MeiTi';
import { QuXian } from './Dict/QuXian';
import Dev2InterfaceCCBill from '/@/CCFast/Dev2InterfaceCCBill';
import { SPLX } from './Dict/SPLX';
import { RefMethod } from '/@/bp/en/Map/RefMethod';

/**
 * 线索
 */
export class XSShiJu extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.AD.XSShiJu');
    if (!!pkval) this.setPKVal(pkval);
  }

  /// <summary>
  /// 实体的权限控制
  /// </summary>
  public override get HisUAC() {
    const uac = new UAC();
    uac.OpenForAdmin();
    if (WebUser.No == 'admin') {
      uac.IsDelete = true;
      uac.IsUpdate = true;
      uac.IsInsert = true;
    } else {
      uac.IsDelete = true;
      uac.IsUpdate = true;
      uac.IsInsert = true;
    }
    return uac;
  }

  public override get EnMap() {
    const map = new Map('AD_XS', '线索');
    map.CodeStruct = '3';
    map.GroupBarShowModel = 1;

    map.AddTBStringPK('No', null, '编号', true, true, 1, 100, 100);
    map.AddTBString('Name', null, '名称', true, false, 0, 100, 200);
    map.AddDDLSysEnum('MTLX', 0, '媒体类型', true, true, 'MTLX', '@0=互联网@1=户外@2=广播@3=电视@4=报纸');
    map.AddDDLEntities('SPLX', null, '商品类型', new SPLX(), false, null, false);
    map.AddTBInt('ShiChang', 12, '违法时长(秒)', true, true);

    //停播、立案核查、处罚、移送司法、其他
    map.AddDDLSysEnum('CLFA', 0, '处理方案', true, true, 'CLFA', '@0=停播@1=立案核查@2=处罚@3=移送司法@4=其他');
    map.AddDDLSysEnum('XSSta', 0, '状态', true, true, 'XSSta', '@0=未派发@1=派发到市局@2=派发到区县@3=派发到乡镇@4=办理中@5=已办结');
    map.AddTBString('IncName', null, '商家名称', false, false, 0, 100, 100);
    map.AddDDLEntities('MeiTi', null, '媒体', new MeiTi(), false);

    map.AddTBString('DiQu', null, '地区', true, false, 0, 100, 200);
    map.AddDDLEntities('QuXian', null, '区县', new QuXian(), false);
    map.enMapExts.SetJiLian('DiQu', 'QuXian', `SELECT No,Name FROM CN_QuXian WHERE DiQu='@Key'`); //级联模式.
    map.AddDDLEntities('XiangZhen', null, '乡镇', new XiangZhen(), false);
    map.enMapExts.SetJiLian('QuXian', 'XiangZhen', `SELECT No,Name FROM CN_XiangZhen WHERE QuXian='@Key'`); //级联模式.
    map.AddTBString('Msg', null, '处理消息', false, false, 0, 100, 100);

    map.AddTBString('SLEmpNo', null, '受理人员编号', false, false, 0, 100, 100);
    map.AddTBString('SLEmpName', null, '受理人员名称', false, false, 0, 100, 100);

    map.AddTBString('HCEmpNo', null, '核查人员编号', false, false, 0, 100, 100);
    map.AddTBString('HCEmpName', null, '核查人员名称', false, false, 0, 100, 100);

    map.AddTBDate('RDT', null, '创建日期', true, true);
    map.AddTBDate('XFData', null, '下发日期', true, true);

    // map.AddTBString('DiQuNo', null, '市局', true, true, 0, 100, 100);
    // map.AddTBString('QuXianNo', null, '区县', true, true, 0, 100, 100);
    // map.AddTBString('XiangZhenNo', null, '乡镇', true, true, 0, 100, 100);
    //查询条件.
    map.AddSearchAttr('MTLX');
    map.AddSearchAttr('SPLX');
    map.AddSearchAttr('XSSta');
    map.AddSearchAttr('QuXian');
    map.DTSearchWay = DTSearchWay.ByDateRange;
    map.AddHidden('DiQu', '=', '@WebUser.DeptNo'); //隐藏的查询条件.

    map.AddGroupMethod('案件办理');
    const rm2 = new RefMethod();
    rm2.Title = '下发到区县';
    rm2.ClassMethod = 'XiaFa';
    rm2.IsCanBatch = true; //是否可以批处理.
    rm2.HisMap.AddTBString('note', null, '下发说明', true, false, 0, 100, 1000, true);
    map.AddRefMethod(rm2);
    // rm2.HisMap.AddTBString('Emps', null, '选择人员', true, false, 0, 100, 1000, true);
    // rm2.HisMapExts.SetPopTreeEns(
    //   'Emps',
    //   GloWF.srcDeptLazily,
    //   '@WebUser.DeptNo',
    //   GloWF.srcEmpLazily,
    //   'GloWF.srcEmpSearchKey',
    //   true,
    //   '800px',
    //   '500px',
    //   '负责人',
    //   'icon-people',
    //   '1',
    //   '1',
    // );
    const rm22 = new RefMethod();
    rm22.Title = '直接办理';
    rm22.ClassMethod = 'BanLi';
    rm22.IsCanBatch = true; //是否可以批处理.
    rm22.HisMap.AddTBString('note', null, '输入办理结果', true, false, 0, 100, 1000, true);
    rm22.HisMap.AddDDLSysEnum('CLFA', 0, '处理方案', true, true, 'CLFA', '@0=停播@1=立案核查@2=处罚@3=移送司法@4=其他');
    rm22.IsCanBatch = true; //是否可以批处理.
    map.AddRefMethod(rm22);

    map.AddRM_Commpent_BBS('留言板', null, 'TS.AD.XS');
    map.AddRM_Commpent_Track('处理过程', null, 'TS.AD.XS');

    this._enMap = map;
    return this._enMap;
  }
  public async BanLi(note: string, chuliFangAn: number): Promise<string> {
    //  if (this.XSSta != 1) return 'err@目前是:' + this.XSStaText + '状态.';
    this.XSSta = 5; //办理完成.
    this.CLFA = 4;
    this.Msg = note;
    await this.Update();
    await Dev2InterfaceCCBill.AddFrmTrackInfo('TS.AD.XS', '广告', this.No, 'Info', '执行办理', note);
    return '下发成功';
  }

  public async XiaFa(note: string): Promise<string> {
    //  if (this.XSSta != 1) return 'err@目前是:' + this.XSStaText + '状态，您不能执行下发到区县.';
    this.XFData = DataType.CurrentDateTime;
    this.Msg = note;
    this.XSSta = 2; //下发到区县.
    await this.Update();
    await Dev2InterfaceCCBill.AddFrmTrackInfo('TS.AD.XS', '广告', this.No, 'Info', '市局下发成功', note);
    return '下发成功';
  }

  public async StartFlow() {
    const url = '/src/WF/MyFlow.vue?FlowNo=001&XSBH=' + this.No + '&XSMC=' + this.Name;
    return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
  }

  override async beforeDelete(): Promise<boolean> {
    return Promise.resolve(true);
  }
  override async beforeInsert(): Promise<boolean> {
    //   this.MyPK = DBAccess.GenerGUID();
    this.RDT = DataType.CurrentDate;
    return Promise.resolve(true);
  }
  override async beforeUpdateInsertAction(): Promise<boolean> {
    return Promise.resolve(true);
  }
  protected override afterUpdate(): Promise<boolean> {
    return Promise.resolve(true);
  }

  override async afterInsert(): Promise<boolean> {
    return Promise.resolve(true);
  }
}

/**
 * 线索s
 */
export class XSShiJus extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new XSShiJu();
  }
  constructor() {
    super();
  }
}
