import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { NodeAttr, Node } from '/@/WF/TSClass/Node';
import { GloComm } from '/@/WF/Comm/GloComm';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';

export class GPE_BlockModel extends PageBaseGroupEdit {
  constructor() {
    super('GPE_BlockModel');
    this.PageTitle = '发送阻塞';
  }
  Init() {
    this.entity = new Node(); // new Node(); //对应的类.
    this.KeyOfEn = NodeAttr.BlockModel; //对应的字段.

    this.AddGroup('A', '+通用阻塞'); //增加分组.
    this.Blank('0', '不阻塞', this.Desc0);
    this.SingleTBSQL('3', '按照SQL阻塞', 'BlockExp', this.Desc1, '请按照帮助设置SQL');
    this.SingleTBSQL('7', '按照URL阻塞', 'BlockExp', this.Desc7, '请按照帮助设置URL');
    this.SingleTB('4', '按照表达式阻塞', 'BlockExp', this.Desc2, '请输入表达式...');

    this.AddGroup('B', '+父子流程规则'); //增加分组.
    this.Blank('1', '当前节点有未完成的子流程时', this.Desc3);
    this.SingleTB('2', '按约定格式阻塞未完成子流程', 'BlockExp', this.Desc4, '输入流程编号，多个用逗号分来，比如:001,002');
    this.SingleTB('5', '子流程未运行到指定的节点', 'BlockExp', this.Desc5, '输入流程编号，多个用逗号分来，比如:001,002');
    this.SingleTB('6', '平级子流程未运行到指定的节点', 'BlockExp', this.Desc6, '输入流程编号，多个用逗号分来，比如:001,002');
    this.Btns = [
      { pageNo: '1', list: ['高级设置'] },
      { pageNo: '2', list: ['高级设置'] },
      { pageNo: '3', list: ['高级设置'] },
      { pageNo: '4', list: ['高级设置'] },
      { pageNo: '5', list: ['高级设置'] },
      { pageNo: '6', list: ['高级设置'] },
      { pageNo: '7', list: ['高级设置'] },
    ];
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
    if (btnName == '高级设置') {
      const url = GloComm.UrlEnOnly('TS.WF.BlockModelAdvSetting', this.RefPKVal);
      return new GPNReturnObj(GPNReturnType.OpenUrlByModal, url);
    }
  }

  public readonly Desc0 = `
  #### 帮助
   - 默认模式，不阻塞。
   - 在发送的的时候，符合什么样的条件，才不让它运行下去。
`;
  public readonly Desc1 = `
  #### 帮助
   - 配置一个SQL，该SQL返回一行一列的数值类型的值。
   - 如果该值大于0，则阻塞发送，反之不阻塞。
   - 配置的参数支持ccbpm表达式。
`;
  public readonly Desc2 = `
 #### 帮助
  - 配置一个表达式，该表达式成立的时候，当前节点就不能向下发送。 
  - 表达式：@+字段名+空格+运算符+空格+值；字段名就是节点表单的所有字段，空格为英文状态下空格，运算符包含：=、!=、>、>=、<、<=、LIKE。
  - 注意: 仅仅支持一个表达式，比如: @JinE > 10000。
 `;
  public readonly Desc3 = `
 #### 帮助
   - 当前节点调起了子流程，并且有未完成的子流程时就不能向下发送。
   - 所有在此节点上启动的子流程，都完成后，该节点才能向下发送。
 `;
  public readonly Desc4 = `
 #### 帮助
  - 当前节点向下发送时，要检查当前节点前指定的历史节点，曾经启动的指定的子流程全部完成，当前节点才可向下发送。
  - 例如：在D节点上，要检查曾经在C节点上启动的子流程是否全部完成，如果完成就不阻塞。
  - 配置格式：@指定的节点1=子流程编号1@指定的节点n=子流程编号n。注意：等号只是分隔符，不具备逻辑关系。可以配置多个历史节点。
 `;
  public readonly Desc5 = `
 #### 帮助
  - 当前节点向下发送时，要检查指定的子流程是否运行过指定的节点，当前节点才可向下发送。
  - 例如：在D节点上，要检查启动的子流程是否全部运行到指定的节点，如果完成就不阻塞。
  - 配置格式：402,503。注意：只需确定子流程指定节点即可，可以配置多个。
 `;
  public readonly Desc6 = `
 #### 帮助
  - 当前节点向下发送时，要检查指定平级子流程是否运行过指定的节点，当前节点才可向下发送。
  - 例如：在D节点上，要检查启动的平级子流程是否全部运行到指定的节点，如果完成就不阻塞。
  - 配置格式：402,503。注意：只需确定子流程指定节点即可，可以配置多个。
 `;
  public readonly Desc7 = `
  #### 帮助
   - 配置一个GET请求的URL,返回的数据结构{code:200,message:'',data:'1'}。
   - 如果返回的JSON格式，data值为1，则阻塞发送，反之不阻塞。
   - 配置的参数支持ccbpm表达式。
`;
}
