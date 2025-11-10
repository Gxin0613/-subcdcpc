import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { FrmAttr } from '/@/WF/TSClass/Admin/FrmAdm';
import { MapDataAttr } from '/@/WF/Admin/FrmLogic/MapData';
import { SFDBSrc, SFDBSrcs } from '/@/WF/Admin/FrmLogic/SFDBSrc/SFDBSrc';
import { message } from 'ant-design-vue';
import { GLEnOpenShowModel } from '/@/bp/UIEntity/PageBaseGenerList';
import { GloWF } from '/@/WF/Admin/GloWF';

//属性列表
export class DBListAttr extends FrmAttr {
  public static readonly MainTable = 'MainTable';
  public static readonly MainTablePK = 'MainTablePK';
}

// 通用列表
export class GenerListEn extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.CCBill.GenerListEn');
    if (!!pkval) this.No = pkval;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Frm_GenerList', '通用列表');
    map.CodeStruct = '4';
    map.AddGroupAttr('基本属性');
    map.AddTBStringPK(MapDataAttr.No, null, '编号', true, true, 1, 190, 20);
    map.AddTBString(MapDataAttr.Name, null, '名称', true, false, 0, 200, 20);
    //#region 数据源.
    map.AddTBString(MapDataAttr.DBType, null, '数据源类型', false, false, 0, 600, 20);
    map.AddDDLEntities(MapDataAttr.DBSrc, 'local', '数据源', new SFDBSrc(), true, null, false);
    map.AddTBStringDoc('ExpStr', null, '表达式', true, false, true);
    const val = `
    编写查询语句或者数据源查询ID,
      比如：SELECT No,Name,Email,Tel FROM Port_Emp WHERE FK_Dept='@WebUser.DeptNo'
      比如: SFSearchNo , 该编号定义在数据源的查询里面.
    `;

    map.SetHelperAlert('ExpStr', val);

    map.AddTBStringDoc('ColName', null, '列的中文名', true, false, true);
    map.SetHelperAlert('ColName', '如何把字段名称转化为中文显示, 格式:@Tel=电话@Email=邮件 ');
    map.AddTBString('TitleField', null, '焦点字段', true, false, 0, 50, 20);
    map.SetHelperAlert('TitleField', '点击该字段显示超链.');
    map.AddTBString('DTField', null, '日期查询字段', true, false, 0, 50, 20);
    map.SetHelperAlert('DTField', '可以为空，按照日期查询字段.');
    map.AddTBString('GroupField', null, '分组字段', true, false, 0, 50, 20);
    map.SetHelperAlert('GroupField', '用于数据分组.');

    map.AddGroupAttr('外观');
    //  #region 外观.
    map.AddDDLSysEnum(
      FrmAttr.RowOpenModel,
      3,
      '行记录打开模式',
      true,
      true,
      'RowOpenMode',
      '@0=新窗口打开@1=在本窗口打开@2=弹出窗口打开,关闭后不刷新列表@3=弹出窗口打开,关闭后刷新列表',
    );
    // @2=MyBill.vue单据编辑器(需传递OID等数据)
    const cfg = `@0=无@1=MyDictFrameWork.vue 实体与实体相关功能编辑器@2=MyDict.vue实体编辑器(需传递OID等数据)@3=打开En实体页面(需传递EnName等数据)@4=工作查看器MyView.vue(需传递WorkID等数据)@5=抄送处理器MyCC.vue(需传递WorkID等数据)@6=自定义URL
      `;
    map.AddDDLSysEnum('SearchDictOpenType', 0, '超链接打开内容', true, true, 'SearchDictOpenType', cfg);

    const valExt = `
    要打开的URL:
    -  对自定义的url有效.
    -  url之后可以有参数:  /#/WF/Comm/EnPage?EnName=TS.Port.Emp&PKVal=@No
    -  @No 是当前行的数据字段. 系统运行的时候，会把@No替换为实际的数值.
    `;

    map.AddTBString('UrlExt', null, '要打开的Url', true, false, 0, 500, 60, true, valExt);
    map.AddTBInt(FrmAttr.PopHeight, 500, '弹窗高度', true, false);
    map.AddTBInt(FrmAttr.PopWidth, 760, '弹窗宽度', true, false);

    // #endregion 数据源实体.
    //增加参数字段.
    map.AddTBAtParas(4000);

    this._enMap = map;
    return this._enMap;
  }
  protected override beforeInsert(): Promise<boolean> {
    this.DBSrc = 'local';
    this.ExpStr = GloWF.SQLOfEmpByDept; //`SELECT No,Name,Tel,Email FROM Port_Emp WHERE FK_Dept='@WebUser.DeptNo'`;
    this.ColName = '@No=编号@Name=名称@Tel=电话@Email=邮件';
    this.TitleField = 'Name';
    return Promise.resolve(true);
  }
  protected override async beforeUpdate(): Promise<boolean> {
    console.log(this);
    if (!this.ExpStr) {
      message.info('请填写表达式');
      return Promise.resolve(false);
    }
    const regex =
      /^\s*select\s+[^;]*?(?:\s+from\s+[^;]*?)?(?:\s+where\s+[^;]*?)?(?:\s+group\s+by\s+[^;]*?)?(?:\s+having\s+[^;]*?)?(?:\s+order\s+by\s+[^;]*?)?(?:\s+limit\s+\d+)?\s*;?$/;
    const extStr = this.ExpStr.toLowerCase();
    // 使用正则表达式测试字符串
    if (!regex.test(extStr)) {
      message.error('表达式错误，请正确填写查询sql语句');
      return Promise.resolve(false);
    }
    //焦点字段设置为空， 只查看列表不打开页面.
    if (this.SearchDictOpenType == GLEnOpenShowModel.None) {
      this.TitleField = '';
    }
    return Promise.resolve(true);
  }
}
