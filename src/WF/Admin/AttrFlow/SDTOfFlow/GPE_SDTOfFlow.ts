import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { Flow } from '/@/WF/TSClass/Flow';

export class GPE_SDTOfFlow extends PageBaseGroupEdit {
  constructor() {
    super('GPE_SDTOfFlow');
    this.PageTitle = '计划时间计算规则';
    // this.SingleTBPara("4", "按照规定的天数计算", "SDTOfFlowRole_Days", this.Desc4());
  }
  Init() {
    this.entity = new Flow(); //对应的类.
    this.KeyOfEn = 'SDTOfFlowRole'; //对应的字段.

    //增加子页面.
    this.AddGroup('A', '流程计划时间计算'); //增加分组.
    this.Blank('0', '不使用', '不使用规则');

    this.SingleTBSQL('2', '按照SQL计算', 'SDTOfFlowRoleSQL', this.Desc2());
    this.Blank('3', '按照所有节点的时间之和计算', this.Desc3());
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID === pageVal || pageID == btnName) {
    }
  }

  public Desc1() {
    let html = '按照节点表单的日期计算:';
    html += '<ul>';
    html += ' <li>请选择计划开始日期的字段和计划完成日期的字段.</li>';
    html += '</ul>';
    return html;
  }

  public Desc2() {
    let html = '按照SQL计算:';
    html += '<ul>';
    html += ' <li>例如: SELECT myfield FROM xxxx WHERE OID=@WorkID 返回值是一行，一列的string类型的数据，比如: 2019-09-09</li>';
    html += '</ul>';
    return html;
  }

  public Desc3() {
    let html = '按照所有节点的时间之和计算:';
    html += '<ul>';
    html += ' <li>一个流程有多个节点，每个节点都设置了应该完成天数。</li>';
    html += ' <li>一个流程应该完成的天数，是所有节点的时效考核的数据之和。</li>';
    html += '</ul>';

    return html;
  }

  public Desc4() {
    let html = '按照规定的天数计算';
    html += '<ul>';
    html += '<li>设置多少天，就按照这个流程的天数来计算，该流程的应该完成日期。</li>';
    html += '</ul>';
    return html;
  }
}
