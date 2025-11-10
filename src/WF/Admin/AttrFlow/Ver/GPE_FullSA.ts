import { DataType } from '/@/bp/en/DataType';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import BSEntity from '/@/utils/gener/BSEntity';
import { Flow } from '/@/WF/TSClass/Flow';

export class GPE_FullSA extends PageBaseGroupEdit {
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID === pageVal) throw new Error('Method not implemented.');

    if (pageID === '1') {
      //检查当前的流程是否支持?
    }
  }
  constructor() {
    super('GPE_FullSA');
    this.PageTitle = '计算未来处理人';
  }
  Init() {
    this.entity = new Flow(); //对应的类.
    this.KeyOfEn = 'IsFullSA'; //要编辑的字段.
    this.Btns = [{ pageNo: '1', list: ['检查正确性', '生成数据版本号'] }];

    //增加子页面.
    this.AddGroup('A', '工作模式'); //增加分组.
    this.Blank('0', '不计算', this.Desc0);
    this.Blank('1', '自动计算未来处理人', this.Desc1);
  }

  public async BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (btnName === '检查正确性') {
      const flow = new BSEntity('BP.WF.Flow', this.params.FlowNo);
      await flow.Retrieve();
      const data = await flow.DoMethodReturnString('DoCheckFullSA');
      return new GPNReturnObj(GPNReturnType.Message, data);
    }
    if (btnName === '生成数据版本号') {
      if (window.confirm('您确认要执行吗?') == false) return;
      const flow = new BSEntity('BP.WF.Flow', this.params.FlowNo);
      await flow.Retrieve();
      flow.setPara('SADataVer', DataType.CurrentDateTime);
      await flow.Update();
      return new GPNReturnObj(GPNReturnType.Message, '生成成功,在途的流程就会重新计算接受人.');
    }

    if (pageID === pageVal || pageID == btnName) {
    }
  }

  public readonly Desc0 = `
  #### 帮助
  - 自动计算未来处理人，是指在流程发起的时候，自动计算出来流程要走的方向以及每个节点的抄送人员、处理人员。
  - 不计算：是一个默认的模式，是指每次发送的时候计算下一步的接受人.
  - 自动计算：在开始节点填写表单之后，就执行计算每个节点的接受人，抄送人。
  #### 应用场景
   - 适合不同的客户需求，计算未来接收人，能够让发起人，或者中间节点的处理人清楚的知道未来处理人。
   - 更多帮助: https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3661875&doc_id=31094
  `;

  public readonly Desc1 = `
  
  #### 帮助 
  - 自动计算：在开始节点填写表单之后，就执行计算每个节点的接受人,抄送人.
  - 该模式应用场景较少.
  - 如下图:
  - ![输入图片说明](./resource/WF/Admin/AttrFlow/FullSA/FullSA.png);

  #### 生成数据版本号
  - 发起人启动起来流程以后，系统就会计算运动路径以及处理人，如果流程模板在中途变更了(主要是方向条件与接受人规则发生变化了),也不影响流程运行.
  - 如果需要对运行的流程实例，接受变更后的影响，就需要生成数据版本编号.
  - 每个流程实例启动后，就记录了当前流程模板的数据版本好, 在流程运行过程中，如果版本号变化了，就会重新计算接受人.
  #### 其他
  - 如果流程发生减少节点、减少表单字段信息变更，就需要创建流程模板。
  - 如果接受人规则、抄送规则、方向条件等变更，则不需要创建流程模板版本。

  `;
}
