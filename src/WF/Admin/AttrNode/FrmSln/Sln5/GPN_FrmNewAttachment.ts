import { message } from 'ant-design-vue';
import { FrmNodeAttr } from '../FrmNode';
import { FrmNodeFields } from './FrmNodeField';
import { PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { FrmNodeCtrlSln } from './FrmNodeCtrlSln';
import BSEntity from '/@/utils/gener/BSEntity';
import { GloWF } from '../../../GloWF';

export class GPN_FrmNewAttachment extends PageBaseGroupNew {
  constructor() {
    super('GPN_FrmNewAttachment');
    this.ForEntityClassID = 'TS.AttrNode.FrmAttachmentSln';
    this.PageTitle = '附件权限';
  }
  public async Init() {
    //增加子页面.
    this.AddGroup('A', '附件权限');

    const frmSln = new FrmNodeCtrlSln();
    frmSln.setPKVal(this.RefPKVal);
    await frmSln.Retrieve();
    const frmID = frmSln.FK_Frm;

    //const athSQL = `SELECT MyPK AS No,Name FROM Sys_FrmAttachment WHERE FK_MapData='${frmID}' AND FK_Node=0 `;
    this.SelectItemsByList('Dtl', '影响的附件', this.DescAth, true, GloWF.SQLOfNewAthSQL(frmID), true, frmSln.SelectedAths);
    //const athSQL = `SELECT NoOfObj AS No,Name FROM Sys_Frmattachment WHERE FK_MapData='${frmID}'`;
    //this.SelectItemsByList('Ath', '影响的附件', this.DescAth, true, athSQL);
  }

  public async GenerSorts(): Promise<any> {
    return Promise.resolve(JSON.stringify([]));
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, _tb2: string, _tb3: string) {
  //  debugger;
    const frmSln = new FrmNodeCtrlSln();
    frmSln.setPKVal(this.RefPKVal);
    await frmSln.Retrieve();
    const frmID = frmSln.FK_Frm;

    const ens = new FrmNodeFields();
    await ens.Retrieve(FrmNodeAttr.FK_Node, frmSln.FK_Node, 'FK_MapData', frmID);

    //删除取消的数据.
    for (let index = 0; index < ens.length; index++) {
      const en = ens[index];
      if (tb1.indexOf(en.KeyOfEn + ',') >= 0) continue; // 跳过
      await en.Delete();
    }

    //选择的元素.
    const strs = tb1.split(',');
    //循环选择的值string.
    for (let index = 0; index < strs.length; index++) {
      const athMyPK = strs[index];
      const mypk = athMyPK + '_' + frmSln.FK_Node;
      const en = new BSEntity('BP.Sys.FrmUI.FrmAttachmentExt');
      en.setPK(mypk);
      const i = await en.RetrieveFromDBSources();
      if (i == 0) {
        en.setPK(athMyPK);
        await en.RetrieveFromDBSources(); //查询.

        en.setPK(mypk);
        en.FK_Node = frmSln.FK_Node; //设置FK_Node.
        en.FK_MapData = frmSln.FK_Frm; //原来的错误.
        en.MyPK = mypk;
        en.setPara('EnName', 'TS.FrmUI.FrmAttachmentExt');
        await en.Insert();
      } else {
        en.FK_MapData = frmSln.FK_Frm;
        en.FK_Node = frmSln.FK_Node; //设置FK_Node.
        en.setPara('EnName', 'TS.FrmUI.FrmAttachmentExt');
        await en.Update();
      }
    }

    //更新选择项.
    frmSln.SelectedAths = tb1;
    await frmSln.Update();

    message.info('设置成功,请关闭或者设置其他元素,进行编辑.');
    return;
    //alert('没有判断的pageNo=' + pageNo);
  }

  public readonly DescAth = `
  #### 帮助
  - 自定义函数，就是在服务器上创建一个js文件，写入一个函数.
`;
}
