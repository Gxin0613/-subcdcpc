import { message } from 'ant-design-vue';
import { FrmNodeAttr } from '../FrmNode';
import { FrmNodeFields } from './FrmNodeField';
import { PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { FrmNodeCtrlSln } from './FrmNodeCtrlSln';
import BSEntity from '/@/utils/gener/BSEntity';
import { GloWF } from '../../../GloWF';

export class GPN_FrmNewDtl extends PageBaseGroupNew {
  constructor() {
    super('GPN_FrmNewDtl');
    this.ForEntityClassID = 'TS.AttrNode.MapDtlSln';
    this.PageTitle = '从表权限';
  }
  public async Init() {
    //增加子页面.
    this.AddGroup('A', '从表权限');

    const frmSln = new FrmNodeCtrlSln();
    frmSln.setPKVal(this.RefPKVal);
    await frmSln.Retrieve();
    const frmID = frmSln.FK_Frm;

    //const dtlSQL = `SELECT No,Name FROM Sys_MapDtl WHERE FK_MapData='${frmID}' AND FK_Node=0 `;
    this.SelectItemsByList('Dtl', '影响的从表', this.DescDtl, true, GloWF.SQLOfNewDtlSQL(frmID), true, true, frmSln.SelectedDtls);
    //const athSQL = `SELECT NoOfObj AS No,Name FROM Sys_Frmattachment WHERE FK_MapData='${frmID}'`;
    //this.SelectItemsByList('Ath', '影响的附件', this.DescAth, true, athSQL);
  }

  public async GenerSorts(): Promise<any> {
    return Promise.resolve(JSON.stringify([]));
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, _tb2: string, _tb3: string) {
    const frmSln = new FrmNodeCtrlSln();
    frmSln.setPKVal(this.RefPKVal);
    await frmSln.Retrieve();

    frmSln.SelectedDtls = tb1;
    await frmSln.Update();

    const frmID = frmSln.FK_Frm;

    const ens = new FrmNodeFields();
    await ens.Retrieve(FrmNodeAttr.FK_Node, frmSln.FK_Node, 'FK_MapData', frmID);

    //选择的元素.
    const strs = tb1.split(',');
    //循环选择的值string.
    for (let index = 0; index < strs.length; index++) {
      const dtlNo = strs[index];
      const mypk = dtlNo + '_' + frmSln.FK_Node;
      const en = new BSEntity('BP.WF.Template.Frm.MapDtlExt');
      en.setPK(mypk);
      const i = await en.RetrieveFromDBSources();
      if (i == 0) {
        en.setPK(dtlNo);
        await en.RetrieveFromDBSources(); //查询.

        en.setPK(mypk);
        en.FK_Node = frmSln.FK_Node; //设置FK_Node.
        en.FK_MapData = frmSln.FK_Frm; //原来的错误.
        en.No = mypk;
        en.setPara('EnName', 'TS.Frm.MapDtlExt');
        await en.Insert();
        await en.DoMethodReturnString('InitAttrsOfSelf');
      } else {

        en.FK_MapData = frmSln.FK_Frm;
        en.setPara('EnName', 'TS.Frm.MapDtlExt');
        await en.Update();
      }
    }

    message.info('设置成功,请关闭或者设置其他元素,进行编辑.');
    return;
    //alert('没有判断的pageNo=' + pageNo);
  }

  public readonly DescAttrs = `
  #### 帮助
  - 什么是正则表达式，请baidu，这个名词。
  - 系统已经帮您准备一个常用正则表达式.
  - 请选择正确的事件，然后根据事件选择表达式.
  - 比如: 校验文本框是否是电话号码，应该在失去焦点，而不能在双击事件.
  #### 图例
  - 电话号码校验
  - 
`;
  public readonly DescDtl = `
  #### 帮助
  - 自定义正则表达式, 请在文本框输入正则表达式，然后执行创建。
  - 请正确的选择事件然.
`;

  public readonly DescAth = `
  #### 帮助
  - 自定义函数，就是在服务器上创建一个js文件，写入一个函数.
`;
}
