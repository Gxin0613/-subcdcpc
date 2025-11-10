
import { EntitiesOID, EntityOID } from '/@/bp/en/EntityOID';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { DiQu } from './Dict/DiQu';
import { QuXian } from './Dict/QuXian';
/** 违规广告认定与处理 **/
export class ND5RptBZY extends EntityOID {
  constructor(pkval?: string) {
    super('TS.AD.ND5RptBZY');
    if (!!pkval) this.setPKVal(pkval);
  }
  //实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.OpenForAdmin();
    uac.Readonly();
    uac.IsView = true;
    return uac;
  }
  public override get EnMap() {
    const map = new Map('ND5Rpt', '违规广告认定与处理');
    map.CodeStruct = '3';
    map.GroupBarShowModel = 1;

    map.AddGroupAttr('违法广告信息');
    map.AddTBIntPKOID();
    map.AddTBString('Title', null, '标题', false, false, 0, 200, 100, false);
    map.AddTBString('SQR', null, '填报人', false, false, 0, 300, 100, false);
    map.AddTBDateTime('SQRQ', null, '填报日期', false, false);
    map.AddDDLSysEnum('advertisingType', 0, '广告类别', true, true, 'advertisingType', '@0=电视广告@1=互联网广告@2=户外广告@3=报纸广告@4=电台广告@5=其他');
    map.AddDDLSQL('SQL_ShangPinLeiXing', null, '广告类型', 'SELECT No,Name,BeiZhu  from ad_splx order by NO', true);

    map.AddTBDateTime('RDT', null, '接受时间', false, false);
    map.AddTBDateTime('Rec', null, '完成时间', false, false);
    map.AddTBString('Emps', null, 'Emps', false, false, 0, 8000, 100, false);
    map.AddTBString('FK_NY', null, '年月', false, false, 0, 7, 100, false);
    map.AddTBString('AtPara', null, '参数', false, false, 0, 4000, 100, false);
    map.AddTBString('FK_Dept', null, '操作员部门', false, false, 0, 50, 100, false);
    map.AddTBString('FK_DeptName', null, '操作员部门名称', false, false, 0, 50, 100, false);
    map.AddTBString('GGLBMC', null, '广告类别名称', false, false, 0, 4000, 200, false);
    map.AddTBString('GGLXMC', null, '广告类型名称', false, false, 0, 4000, 200, false);
    map.AddTBString('GuangGaoMingCheng', null, '广告名称', true, true, 0, 100, 200, false);
    map.AddTBString('FaBuDanWei', null, '发布位置', true, true, 0, 100, 100, false);
    map.AddDDLSQL('SQL_WeiGui', null, '违规1', 'SELECT No,Name FROM  AD_WeiGui order by No', true);
    map.AddTBString('YiJu1', null, '依据1', true, true, 0, 4000, 100, false);
    map.AddDDLSQL('SQL_WeiGui2', null, '违规2', 'SELECT No,Name FROM  AD_WeiGui order by No', true);
    map.AddTBString('YiJu2', null, '依据2', true, true, 0, 4000, 100, false);

    map.AddDDLEntities('cn_diqu', null, '隶属地市局', new DiQu(), false, null, false);
    map.AddDDLEntities('cn_quxian', null, '区县', new QuXian(), false, null, false);

    map.AddTBString('ZhuangTaiMingCheng', null, '状态名称', false, false, 0, 4000, 200, false);
    map.AddTBString('ChuLiFangAnMingCheng', null, '处理方案名称', false, false, 0, 4000, 200, false);
    map.AddTBString('SQL_ShangPinLeiXingT', null, '商品类型T', true, true, 0, 300, 100, false);
    map.AddTBString('SQL_WeiGuiT', null, '违规1', true, true, 0, 300, 100, false);
    map.AddTBString('SQL_WeiGui2T', null, '违规2', true, true, 0, 300, 100, false);

    //查询条件.
    map.AddSearchAttr('cn_diqu');
    map.AddSearchAttr('advertisingType');
    map.AddSearchAttr('SQL_ShangPinLeiXing');



    this._enMap = map;
    return this._enMap;
  }
}
/** 违规广告认定与处理 **/
export class ND5RptBZYs extends EntitiesOID {
  get GetNewEntity(): EntityOID {
    return new ND5RptBZY();
  }
  constructor() {
    super();
  }
}