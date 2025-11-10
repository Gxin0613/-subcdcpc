import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExtAttr } from '../MapExt';
import { SFDBSrc } from '../SFDBSrc/SFDBSrc';

// 树干叶子弹窗
export class DtlTreeEns extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.MapExt.DtlTreeEns');
    // this.RefEnName = 'TS.Sys.MapExt'; //关联更新的类.
    if (!!mypk) this.MyPK = mypk;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsUpdate = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_MapExt', '从表导入');

    map.AddGroupAttr('数据来源');
    map.AddMyPK();
    map.AddTBString(MapExtAttr.FK_MapData, null, '表单ID', false, false, 0, 50, 200);
    // map.AddTBString(MapExtAttr.ExtModel, 'Pop', '模式(大类)', false, false, 0, 50, 200);
    // map.AddTBString(MapExtAttr.ExtType, null, '类型(小类)', false, false, 0, 50, 200);
    map.AddDDLEntities(MapExtAttr.FK_DBSrc, 'local', '数据源', new SFDBSrc(), true, null, false);

    map.AddTBString('SearchTip', null, '搜索提示', true, false, 0, 50, 200, true, this.NoteSearchTip);
    map.AddTBStringDoc(MapExtAttr.Tag1, null, '搜索数据源', true, false, true, this.NoteTag1);
    map.AddTBStringDoc(MapExtAttr.Tag2, null, '左侧树列表数据源', true, false, true, this.NoteTag2);
    map.AddTBString(MapExtAttr.Doc, null, '根节点树编号', true, false, 0, 50, 200, true, this.NotDoc);
    map.AddTBStringDoc(MapExtAttr.Tag3, null, '实体数据源', true, false, true, this.NoteTag3);

    map.AddTBString(MapExtAttr.Tag, null, '数据列名与中文意思对照', true, false, 0, 200, 200, true, this.NoteTag);
    map.AddTBString(MapExtAttr.Tag5, null, '确定后执行的JS', true, false, 0, 50, 200, true, this.NoteTag5);

    map.AddGroupAttr('外观');
    // map.AddRadioBtn('ShowModel', 0, '展示方式', false, false, 'ShowModel', '@0=POP弹出窗@1=下拉搜索选择', null, true);
    // map.AddRadioBtn('PopSelectType', 1, '选择类型', true, true, 'PopSelectType', '@0=单选@1=多选', null, true);
    //map.AddRadioBtn('OpenPopType', 1, '打开Pop弹出窗的方式', true, true, 'OpenPopType', '@0=双击打开@1=点击按钮打开', null, true);
    map.AddTBString('Title', null, '标题', true, false, 0, 50, 200, true);
    map.AddTBString('BtnLab', '查找', '查找按钮标签', true, false, 0, 50, 200);
    map.AddTBInt(MapExtAttr.H, 400, '弹窗高度', true, false);
    map.AddTBInt(MapExtAttr.W, 900, '弹窗宽度', true, false);
    map.AddTBAtParas(4000);
    //参数字段.  @SelectType=1@IsEnter=0
    map.ParaFields = ',Title,BtnLab,SearchTip,';

    this._enMap = map;
    return this._enMap;
  }

  public readonly NoteSearchTip = `
  #### 帮助
   - 显示在搜索文本框的背景文字，比如:
   - 请输入付款人名称,进行搜索.
   - 输入人员编号,名称，名称全拼,简拼关键字搜索
  `;
  public readonly NoteTag1 = `
  #### 帮助
   - 点击关键字执行搜索返回的数据源，@Key是关键字,是搜索的关键字.
   - For URL:/DataUser/Handler.ashx?DoType=SearchEmps&Keyword=@Key
   - For SQL: SELECT No,Name FROM Port_Emp WHERE No like '%@Key%' OR Name like '%@Key%'
  `;
  public readonly NoteTag2 = `
  #### 帮助
   - 设置一个可以返回json的数据源该数据源有No,Name,ParentNo三个约定的列.
   - For URL:/DataUser/Handler.ashx?DoType=ReqDepts
   - For SQL:SELECT No,Name, ParentNo FROM Port_Dept
  `;
  public readonly NoteDoc = `
  #### 帮助
   - 支持ccbpm的表达式,比如:@WebUser.DeptNo , @FieldName ,@WebUser.OrgNo 
  `;
  public readonly NoteTag3 = `
  #### 帮助
   - 选择右边的树返回的详细信息列表数据源 ， @Key是关键字,是选择的树节点编号.
   - For URL:/DataUser/Handler.ashx?DoType=ReqEmpsByDeptNo&DeptNo=@Key
   - For SQL:SELECT No,Name FROM Port_Emp WHERE FK_Dept='@Key'
  `;
  public readonly NoteTag = `
  #### 帮助
   - 该选项可以为空,在右上角的列表里查询或点树树干的数据源出现的列表,需要用中文显示列头.
   - 例如: No=编号,Name=名称,Addr=地址,Tel=电话,Email=邮件
  `;
  public readonly NoteTag5 = `
  #### 帮助
   - 该选项可以为空,弹出框确定后执行的JS，可以直接写方法名或者方法. 
  `;
}
