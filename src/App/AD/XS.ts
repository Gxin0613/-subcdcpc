import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import WebUser from '/@/bp/web/WebUser';
import DBAccess from '/@/utils/gener/DBAccess';
import { EntitiesNoName, EntityNoName } from '/@/bp/en/EntityNoName';
import { SPLX, SPLXs } from './Dict/SPLX';
import { DataType } from '/@/bp/en/DataType';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { DTSearchWay } from '/@/bp/en/Map/SearchNormal';
import { Emp, Emps } from '/@/bp/port/Emp';
import { GloWF } from '/@/WF/Admin/GloWF';
import { XiangZhen, XiangZhens } from './Dict/XiangZhen';
import { SysEnums } from '/@/WF/Admin/FrmLogic/SysEnum/SysEnum';
import { DiQu, DiQus } from './Dict/DiQu';
import { MeiTi } from './MeiTi';
import { QuXian, QuXians } from './Dict/QuXian';
import { Dept, Depts } from '/@/bp/port/Dept';
import Dev2InterfaceCCBill from '/@/CCFast/Dev2InterfaceCCBill';
import { escape } from 'lodash';
import { DeptEmpStation } from '/@/bp/port/DeptEmpStation';
import { DeptEmp } from '/@/bp/port/DeptEmp';

/**
 * 线索
 */
export class XS extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.AD.XS');
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

    map.AddGroupAttr('广告信息');
    map.AddTBStringPK('No', null, '编号', true, true, 1, 100, 100);
    map.AddTBString('Name', null, '名称', true, false, 0, 100, 200);
    map.AddDDLEntities('SPLX', null, '商品类型', new SPLX(), false, null, true);
    map.AddTBInt('ShiChang', 12, '违法时长(秒)', true, true);
    map.AddTBDate('CJDT', null, '采集日期', true, true);
    map.AddDDLSysEnum('XSSta', 0, '状态', true, true, 'XSSta', '@0=未派发@1=派发到市局@2=派发到区县@3=派发到乡镇@4=办理中@5=已办结');
    map.AddTBString('WenTi', null, '问题说明', false, false, 0, 100, 100);

    map.AddGroupAttr('媒体信息');
    map.AddDDLEntities('MeiTi', null, '媒体', new MeiTi(), false);
    map.AddTBString('MTAddr', null, '地址', false, false, 0, 100, 100);
    map.AddDDLSysEnum('MTLX', 0, '媒体类型', true, true, 'MTLX', '@0=互联网@1=户外@2=广播@3=电视@4=报纸');
    map.AddTBString('MTResp', null, '媒体回复', false, false, 0, 100, 100);
    map.AddTBString('MTUrl', null, '视频', false, false, 0, 100, 100);
    map.AddAthSingle('MTJieTu', '截图', true, true);

    map.AddGroupAttr('商家信息');
    map.AddTBString('IncName', null, '商家名称', true, false, 0, 100, 100);
    map.AddTBString('IncUrl', null, '落地页', true, false, 0, 100, 100);

    map.AddTBString('WFNo1', null, '违法行为1', true, false, 0, 100, 100, true);
    map.AddTBStringDoc('WFYiJu1', null, '依据', true, true, true);
    map.SetPopList('WFNo1', 'SELECT No,Name FROM AD_WeiGui', false, '500', '600', '违法行为'); //pop返回值.
    map.enMapExts.SetAutoFillCtrls('WFNo1', `SELECT YiJu as WFYiJu1 FROM AD_WeiGui WHERE No='@Key' `);

    map.AddTBString('WFNo2', null, '违法行为1', true, false, 0, 100, 100, true);
    map.AddTBStringDoc('WFYiJu1', null, '依据', true, true, true);
    map.SetPopList('WFNo2', 'SELECT No,Name FROM AD_WeiGui ', false, '500', '600', '违法行为'); //pop返回值.
    map.enMapExts.SetAutoFillCtrls('WFNo2', `SELECT YiJu as WFYiJu2 FROM AD_WeiGui WHERE No='@Key' `);
    map.AddTBString('IncUrl', null, '视频', false, false, 0, 100, 100);
    map.AddAthSingle('IncJieTu', '截图', true, true);

    map.AddGroupAttr('管辖信息');
    map.AddDDLEntities('DiQu', null, '地区', new DiQu(), false);
    map.AddDDLEntities('QuXian', null, '区县', new QuXian(), false);
    map.AddDDLEntities('XiangZhen', null, '乡镇', new XiangZhen(), false);
    map.AddTBString('SLEmpNo', null, '受理人员编号', false, false, 0, 100, 100);
    map.AddTBString('SLEmpName', null, '受理人员名称', false, false, 0, 100, 100);
    map.AddTBString('HCEmpNo', null, '核查人员编号', false, false, 0, 100, 100);
    map.AddTBString('HCEmpName', null, '核查人员名称', false, false, 0, 100, 100);
    map.AddTBString('Msg', null, '处理消息', false, false, 0, 100, 100);
    //停播、立案核查、处罚、移送司法、其他

    map.AddTBDate('RDT', null, '创建日期', true, true);
    map.AddTBDate('XFData', null, '下发日期', true, true);

    map.AddGroupAttr('复核信息');
    map.AddBoolean('IsYiHuo', false, '是否存疑', true, true, true);
    map.AddTBStringDoc('FHNote', null, '备注信息', true, false, true);
    map.AddTBString('Label', null, '标签', true, false, 0, 100, 100);
    //map.AddTBStringDoc('FHNote', null, '专项名称', true, true, true);
    map.AddDDLSysEnum('CLFA', 0, '处理方案', true, true, 'CLFA', '@0=停播@1=立案核查@2=处罚@3=移送司法@4=其他');

    // map.AddTBString('DiQuNo', null, '市局', true, true, 0, 100, 100);
    // map.AddTBString('QuXianNo', null, '区县', true, true, 0, 100, 100);
    // map.AddTBString('XiangZhenNo', null, '乡镇', true, true, 0, 100, 100);
    //查询条件.
    map.AddSearchAttr('MTLX');
    map.AddSearchAttr('SPLX');
    map.AddSearchAttr('XSSta');
    map.AddSearchAttr('DiQu');
    // map.AddSearchAttr('QuXian');
    map.DTSearchWay = DTSearchWay.ByDateRange;

    map.AddGroupMethod('案件办理');
    const rm2 = new RefMethod();
    rm2.Title = '下发到市局';
    rm2.ClassMethod = 'XiaFa';
    rm2.IsCanBatch = true; //是否可以批处理.
    rm2.HisMap.AddBoolean('MTIsFenPai', false, '媒体是否下发');
    rm2.HisMap.AddTBString('MTNote', null, '媒体下发说明', true, false, 0, 100, 1000, true);
    rm2.HisMap.AddBoolean('IncIsFenPai', false, '商家是否下发');
    rm2.HisMap.AddTBString('IncNote', null, '商家下发说明', true, false, 0, 100, 1000, true);
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

    const rm242 = new RefMethod();
    rm242.Title = '标记存疑';
    rm242.ClassMethod = 'MarkNote';
    rm242.HisMap.AddTBString('note', null, '备注', true, false, 0, 100, 1000, true);
    rm242.IsCanBatch = true; //是否可以批处理.
    map.AddRefMethod(rm242);

    // const rm24244 = new RefMethod();
    // rm24244.Title = '设置标签';
    // rm24244.ClassMethod = 'MakeLabel';
    // rm24244.HisMap.AddTBString('note', null, '标签', true, false, 0, 100, 1000, true);
    // rm24244.IsCanBatch = true; //是否可以批处理.
    // map.AddRefMethod(rm24244);

    map.AddRM_Commpent_BBS('留言板');
    map.AddRM_Commpent_Track('处理过程');

    map.AddGroupMethod('功能处理');
    const r44 = new RefMethod();
    r44.Title = '生成组织数据';
    r44.ClassMethod = 'GenerOrgData';
    r44.IsCanBatch = false; //是否可以批处理.
    map.AddRefMethod(r44);

    const r3m5 = new RefMethod();
    r3m5.Title = '生成媒体数据';
    r3m5.ClassMethod = 'GenerMeiTiData';
    r3m5.IsCanBatch = false; //是否可以批处理.
    map.AddRefMethod(r3m5);

    const rm8 = new RefMethod();
    rm8.Title = '删除/测试数据';
    rm8.ClassMethod = 'GenerTestData';
    rm8.IsCanBatch = false; //是否可以批处理.
    map.AddRefMethod(rm8);

    this._enMap = map;
    return this._enMap;
  }
  public async MakeLabel(note: string): Promise<string> {
    this.FHLabel = note;
    await this.Update();
    return '标记成功';
  }

  public async MarkNote(note: string): Promise<string> {
    this.IsYiHuo = 1;
    this.FHNote = note;
    await this.Update();
    return '标记成功';
  }
  public async BanLi(note: string, chuliFangAn: number): Promise<string> {
    if (this.XSSta != 0) return 'err@目前是:' + this.XSStaText + '状态.';
    this.XSSta = 5; //办理完成.
    this.CLFA = 4;
    this.Msg = note;
    await this.Update();
    return '下发成功';
  }

  public async XiaFa(note: string): Promise<string> {
    if (this.XSSta != 0) return 'err@目前是:' + this.XSStaText + '状态.';
    this.CLFA = 1; //下发到市局.
    this.XFData = DataType.CurrentDateTime;
    this.Msg = note;
    this.XSSta = 1; //下发到市局.
    await this.Update();
    await Dev2InterfaceCCBill.AddFrmTrackInfo('TS.AD.XS', '广告线索', this.No, 'Info', '下达到市局', note);
    return '下发成功';
  }

  public async GenerOrgData() {
    const xzs = new XiangZhens();
    await xzs.RetrieveAll();

    for (let index = 0; index < xzs.length; index++) {
      const xz = xzs[index];

      const dept = new Dept();
      dept.No = xz.No;
      dept.Name = xz.Name;
      dept.ParentNo = xz.QuXian;
      try {
        await dept.Insert();
      } catch {}

      const e2mp = new Emp();
      e2mp.No = xz.No;
      e2mp.Name = xz.Name + '(核查)';
      e2mp.FK_Dept = xz.No;
      e2mp.Pass = '123';

      try {
        await e2mp.Insert();
      } catch {}

      const de = new DeptEmp();
      de.MyPK = xz.No + '_' + e2mp.No;
      de.DeptName = xz.Name;
      de.StationNo = '10';
      de.StationNoT = '核查岗';
      de.FK_Emp = xz.No;
      de.FK_Dept = xz.No;

      try {
        await de.Insert();
      } catch {}

      const des = new DeptEmpStation();
      des.MyPK = xz.No + '_' + e2mp.No + '_10';
      des.FK_Station = '10';
      des.FK_Emp = xz.No;
      des.FK_Dept = xz.No;

      try {
        await des.Insert();
      } catch {}
    }
    return '执行成功.';

    // const emps = new Emps();
    // await emps.RetrieveAll();

    // const diqus = new QuXians();
    // await diqus.RetrieveAll();

    // diqus.forEach(async (dq) => {
    //   const emps = new Emps();
    //   await emps.Retrieve('FK_Dept', dq.No);

    //   for (let index = 0; index < emps.length; index++) {
    //     const emp = emps[index];
    //     const des = new DeptEmpStation();
    //     des.MyPK = emp.FK_Dept + '_' + emp.No + '_07';
    //     des.FK_Station = '07';
    //     des.FK_Dept = emp.FK_Dept;
    //     des.FK_Emp = emp.No;
    //     await des.Insert();

    //     des.MyPK = emp.FK_Dept + '_' + emp.No + '_08';
    //     des.FK_Station = '08';
    //     await des.Insert();
    //   }
    // });

    // return '执行成功.';

    // // if (1 == 1) return;
    // const depts = new Depts();
    // await depts.RetrieveAll();
    // const emp = new Emp();

    // for (let index = 0; index < depts.length; index++) {
    //   const dept = depts[index];

    //   emp.No = 'SL' + dept.No;
    //   emp.Name = dept.Name + '(受理)';
    //   emp.FK_Dept = dept.No;
    //   emp.Pass = '123';
    //   await emp.Insert();

    //   emp.No = 'HC' + dept.No;
    //   emp.Name = dept.Name + '(核查)';
    //   await emp.Insert();

    //   emp.No = 'Admin' + dept.No;
    //   emp.Name = dept.Name + '(管理员)';
    //   await emp.Insert();
    // }
    // return '执行成功.';
  }
  public async GenerMeiTiData() {
    if (1 == 1) return;

    const enums = new SysEnums();
    await enums.Retrieve('EnumKey', 'MTLX'); //媒体类型.
    //地区
    const dqs = new DiQus();
    await dqs.RetrieveAll();

    //地区: 生成媒体数据.
    for (let index = 0; index < dqs.length; index++) {
      const dq = dqs[index];
      //媒体类型
      for (let idx = 0; idx < enums.length; idx++) {
        const myenum = enums[idx];
        const en = new MeiTi();
        en.No = dq.No + idx;
        en.Name = dq.Name + myenum.Lab;
        en.DiQu = dq.No;
        en.MTLX = myenum.IntKey;

        let intNum22 = myenum.IntKey;
        if (myenum.IntKey == 0) intNum22 = 8;

        en.ShiChang = (dq.No + intNum22 + idx) / intNum22;
        en.WeiFaSC = en.ShiChang - intNum22 * idx;
        en.AllNum = en.ShiChang - 35000;
        en.WGNum = en.ShiChang - 35000 - 4566 * intNum22;
        en.LV = en.WGNum / en.AllNum;
        await en.Insert();
      }
    }
    return '生成完成.';
  }
  public async GenerTestData() {
    if (1 == 1) return;
    const ens = new XSs();
    await ens.RetrieveAll();

    const splxs33 = new SPLXs(); //商品类型.
    await splxs33.RetrieveAll();

    const myenums = new SysEnums();
    await myenums.Retrieve('EnumKey', 'MTLX'); //媒体类型.

    let iSplx = 0;
    let iMtlx = 0;
    let clFA = 3;
    for (let index = 0; index < ens.length; index++) {
      const en = ens[index];
      if (iSplx == 23) iSplx = 0;
      if (iMtlx == 5) iMtlx = 0;
      if (clFA == 5) clFA = 0;

      const lx = splxs33[iSplx];
      en.SPLX = lx.No;
      en.MTLX = iMtlx;
      en.CLFA = clFA;
      en.ShiChang = iSplx + iMtlx + clFA;
      en.Name = '[' + lx.Name + ']' + en.XiangZhenText;
      await en.Update();
      iMtlx++;
      iSplx++;
    }
    return '执行成功.';

    const xiangzhens = new XiangZhens();
    await xiangzhens.RetrieveAll(); //乡镇.

    const enums = new SysEnums();
    await enums.Retrieve('EnumKey', 'MTLX'); //媒体类型.

    const dqs = new DiQus(); //地区
    await dqs.RetrieveAll();
    const splxs = new SPLXs(); //商品类型.
    await splxs.RetrieveAll();

    const xs = new XS(); //遍历乡镇.
    for (let index = 0; index < xiangzhens.length; index++) {
      const XiangZhen = xiangzhens[index];
      //媒体类型
      for (let idx = 0; idx < enums.length; idx++) {
        const en = enums[idx];

        let clfa = 0;
        for (let idxx = 0; idx < splxs.length; idx++) {
          const splx = splxs[idxx];
          if (clfa == 6) clfa = 0;
          xs.Name = '[' + en.Lab + '] 违规' + XiangZhen.DiQuText + ' - ' + XiangZhen.QuXianText + ' - ' + XiangZhen.Name;
          xs.MTLX = en.IntKey;
          xs.DiQu = XiangZhen.DiQu;
          xs.QuXian = XiangZhen.QuXian;
          xs.XiangZhen = XiangZhen.No;
          xs.MeiTi = XiangZhen.DiQu + en.IntKey;
          xs.SPLX = splx.No;
          xs.XLFA = clfa;
          xs.EmpName = XiangZhen.Name + '片管员';
          xs.No = DBAccess.GenerGUID();
          xs.RDT = '2022-04-09';
          await xs.DirectInsert();
          clfa++;
        }
      }
    }
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
export class XSs extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new XS();
  }
  constructor() {
    super();
  }
}
