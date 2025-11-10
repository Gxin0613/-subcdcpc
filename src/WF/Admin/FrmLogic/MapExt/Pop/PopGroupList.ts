import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExtAttr } from '../../MapExt';
import { GloComm } from '/@/WF/Comm/GloComm';
import { GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';

// 分组列表弹窗
export class PopGroupList extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.MapExt.PopGroupList');
    // this.RefEnName = 'TS.Sys.MapExt'; //关联更新的类.
    if (!!mypk) this.MyPK = mypk;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_MapExt', '分组列表弹窗');

    map.AddMyPK();
    map.AddTBString(MapExtAttr.Tag5, null, '确定后执行的JS', true, false, 0, 200, 200, true, this.DescTag5);

    map.AddTBInt('ShowCol', 3, '设置显示列数', true, false);
    map.AddRadioBtn('ShowModel', 0, '展示方式', false, false, 'ShowModel', '@0=POP弹出窗@1=下拉搜索选择', null);
    map.AddRadioBtn('PopSelectType', 1, '选择类型', true, true, 'PopSelectType', '@0=单选@1=多选', null);
    //map.AddRadioBtn('OpenPopType', 1, '打开Pop弹出窗的方式', true, true, 'OpenPopType', '@0=双击打开@1=点击按钮打开', null, true);
    map.AddTBString('Title', null, '标题', true, false, 0, 50, 200, true);
    map.AddTBInt(MapExtAttr.H, 400, '弹窗高度', true, false);
    map.AddTBInt(MapExtAttr.W, 500, '弹窗宽度', true, false);
    map.AddBoolean('IsEnter', false, '是否允许手工输入', true, true);
    map.AddTBString('BtnLab', '查找', '查找按钮标签', true, false, 0, 50, 200); //'xxx,xxx'

    const url = GloComm.UrlGPEExt('GPE_GenerDBSrcSearch', '@MyPK', '&MarkID=Pop.Group');
    map.AddLink(MapExtAttr.Tag1, '设置-分组数据源', url, true, GPNReturnType.OpenUrlByModal, this.Desc4);
    const url2 = GloComm.UrlGPEExt('GPE_GenerDBSrcSearch', '@MyPK', '&MarkID=Pop.Dtl');
    map.AddLink(MapExtAttr.Tag2, '设置-实体数据源', url2, true, GPNReturnType.OpenUrlByModal, this.DescTag5);

    map.AddTBAtParas(4000);
    //参数字段.  @SelectType=1@IsEnter=0
    map.ParaFields = ',ShowCol,IsEnter,Title,BtnLab,ShowModel,PopSelectType,';

    this._enMap = map;
    return this._enMap;
  }
  public readonly Desc4 = `
### 分组数据源配置说明
说明如何配置分组数据源，以便在页面展示分组数据。
#### 数据格式要求
- **SQL语句**：您可以使用SQL查询语句来获取数据，但查询结果必须包含\`No\`和\`Name\`两列。
- **API接口**：如果您使用配置的API接口，该接口返回的数据同样必须包含\`No\`和\`Name\`这两列。
#### SQL示例
\`\`\`sql
SELECT No, Name FROM Demo_BanJi
\`\`\`
或
\`\`\`sql
SELECT No, Name FROM Port_Dept
\`\`\`
- 解释：从\`Demo_BanJi\`表或\`Port_Dept\`表中查询\`No\`和\`Name\`两列的数据。
#### API接口示例
- 示例API接口URL：\`/DataUser/Handler.ashx?DoType=ReqDepts\`
- 确保接口返回的数据格式如下（示例）：
  \`\`\`json
  [
    { "No": "001", "Name": "销售部" },
    { "No": "002", "Name": "财务部" }
  ]
  \`\`\`
  
  `;

  public readonly DescTag5 = ` 
### 实体数据源配置说明
说明如何配置实体数据源，以便在分组中正确展示数据。
#### 数据格式要求
- **固定列**：数据源的第三列必须为“关联外键列”，用于与分组数据源建立关联。
- **数据获取方式**：支持SQL查询语句和API接口两种方式。
#### SQL语句方式
- 编写SQL查询语句，确保查询结果包含\`No\`、\`Name\`和\`关联外键列\`三列。
- 示例SQL语句：
  \`\`\`sql
  SELECT No, Name, BanJiNo FROM Demo_Student;
  \`\`\`
  或
  \`\`\`sql
  SELECT No, Name, FK_Dept FROM Port_Emp;
  \`\`\`
#### API接口方式
- 配置一个返回JSON格式数据的API接口，该接口返回的数据同样必须包含\`No\`、\`Name\`和\`关联外键列\`三列。
- 示例API接口URL：\`/DataUser/Handler.ashx?DoType=Demo_Students\`
- 确保接口返回的数据格式如下（示例）：
  \`\`\`json
  [
    { "No": 1, "Name": "张三", "关联外键列": "001" },
    { "No": 2, "Name": "李四", "关联外键列": "002" }
  ]
  \`\`\`
   `;
}
