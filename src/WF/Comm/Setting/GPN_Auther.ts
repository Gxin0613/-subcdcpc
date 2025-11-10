import { Auth } from './Auth';
import { DataType } from '/@/bp/en/DataType';
import { PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import WebUser from '/@/bp/web/WebUser';
import { GloWF } from '/@/WF/Admin/GloWF';
export class GPN_Auther extends PageBaseGroupNew {
  constructor() {
    super('GPN_Auther');
    this.PageTitle = '新增授权人';
    this.ForEntityClassID = 'TS.User.Auth';
  }

  public Init() {
    this.AddGroup('A', '请选择规则'); //增加分组.
    this.SelectItemsByTreeEns('1', '选择授权人', this.Docs1, false, GloWF.srcDeptLazily, GloWF.srcDeptRoot, GloWF.srcEmpLazily, '@No=账号@Name=名称@Tel=电话', true);
    //  this.SelectItemsByTreeEns('2', '选择授权人', this.Docs1, false, GloWF.srcDeptLazily, GloWF.srcDeptRoot, GloWF.srcEmpLazily, '@No=账号@Name=名称@Tel=电话');
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
    // const ens = new FrmSorts();
    // await ens.Init();
    // await ens.RetrieveAll();
    // return ens;
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    // const webUser=new WebUser();

    let userNo = '';
    userNo = this.RequestVal('RefPKVal');

    //执行创建.
    const en = new Auth();
    en.MyPK = WebUser.No + '_' + tb1;
    if ((await en.IsExits()) == true) {
      alert('人员[' + tb2 + ']已经被选择.');
      return;
    }
    en.Auther = userNo; //WebUser.No; //授权人.
    en.AuthType = 0; //全部流程授权.
    en.AutherToEmpNo = tb1; //全部流程授权.
    en.AutherToEmpName = tb2; //全部流程授权.
    en.RDT = DataType.CurrentDate;
    await en.Insert();

    //转入到url.
    let url = '';
    url = '/@/WF/Comm/EnOnly.vue?EnName=TS.User.Auth&PKVal=' + en.MyPK;
    return 'url@' + url;
  }
  // 按表单字段计算
  public readonly Docs0 = `
  #### 帮助
  - 按照节点表单的字段作为抄送人.
  - 通常是在节点表单上加一个字段,这个字段存储的是人员账号，多个人员使用逗号分开.
  #### 运行图例
  - @liang.

`;

  //按人员计算
  public readonly Docs1 = `
  #### 帮助
  - 自动抄送给要绑定的人员.
`;
  //按角色计算
  public readonly Docs2 = `
  #### 帮助
  - 按照绑定的部角色下的人员集合作为抄送人.
  - 有一个规则
  
`;
}
