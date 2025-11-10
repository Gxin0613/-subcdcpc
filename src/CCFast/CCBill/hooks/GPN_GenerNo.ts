import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { message } from 'ant-design-vue';

export class GPN_GenerNo extends PageBaseGroupNew {
  constructor() {
    super('GPN_GenerNo'); //实体的类名，以GPE_开头.
    this.PageTitle = '导出'; //实体名称.
  }
  public async Init() {
    this.TextBox2_NameNo('String', '文本字段', this.Desc0, '', '字段名', '中文名', '');
  }

  //获得类别,如果返回为空，就没有类别.
  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  //重写保存方法实现业务逻辑.
  /**
   * @author
   * 存在问题，两个类方法参数个数不同，设计的有问题
   * @last-modified 22/6/28 移除了未使用的pageName , 修改为sortNo
   * @param _pageID 页面ID.
   * @param _sortNo 分类编号, 可以为空.
   * @param _tb1
   * @param _tb2
   * @param _tb3
   */
  public override async Save_TextBox_X(_pageID: string, _sortNo: string, _tb1: string, _tb2: string, _tb3: string) {
    try {
      const handler = new HttpHandler('BP.CCBill.WF_CCBill');
      handler.AddPara('FrmID', this.RequestVal('FrmID'));
      handler.AddPara('Name', _tb1);
      handler.AddPara('No', _tb2);
      const data = await handler.DoMethodReturnString('MyDict_CreateBlankEntityNoName');
      if (data.includes('err@') == true) {
        message.error(data.replace('err@', ''));
        return new GPNReturnObj(GPNReturnType.Reload);
      }
    } catch (e) {
      message.error(e as string);
      return;
    }
    //关闭
    return new GPNReturnObj(GPNReturnType.Replace, `/@/CCFast/CCBill/MyEntityNoName.vue?FrmID=${this.RequestVal('FrmID')}&No=${_tb2}&RefNo=${_tb2}`);
  }

  public readonly Desc0 = `  
#### 帮助  
  

`;
}
