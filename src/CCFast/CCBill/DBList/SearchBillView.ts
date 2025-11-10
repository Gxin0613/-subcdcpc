import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { FrmAttr } from '/@/WF/TSClass/Admin/FrmAdm';
import { MapDataAttr } from '/@/WF/Admin/FrmLogic/MapData';
import { GL_VSTOFrm } from '/@/WF/Admin/DesignerVSTO/GL_VSTOFrm';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import BSEntity from '/@/utils/gener/BSEntity';
import { CollectionAttr, Collections } from '/@/CCFast/CCBill/Collection/Collection';
import { SubTablePostion } from '/@/bp/en/Config';
import { GPE_SearchKey } from '/@/CCFast/CCBill/Admin/SearchCond/GPE_SearchKey';
import { SearchFKEnumAttr, SearchFKEnums } from '/@/CCFast/CCBill/Admin/SearchCond/SearchFKEnum';
import { DBRoles } from '/@/CCFast/CCBill/DBRole/DBRole';
import { GPE_GenerDBSrcSearch } from '../../GenerDBSrc/GPE_GenerDBSrcSearch';

//属性列表
export class SearchBillViewAttr extends FrmAttr {
  public static readonly MainTable = 'MainTable';
  public static readonly MainTablePK = 'MainTablePK';
}

// 数据源实体
export class SearchBillView extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.CCBill.SearchBillView');
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
    const map = new Map('Sys_MapData', '数据源实体');
    map.CodeStruct = '4';
    map.AddGroupAttr('基本属性');
    map.AddTBStringPK(MapDataAttr.No, null, '编号', true, true, 1, 190, 20);
    map.AddTBString(MapDataAttr.Name, null, '名称', true, false, 0, 200, 20, true);
    map.AddTBString(MapDataAttr.PTable, null, '视图名称', false, false, 0, 500, 20, true);

    map.AddGroupAttr('外观');

    map.AddDDLSysEnum(MapDataAttr.TableCol, 0, '表单显示列数', true, true, 'TableCol', '@0=4列@1=6列@2=上下模式3列');

    map.AddTBString('SortColumns', null, '排序字段', true, false, 0, 100, 20, true);
    map.AddTBString('ColorSet', null, '颜色设置', true, false, 0, 100, 20, true);
    map.AddTBString('FieldSet', null, '字段求和求平均设置', true, false, 0, 100, 20, true);

    //字段格式化函数.
    map.AddTBString('ForamtFunc', null, '字段格式化函数', true, false, 0, 200, 60, true);
    const msg = `对字段的显示使用函数进行处理
    	
 1. 对于字段内容需要处理后在输出出来.
     	
 2. 比如：原字段内容 @zhangsa,张三@lisi,李四 显示的内容为 张三,李四
     	
 3. 配置格式: 字段名@函数名; 比如:  FlowEmps@DealFlowEmps
     	
 4. 函数写入到 \DataUser\JSLibData\SearchSelf.js
    `;
    map.SetHelperAlert('ForamtFunc', msg);
    // #endregion 数据源实体.
    //增加参数字段.
    map.AddTBAtParas(4000);

    map.AddRM_GPE(new GPE_GenerDBSrcSearch(), 'icon-login', '', '数据源', '&MarkID=SearchBillView.Main');

    const rm = new RefMethod();
    rm.Title = '同步数据字段';
    rm.ClassMethod = 'DTSField';
    rm.Icon = 'icon-energy';
    rm.Visable = true;
    rm.RefMethodType = RefMethodType.Func;
    map.AddRefMethod(rm);
    map.AddRM_GL(new GL_VSTOFrm(), '编辑字段', 'icon-eye', '&FrmID=@No');

    map.AddGroupMethod('列表');
    const showAttr1 = 'Name,IsEnable,MethodModel,Icon,IsZD,';
    map.AddRM_DtlSearch('工具栏', new Collections(), CollectionAttr.FrmID, '', '', showAttr1, 'icon-film', true, '', SubTablePostion.Left);
    map.AddRM_UrlTabOpen('多表头', '/@/WF/views/Comm/MultiTitle.vue?DoType=Dict');
    map.AddGroupMethod('查询条件');
    //关键字查询模式.
    map.AddRM_GPE(new GPE_SearchKey(), 'icon-drop');
    //外键枚举查询条件
    map.AddRM_DtlSearch('外键枚举查询条件', new SearchFKEnums(), SearchFKEnumAttr.FrmID, '', '', '', 'icon-drop', true);
    //日期查询方式
    //map.AddRM_GPE(new GPE_DTSearchWay(), 'icon-drop');
    map.AddGroupMethod('数据&按钮权限');
    map.AddRM_DtlSearch('列表权限', new DBRoles(), 'FrmID', '', '', '', 'icon-settings', false, '&DBRole=DBList');

    this._enMap = map;
    return this._enMap;
  }
  public async DTSField() {
    const dbEntity = new BSEntity('BP.CCBill.SearchBillView');
    dbEntity.setPK(this.No);
    await dbEntity.Retrieve();
    const data = await dbEntity.DoMethodReturnString('CheckIt');

    return '执行成功:' + data;
  }
}

//数据源实体s
export class DBEntitys extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new SearchBillView();
  }
  constructor() {
    super();
  }
}
