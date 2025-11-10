import { message } from 'ant-design-vue';
import { FrmNodeAttr } from '../FrmNode';
import { FrmNodeField, FrmNodeFields } from './FrmNodeField';
import { PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { FrmNodeCtrlSln } from './FrmNodeCtrlSln';
import { MapAttrs } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttr';
import { GloWF } from '../../../GloWF';

export class GPN_FrmNewAttr extends PageBaseGroupNew {
  constructor() {
    super('GPN_FrmNewAttr');
    this.ForEntityClassID = 'TS.AttrNode.FrmNodeField';
    this.PageTitle = '字段权限';
  }
  public async Init() {
    //增加子页面.
    this.AddGroup('A', '字段权限11');
    const frmSln = new FrmNodeCtrlSln();
    frmSln.setPKVal(this.RefPKVal);
    await frmSln.Retrieve();
    const frmID = frmSln.FK_Frm;
    // alert(frmSln.SelectedAttrs);
    //  const frmID = this.RefPKVal; // 'ND101';
    //this.AddBlank('RegularExpressionLab', '绑定正则表达式库', this.RegularExpressionLab);
    const group = GloWF.sqlGroupField(frmID); //  `SELECT OID AS No,Lab as Name FROM Sys_GroupField WHERE (CtrlType=''OR CtrlType IS NULL) AND FrmID='${frmID}' ORDER BY Idx`;
    const list = GloWF.sqlFields(frmID);
    // const list = `SELECT KeyOfEn AS No, Name, GroupID as GroupNo FROM Sys_MapAttr
    //  WHERE FK_MapData='${frmID}' AND UIVisible=1
    //   ORDER BY Idx`;
    this.SelectItemsByGroupList('Attr', '字段权限', '', true, group, list, true, frmSln.SelectedAttrs);
    //this.SelectItemsByList('Attr', '选择影响的字段', this.DescAttrs, false, list);
    //const dtlSQL = `SELECT No,Name FROM Sys_MapDtl WHERE FK_MapData='${frmID}'`;
    // this.SelectItemsByList('Dtl', '影响的从表', this.DescDtl, true, dtlSQL);
    //const athSQL = `SELECT NoOfObj AS No,Name FROM Sys_Frmattachment WHERE FK_MapData='${frmID}'`;
    //this.SelectItemsByList('Ath', '影响的附件', this.DescAth, true, athSQL);
  }

  public async GenerSorts(): Promise<any> {
    return Promise.resolve(JSON.stringify([]));
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, tb2: string, _tb3: string) {
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

    const attrs = new MapAttrs();
    await attrs.Retrieve('FK_MapData', frmID);

    //选择的元素.
    const strs = tb1.split(',');
    const names = tb2.split(',');
    console.log(strs);
    //循环选择的值string.
    for (let index = 0; index < strs.length; index++) {
      const attrKey = strs[index];
      const frmNodeField = new FrmNodeField();
      frmNodeField.MyPK = frmSln.FK_Frm + '_' + frmSln.FK_Node + '_' + attrKey; // + sysEnum.IntKey;
      frmNodeField.setPKVal(frmNodeField.MyPK);
      const isHave = ens.filter((item) => item.KeyOfEn === attrKey).length > 0 ? true : false;
      if (isHave == true) continue;
      const attr = attrs.filter((attr) => attr.KeyOfEn == attrKey)[0];
      frmNodeField.FK_Flow = frmSln.FK_Flow;
      frmNodeField.FK_Node = frmSln.FK_Node;
      frmNodeField.FK_MapData = frmSln.FK_Frm;
      frmNodeField.KeyOfEn = attrKey; //字段。
      frmNodeField.Name = names[index]; //字段名
      frmNodeField.EleType = 'Field'; // 类型.
      frmNodeField.UIIsEnable = attr.UIIsEnable;
      frmNodeField.UIVisible = attr.UIVisible;
      frmNodeField.IsNotNull = attr.UIIsInput;
      frmNodeField.DefVal = attr.DefVal;
      frmNodeField.Idx = index;
      await frmNodeField.Insert();
    }

    //更新选择项.
    frmSln.SelectedAttrs = tb1;
    await frmSln.Update();

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
