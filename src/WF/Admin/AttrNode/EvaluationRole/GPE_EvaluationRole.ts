import { Node } from '/@/WF/TSClass/Node';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { EvaluationRole1 } from './EvaluationRole1';
import { EvaluationRole4 } from './EvaluationRole4';

export class GPE_EvaluationRole extends PageBaseGroupEdit {
  constructor() {
    super('GPE_EvaluationRole');
    this.PageTitle = '考核规则';
    //this.SingleDDLSQL('3', '按工作质量考核', 'Attrd', 'xxx desc', this.Desc3);
  }

  Init() {
    this.entity = new Node(); //对应的类.
    this.KeyOfEn = 'CHWay'; //对应的字段.
    this.AddGroup('A', '考核规则'); //增加分组.
    this.Blank('0', '不考核', this.Desc0);
    this.AddEntity('1', '按照固定时效考核', new EvaluationRole1(), this.Desc1);
    this.AddEntity('4', '按照指定字段的时效考核', new EvaluationRole4(), this.Desc1);
    this.Blank('2', '按工作量考核', this.Desc2);
    this.Blank('3', '按工作质量考核', this.Desc3);
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }

  public Desc0 = `
    
  #### 帮助
   - 默认为不考核，当前节点不设置任何形式的考核。
   #### 其它
   - ccbpm把考核分为:时效考核、工作量考核、质量考核三种类型.
   - 时效考核,就是按照指定时间范围内考核,比如:一件工作需要3天完成.
   - 工作量考核:就类似于计件工资.
   - 质量考核:就是工作处理的内容完成的结果由下一步的工作人员(领导)进行打分考核.
   ##### 质量考核存储表
   - 质量考核的数据存储在 WF_CHEval 表里.  
   ![输入图片说明](./resource/WF/Admin/AttrNode/EvaluationRole/Img/WF_CH.png "屏幕截图")
   #### 时效考核存储表.
   ![输入图片说明](./resource/WF/Admin/AttrNode/EvaluationRole/Img/WF_CH.png "屏幕截图")

    `;
  public Desc1 = `
  #### 帮助
   - 按时间点计算，或者说按照设置的时间区间计算。
   - 这个方式有：
   - 1. 设置天数，比如设置应该在几天几小时完成。
   - 2. 按表单的表单字段，选择时间字段，按其设置的时间计算。
   - 3. 流转自定义。 
  
 
      `;
  public Desc2 = `
  #### 帮助
   - 按照处理工作的多少进行考核。 
   - 这样的节点，一般都是多人处理的节点。
   `;

  public Desc3 = `
  #### 帮助
   - 质量考核，是当前节点对上一步的工作进行一个工作好坏的一个考核。
   - 考核的方式是对上一个节点进行打分，该分值记录到WF_CHEval的表里，开发人员对WF_CHEval的数据根据用户的需求进行二次处理。
   `;
}
