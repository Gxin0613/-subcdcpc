import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';
import WebUser from '/@/bp/web/WebUser';
import { message } from 'ant-design-vue';
import HttpHandler from '../FoolFormDesigner/dto/HttpHandler';
import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';

export class GPN_Org extends PageBaseGroupNew {
  constructor() {
    super('GPN_Org'); //实体的类名，以GPE_开头.
    this.PageTitle = '新建组织'; //实体名称.
  }
  public async Init() {
    console.log({ WebUser });
    if (WebUser.No != 'admin') {
      message.error('err@您好:' + WebUser.Name + ',非管理员用户不能执行.');
      return;
    }
    this.AddGroup('A', '组织'); //增加分组.
    this.TextBox2_NameNo('Emp', '新建组织', this.HelpUn, '', '组织账号', '组织名称', '');
  }

  //获得类别,如果返回为空，就没有类别.
  public async GenerSorts() {
    // const ens = new Sorts();
    // await ens.RetrieveAll();
    // return ens;
    return Promise.resolve([]);
  }
  //重写保存方法实现业务逻辑.
  /**
   * @author
   * 存在问题，两个类方法参数个数不同，设计的有问题
   * @last-modified 22/6/28 移除了未使用的pageName , 修改为sortNo
   * @param pageID 页面ID.
   * @param sortNo 分类编号, 可以为空.
   * @param tb1 第1个文本框的值
   * @param tb2 第2个文本框的值
   * @param tb3
   */
  public override async Save_TextBox_X(pageID: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    const reg = new RegExp('[一-龥]+');
    if (reg.test(tb2)) {
      alert('不允许输入中文字符,半角字母或者下划线数字.');
      return;
    }

    if (tb2 == null || tb2 == undefined) return;

    const handler = new HttpHandler('BP.Cloud.HttpHandler.Admin');
    handler.AddPara('SortNo', sortNo); // 树节点编号
    handler.AddPara('OrgNo', tb2);
    handler.AddPara('OrgName', tb1);
    const data = await handler.DoMethodReturnString('Organization_CreateOrg');
    if (data.includes('err@') == true) {
      return new GPNReturnObj(GPNReturnType.Message, data);
    }
    if (WebUser.CCBPMRunModel == CCBPMRunModel.SAAS) return new GPNReturnObj(GPNReturnType.GoToUrl, GloComm.UrlEn('TS.SaaS.OrgAdmin', tb2));
    else return new GPNReturnObj(GPNReturnType.GoToUrl, GloComm.UrlEn('TS.Port.AdminGroup.Org', tb2));
  }
}
