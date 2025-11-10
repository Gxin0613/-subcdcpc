import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExtAttr } from '../../MapExt';
import { SFDBSrc } from '../../SFDBSrc/SFDBSrc';
/// <summary>
/// 装载填充主表
/// </summary>
export class PageLoadFull extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.MapExt.PageLoadFull');
    if (!!mypk) this.MyPK = mypk;
  }

  //实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_MapExt', '装载填充主表');

    map.AddGroupAttr('填充主表');
    map.AddMyPK();
    // map.AddDDLSysEnum(MapExtAttr.DBType, 0, '数据源类型', true, true, 'DBType', '@0=执行SQL@1=执行url返回JSON@2=执行CCFromRef.js返回JSON', null, false);
    map.AddDDLEntities(MapExtAttr.FK_DBSrc, 'local', '数据源', new SFDBSrc(), true, null, false);
    map.AddTBStringDoc(MapExtAttr.Doc, null, '执行内容', true, false, true, this.Desc0);
    map.AddTBStringDoc(MapExtAttr.Tag2, null, '确定后执行的JS', true, false, true, this.Desc1);

    this._enMap = map;
    return this._enMap;
  }
  public readonly Desc0 = `
  #### 执行内容
   - 首先要选择数据源,根据数据源填写执行内容.
   - 执行内容后返回的是数据源，对数据源要要求是一行一列数据.
  #### SQL格式
   - SQL填写帮助.
   - 必须返回一行数据的 SQL或者数据源.
   - 返回的列名要与字段名进行对应，如果匹配的不管控件类型系统就会自动赋值。
   - 实例： SELECT Name as MingCheng, Tel as DianHua, Email FROM WF_EMP WHERE No='@WebUser.No'
   - @WebUser.No 系统约定的标记。
   - @WorkID 替换流程中的数据
  #### URL格式
   - 必须返回一行数据的的json格式的数据源。
   - 返回的列名要与字段名进行对应，如果匹配的不管控件类型系统就会自动赋值。
   - 实例： /App/Handler.ashx?DoType=EmpFull&Key=@Key
   - @Key 就是指选择的主键. 是系统约定的标记。
  #### 特别注意
  - 如果单据或者独立表单绑定了节点，他的启用受到节点与表单关系的限制，在有的节点不需要填充。
  - 系统默认节点绑定了表单，是不填充的。

  `;

  public readonly Desc1 = `
  #### 帮助
   - 该选项可以为空,弹出框确定后执行的JS，可以直接写方法名或者方法()。
   - 用户数据返回填充后，对数据的处理。
   `;
}
