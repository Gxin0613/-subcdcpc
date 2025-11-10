import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName, EntityNoName, EntityNoNameAttr } from '/@/bp/en/EntityNoName';
import WebUser from '/@/bp/web/WebUser';
import { SysEnum, SysEnums } from './SysEnum';
import { CCBPMRunModel, SystemConfig } from '/@/bp/difference/SystemConfig';

//属性列表
export class SysEnumMainAttr extends EntityNoNameAttr {
  /// <summary>
  /// 配置的值
  /// </summary>
  public static readonly CfgVal = 'CfgVal';
  /// <summary>
  /// 语言
  /// </summary>
  public static readonly Lang = 'Lang';
  /// <summary>
  /// 组织结构编码
  /// </summary>
  public static readonly OrgNo = 'OrgNo';
  /// <summary>
  /// 真实的编号
  /// </summary>
  public static readonly EnumKey = 'EnumKey';
  /// <summary>
  /// 真实的编号
  /// </summary>
  public static readonly EnableColor = 'EnableColor';
  /// <summary>
  /// 有没有明细？
  /// </summary>
  public static readonly IsHaveDtl = 'IsHaveDtl';
  /// <summary>
  /// 是否有参数.
  /// </summary>
  public static readonly AtPara = 'AtPara';
  ///枚举类型.
  public static readonly EnumType = 'EnumType';
}

// 枚举
export class SysEnumMain extends EntityNoName {
  constructor(no?: string) {
    super('TS.FrmUI.SysEnumMain');
    if (!!no) this.setPKVal(no);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    if (WebUser.IsAdmin == true) {
      uac.IsDelete = true;
      uac.IsUpdate = true;
      uac.IsInsert = true;
      return uac;
    }
    uac.IsView = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_EnumMain', '枚举注册');
    /*
     * 为了能够支持 cloud 我们做了如下变更.
     * 1. 增加了OrgNo, EnumKey 字段.
     * 2. 如果是单机版用户,原来的业务逻辑不变化.
     * 3. 如果是SAAS模式, No=  OrgNo+"_"+EnumKey ;
     */
    map.AddTBStringPK(SysEnumMainAttr.No, null, '编号', true, true, 1, 190, 150);
    map.AddBoolean(SysEnumMainAttr.EnableColor, true, '使用枚举颜色', true, true);

    map.AddTBString(SysEnumMainAttr.Name, null, '名称', true, false, 0, 200, 200);
    map.AddTBStringDoc(SysEnumMainAttr.CfgVal, null, '配置信息', true, true, true);
    map.AddTBString(SysEnumMainAttr.Lang, 'CH', '语言', false, false, 0, 10, 8);

    //枚举值.
    map.AddTBString(SysEnumMainAttr.EnumKey, null, 'EnumKey', false, false, 0, 40, 150);
    map.AddTBInt(SysEnumMainAttr.IsHaveDtl, 0, '是否有子集?', false, false);

    //0=int类型的枚举, 1=String类型的枚举.
    //map.AddTBInt(SysEnumMainAttr.EnumType, 0, '枚举类型', false, false);
    map.AddDDLSysEnum(SysEnumMainAttr.EnumType, 0, '枚举类型', true, false, 'EnumType', '@0=Int类型枚举@1=String类型枚举');
    if (SystemConfig.CCBPMRunModel == CCBPMRunModel.GroupInc) map.AddBoolean('IsShare', true, '是否共享给其他组织?', false, true);

    //参数.
    map.AddTBString(SysEnumMainAttr.AtPara, null, 'AtPara', false, false, 0, 200, 8);
    //组织编号.
    map.AddTBString(SysEnumMainAttr.OrgNo, null, 'OrgNo', false, false, 0, 50, 8);

    //枚举值.
    for (let index = 0; index < 30; index++) {
      map.AddTBString('Idx' + index, null, 'EnumKey', false, false, 0, 50, 8);
      map.AddTBString('Val' + index, null, '值', false, false, 0, 20, 400);
    }

    if (WebUser.CCBPMRunModel != CCBPMRunModel.Single) map.AddHidden('OrgNo', '=', '@WebUser.OrgNo');

    //查询条件.
    map.AddSearchAttr(SysEnumMainAttr.EnumType);

    this._enMap = map;
    return this._enMap;
  }

  //保存到 Sys_Enums.
  public async SaveDtls() {
    const enumKey = this.EnumKey || this.No;
    const ses = new SysEnums();
    await ses.Delete('EnumKey', enumKey);

    if (WebUser.CCBPMRunModel != CCBPMRunModel.Single) {
      this.OrgNo = WebUser.OrgNo;
    }

    let cfgVals = '';
    if (this.GetValByKey('EnumType') == 0) {
      //int类型的.
      for (let index = 0; index < 30; index++) {
        const lab = this.GetValByKey('Val' + index);
        const idx = this.GetValByKey('Idx' + index);
        if (!lab) continue;

        const se = new SysEnum();
        se.EnumKey = enumKey;
        se.Lab = lab;
        se.IntKey = idx;
        se.Lang = 'CH';
        se.RefPK = this.No;
        se.MyPK = enumKey + '_' + se.Lang + '_' + idx;
        if (this.OrgNo) {
          se.OrgNo = this.OrgNo;
          se.MyPK = enumKey + '_' + se.Lang + '_' + idx + '_' + this.OrgNo;
        }
        se.ValColor = this.GetColor(index);
        await se.Insert();
        cfgVals += '@' + idx + '=' + lab;
      }
    }

    if (this.GetValByKey('EnumType') == 1) {
      //string类型.
      for (let index = 0; index < 30; index++) {
        const labKey = this.GetValByKey('Idx' + index);
        const labVal = this.GetValByKey('Val' + index);
        if (!labVal || !labKey) continue;

        const se = new SysEnum();
        se.EnumKey = enumKey;
        se.Lab = labVal;
        se.StrKey = labKey;
        se.IntKey = index; //这个值用于排序.
        se.Lang = 'CH';
        se.RefPK = this.No;
        se.MyPK = enumKey + '_' + se.Lang + '_' + labKey;
        if (this.OrgNo) {
          se.OrgNo = this.OrgNo;
          se.MyPK = enumKey + '_' + se.Lang + '_' + labKey + '_' + this.OrgNo;
        }
        se.ValColor = this.GetColor(index);
        await se.Insert();
        cfgVals += '@' + labKey + '=' + labVal;
      }
    }

    this.CfgVal = cfgVals;
    await this.DirectUpdate();
  }
  public GetColor(idx: number) {
    if (idx == 0) return '#FF0000';
    if (idx == 1) return '#00FF00';
    if (idx == 2) return '#0000FF';
    if (idx == 3) return '#000000';
    if (idx == 4) return '#FFFF00';
    if (idx == 5) return '#00FFFF';
    if (idx == 6) return '#FF00FF';
    return 'FFD700';
  }

  override async beforeUpdateInsertAction(): Promise<boolean> {
    //枚举数据库，集团版查询添加OrgNo字段
    if (WebUser.CCBPMRunModel == CCBPMRunModel.GroupInc) {
      this.OrgNo = WebUser.OrgNo;
    }
    return Promise.resolve(true);
  }
  override async afterDelete(): Promise<boolean> {
    if (SystemConfig.CCBPMRunModel === CCBPMRunModel.SAAS) {
      const enums = new SysEnums();
      await enums.Delete('RefPK', this.No, 'OrgNo', WebUser.OrgNo);
    } else {
      const enums = new SysEnums();
      await enums.Delete('RefPK', this.No);
    }
    return Promise.resolve(true);
  }
}

//枚举s
export class SysEnumMains extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new SysEnumMain();
  }
  constructor() {
    super();
  }

  override async RetrieveAll(): Promise<number> {
    let val = 0;
    if (SystemConfig.CCBPMRunModel != CCBPMRunModel.Single && WebUser.No != 'admin') {
      val = await this.Retrieve('OrgNo', WebUser.OrgNo);
    } else {
      val = await this.RetrieveAllFromDBSource();
    }
    return val;
  }
}
