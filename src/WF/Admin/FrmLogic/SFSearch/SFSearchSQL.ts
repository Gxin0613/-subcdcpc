import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNoName } from '/@/bp/en/EntityNoName';
import { SFDBSrc } from '../SFDBSrc/SFDBSrc';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import BSEntity from '/@/utils/gener/BSEntity';
import { SFColumn, SFColumns } from './SFColumn';
import { GloDBsrcHelper } from '../GloDBSrcHelper';

// 查询
export class SFSearchSQL extends EntityNoName {
  constructor(no?: string) {
    super('TS.FrmUI.SFSearchSQL');
    if (!!no) this.setPKVal(no);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_SFSearch', 'SQL查询');

    map.AddGroupAttr('基本信息');
    map.AddTBStringPK('No', null, '编号', true, true, 1, 200, 150);
    map.AddTBString('Name', null, '名称', true, false, 0, 200, 150);
    map.AddDDLEntities('FK_SFDBSrc', 'local', '数据源', new SFDBSrc(), false);
    map.AddDDLSysEnum('ResultNum', 0, '返回行数', true, true, 'ResultNum', '@0=多行(集合)@1=单行(单记录)');

    //map.AddTBString('ConnString', null, 'Host', true, true, 0, 500, 600, true);
    map.AddTBStringDoc('SelectStatement', '', '表达式', true, false, true);
    map.SetHelperAlert('SelectStatement', '支持ccbpm表达式,比如: @WebUser.* 获得当前登录人员信息.');
    map.AddTBString('ExpNote', null, '表达式说明', true, false, 0, 500, 600, true);

    map.AddTBString('ParamAlia', null, '参数别名', true, false, 0, 200, 200, true, GloDBsrcHelper.Help_ParamAlia);

    map.AddDDLSysEnum('IsPara', 0, '参数个数', true, true, 'IsPara', '@0=无参数@1=有1个参数@2=有多个参数');
    // 创建信息
    map.AddGroupAttr('测试设置');
    map.AddTBString('TestParas', null, '测试参数', true, false, 0, 1000, 600, true, GloDBsrcHelper.Help_TestParas);

    map.AddTBString('Remark', null, '备注', true, false, 0, 100, 20, true);
    map.AddTBDateTime('RDT', null, '创建日期', true, true);
    map.AddTBString('OrgNo', null, '组织编号', true, true, 0, 100, 20);
    map.AddTBAtParas();

    // if (this.IsPara == 1) {
    map.AddGroupMethod('测试');
    const rm = new RefMethod();
    rm.Title = '执行测试';
    rm.RefMethodType = RefMethodType.Func;
    //rm.HisMap.AddTBString('P', '@TestParas', '输入参数', true, false, 0, 2000, 300, true, '格式@BU=1001@PDT=1002');
    rm.Warning = '';
    rm.ClassMethod = 'DoUrl';
    map.AddRefMethod(rm);

    map.AddRM_DtlBatch('列属性', new SFColumns(), 'RefPKVal');
    //map.AddRM_DtlSearch('列属性', new SFColumns(), 'RefPKVal', '', '', '', 'icon-list', true);

    this._enMap = map;
    return this._enMap;
  }

  //有参方法：原始数据
  public async DoUrl() {
    const en = new BSEntity('BP.Sys.SFSearch', this.No);
    await en.Init();
    await en.Retrieve();
    const data = await en.DoMethodReturnJSON('TS_SFSearch_Test');
    let dataKeys: string[] = [];
    if (Array.isArray(data) && data.length > 0) {
      dataKeys = Object.keys(data[0]);
    }
    //存储列.
    let note = '返回列:';
    for (let index = 0; index < dataKeys.length; index++) {
      const key = dataKeys[index];
      const col = new SFColumn();
      col.MyPK = this.No + '_' + key;
      col.AttrKey = key;
      col.AttrName = key;
      const num = await col.RetrieveFromDBSources();
      if (num == 1) {
        if (col.AttrKey === col.AttrName) note += '' + key + ',';
        else note += '' + key + '(' + col.AttrName + '),';
        continue;
      }
      note += '' + key + ',';

      col.RefPKVal = this.No;
      col.DataType = 'String';
      col.Idx = index;
      await col.Insert();
    }
    this.Remark = note;
    await this.DirectUpdate();
    //存储列: 怎么获得数据json 格式的datatable模式的，列的属性. @wanglu.
    // 数组 [{key}, {key}]
    // for (let index = 0; index < data.length; index++) {
    //
    //   const en = data[index];
    // }
    return 'tabOpen@原始数据:' + JSON.stringify(data, null, 2);
  }

  protected override async beforeUpdateInsertAction(): Promise<boolean> {
    const dbsrc = new SFDBSrc(this.FK_SFDBSrc);
    await dbsrc.Retrieve();
    this.ConnString = dbsrc.ConnString;
    return Promise.resolve(true);
  }
}
