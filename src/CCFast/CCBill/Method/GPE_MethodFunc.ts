import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';
import { MethodFunc } from './MethodFunc';
import useComponentLoader from '/@/hooks/ens/useComponentLoader';
import { GloWF } from '/@/WF/Admin/GloWF';

export class GPE_MethodFunc extends PageBaseGroupEdit {
  constructor() {
    super('GPE_MethodFunc');
    this.PageTitle = '方法内容';
    this.Btns = [{ pageNo: '5', list: ['设置'] }];
  }

  Init() {
    const { loadComponent } = useComponentLoader();

    this.entity = new MethodFunc(); //功能方法.
    this.KeyOfEn = 'MethodDocTypeOfFunc'; //内容类型.
    //增加子页面. @0=SQL@1=URL@2=JavaScript@3=业务单元
    this.AddGroup('A', '执行方法'); //增加分组.
    // this.SingleTextArea('0', 'SQL脚本', 'Docs', '请输入方法内容', this.HelpUn);
    // this.SelfComponent('0','SQL脚本',)
    console.log(this.params);
    this.SelfComponent(
      '0',
      'SQL脚本',
      loadComponent('/@/CCFast/CCBill/Method/GPN_MethodSQL.vue'),
      {
        classID: 'TS.CCBill.MethodFunc',
        PKVal: this.PKVal,
        enable: false, //不显示最上边的启用按钮
      },
      this.helpDocs,
    );
    this.SingleTextArea('1', 'JavaScript脚本(开发中)', 'Docs', '请输入方法内容', this.HelpUn);
    this.SingleTextArea('2', 'Typescript脚本(开发中)', 'Docs', '请输入方法内容', this.HelpUn);

    this.AddGroup('B', '数据源');
    this.SelectItemsByGroupList('3', '数据源的过程', this.HelpUn, false, GloWF.srcDBSrc, GloWF.srcSFProc, 'Docs');
    // this.SelectItemsByGroupList('4', '执行方法', this.Desc4, false, GloWF.srcDBSrc, GloWF.srcSFProc, 'Docs');

    // this.SelectItemsByList('4', '执行后台方法', this.HelpUn, false, 'SELECT No,Name FROM Sys_SFDBSrc', 'Docs');
    //this.SelectItemsByGroupList('4', '执行后台方法', this.HelpUn, false, 'SELECT No,Name FROM Sys_SFDBSrc ', 'SELECT No,Name,FK_SFDBSrc FROM sys_SFProc ', 'Docs');
    // this.Blank(FormSlnType.Developer, '开发者表单', this.Developer);
    // this.SelectItemsByList(FormSlnType.RefNodeFrm, '引用其它节点表单', this.RefNodeFrm, false, GloWF.sqlNodeFrmList, NodeAttr.NodeFrmID);
  }

  public async AfterSave(_pageID: string, _pageVal: any) {}
  public BtnClick(_pageID: string, _pageVal: any, _btnName: string) {
    if (_pageID == '5') {
      const url = GloComm.UrlEn('TS.AttrNode.Sln5', this.PKVal);
      return new GPNReturnObj(GPNReturnType.OpenUrlByModal, url, '设置');
    }
  }
  // 绑定表单树的表单.
  public readonly Desc4 = `
  #### 帮助
  
 
  `;

  public readonly helpDocs = `
    #### 说明
    - 您可以编写SQL语句在这个方法里。
    - 实体:在SQL的表达式里，有@OID作为参数字段。
    - 单据: 在SQL的表达式里，有@No作为参数字段。
    - 可以使用参数按钮，为执行该方法增加参数。
    `;
}
