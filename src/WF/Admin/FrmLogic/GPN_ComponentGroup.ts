import { MapAttr } from '../FrmLogic/MapAttrs/MapAttr';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';

export class GPN_ComponentGroup extends PageBaseGroupNew {
  constructor() {
    super('GPN_ComponentGroup');
    this.PageTitle = '新建分组自定义组件';
  }
  public Init() {
    this.AddGroup('A', '报表'); //增加分组.
    this.TextBox2_NameNo('Pop_TreeEns_Dept2Emp', '柱状图', this.Pop_TreeEns_Dept2Emp, 'Str', '字段ID', '字段名称', '选择人员');
    this.AddIcon('icon-user', 'Pop_TreeEns_Dept2Emp');
    this.TextBox2_NameNo('Pop_TreeEns_Dept232E1mp', '饼状图', this.Pop_TreeEns_Dept2Emp, 'Str', '字段ID', '字段名称', '选择人员');
    this.AddIcon('icon-user', 'Pop_TreeEns_Dept2Emp');
    this.TextBox2_NameNo('Pop_TreeEns_Dept322E1mp', '2维报表', this.Pop_TreeEns_Dept2Emp, 'Str', '字段ID', '字段名称', '选择人员');
    this.AddIcon('icon-user', 'Pop_TreeEns_Dept2Emp');
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  public override async Save_TextBox_X(pageNo: string, _sortNo: string, tb1: string, tb2: string, _tb3: string) {
    //新建字段-字段附件.
    if (pageNo === 'TreeEns_Dept2Emp') {
      const frmID = this.RequestVal('FrmID');
      const groupID = this.RequestVal('GroupField');
      const mapAttr = new MapAttr();
      mapAttr.GroupID = groupID;
      mapAttr.FK_MapData = frmID;
      mapAttr.MyPK = frmID + '_' + tb2;
      if (await mapAttr.IsExits()) return new GPNReturnObj(GPNReturnType.Message, '附件ID已经存在');

      mapAttr.KeyOfEn = tb2;
      mapAttr.Name = tb1;
      //mapAttr.UIContralType=
      await mapAttr.Insert();
      //转向.
      const url = '/@/WF/Comm/En.vue?EnName=TS.FrmUI.MapAttrEnum&PKVal=' + mapAttr.MyPK;
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }
  }

  // 新建string枚举
  public readonly Pop_TreeEns_Dept2Emp = `
  #### 帮助
  - 左树右表模式的人员选择器.

  #### 数据存储.
  - 数据存在Sys_MapExt的扩展属性里.

    `;
}
