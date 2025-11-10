import { message } from 'ant-design-vue';
import { FrmAttachment } from '../FrmLogic/FrmAttachment/FrmAttachment';
import { MapAttr } from '../FrmLogic/MapAttrs/MapAttr';
import { GroupCtrlType, GroupField } from './GroupField';
import { MapDtl } from './MapDtl';
import { UIContralType } from '/@/bp/en/EnumLab';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { FrmImgAth } from '/@/WF/Admin/FrmLogic/MapAttrs/FrmImgAth';

export class GPN_Ath extends PageBaseGroupNew {
  constructor() {
    super('GPN_Ath');
    this.PageTitle = '附件从表';
  }
  public Init() {
    //增加子页面.
    this.AddGroup('A', '附件'); //增加分组.
    this.TextBox2_NameNo('field', '字段附件', this.FieldAth, 'Ath', '字段ID', '附件名称', '我的附件');
    this.AddIcon('iconfont icon-attach', 'field');
    //this.TextBox2_NameNo('FrmAttachmentSingle', '字段单附件', this.FieldAth, 'Ath', '字段ID', '附件名称', '单附件');
    this.TextBox2_NameNo('table', '表格附件', this.FieldAth, 'Ath', '字段ID', '附件名称', '表格附件');
    this.AddIcon('iconfont icon-biaogefujian', 'table');
    this.TextBox2_NameNo('image', '图片附件', this.FieldAth, 'Ath', '字段ID', '附件名称', '我的图片');
    this.AddIcon('iconfont icon-tupianfujian', 'image');
    this.TextBox2_NameNo('write', '写字板', this.FieldAth, 'Ath', '字段ID', '写字板名称', '写字板');
    this.AddIcon('iconfont icon-xiezi', 'write');
    // this.TextBox2_NameNo('office', '公文附件', this.FieldAth, 'Ath', '字段ID', '附件名称', '公文附件');

    // this.AddGroup('B', '从表'); //增加分组.
    // this.TextBox2_NameNo('Dtl', '新建从表', this.FieldAth, 'Dtl', '编号', '名称', '从表1');

    // this.AddGroup('B', '通用组件'); //增加分组.
    // this.TextBox2_NameNo('MapAttrCard', '身份证', this.FieldAth, 'Card', '组件ID', '组件名称', '身份证1');
    // this.TextBox2_NameNo('FrmBtn', '按钮', this.FieldAth, 'Btn', '组件ID', '组件名称', '按钮1');
    // this.TextBox2_NameNo('ExtLink', '超链接', this.FieldAth, 'Link', '字段ID', '连接标签', '我的连接');
    // this.TextBox2_NameNo('ExtMap', '地图', this.FieldAth, 'Map', '字段ID', '名称', '我的地图');
    // this.TextBox2_NameNo('ExtScore', '评分', this.FieldAth, 'Score', '字段ID', '名称', '评分');
    // this.TextBox2_NameNo('Test', '测试组件', this.FieldAth, 'Score', '字段ID', '名称', '测试');

    // this.AddGroup('C', '流程组件'); //增加分组.
    // this.TextBox2_NameNo('MapAttrCheck', '签批组件', this.FieldAth, 'WorkCheck', '字段ID', '名称', '签批组件');
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  public override async Save_TextBox_X(pageNo: string, _sortNo: string, tb1: string, tb2: string, _tb3: string) {
    const frmID = this.RequestVal('FrmID');
    const groupID = this.RequestVal('GroupField');
    let enName = '';
    const mapAttr = new MapAttr();
    //新建字段-字段附件.
    if (pageNo === 'field' || pageNo == 'FrmAttachmentSingle') {
      mapAttr.GroupID = groupID;
      mapAttr.FK_MapData = frmID;
      mapAttr.MyPK = frmID + '_' + tb2;
      mapAttr.KeyOfEn = tb2;
      mapAttr.Name = tb1;

      if ((await mapAttr.IsExits()) == true) return new GPNReturnObj(GPNReturnType.Error, '附件ID[' + mapAttr.MyPK + ']已存在');

      const ath = new FrmAttachment();
      ath.MyPK = mapAttr.MyPK;
      if ((await mapAttr.IsExits()) == false) {
        //插入附件信息.
        ath.FK_MapData = frmID;
        ath.NoOfObj = tb2;
        ath.Name = tb1;
        ath.GroupID = groupID;
        ath.IsDtlAth = 0;
        //多附件.
        if (pageNo === 'field') mapAttr.UploadType = 1;
        else mapAttr.UploadType = 0; //单附件.

        await ath.Insert();
      }
      //插入字段信息.
      if (pageNo === 'field') {
        mapAttr.UIContralType = UIContralType.AthShow; //附件.
        enName = 'TS.FrmUI.FrmAttachmentExt';
        mapAttr.SetPara('EnName', enName);
      }
      if (pageNo === 'FrmAttachmentSingle') {
        mapAttr.UIContralType = UIContralType.AthShow; //单附件.
        mapAttr.UploadType = 0;
        enName = 'TS.FrmUI.FrmAttachmentExt';
        mapAttr.SetPara('EnName', enName);
      }
      await mapAttr.Insert();
    }

    //新建表格附件..
    if (pageNo === 'table') {
      mapAttr.GroupID = groupID;
      mapAttr.FK_MapData = frmID;
      mapAttr.MyPK = frmID + '_' + tb2;
      enName = 'TS.FrmUI.FrmAttachmentExt';

      const gf = new GroupField();
      gf.Lab = tb1;
      gf.FrmID = frmID;
      gf.CtrlID = mapAttr.MyPK;
      gf.CtrlType = GroupCtrlType.Ath; // 附件.;
      await gf.Insert();

      const ath = new FrmAttachment();
      ath.MyPK = mapAttr.MyPK;
      if ((await ath.IsExits()) == true) return new GPNReturnObj(GPNReturnType.Error, '附件ID[' + mapAttr.MyPK + ']已存在');
      //插入附件信息.
      ath.FK_MapData = frmID;
      ath.NoOfObj = tb2;
      ath.Name = tb1;
      ath.GroupID = gf.OID;
      ath.IsDtlAth = 0;
      // ath.GroupID = groupID;
      await ath.Insert();
    }

    //写字板
    if (pageNo === 'write') {
      mapAttr.GroupID = groupID;
      mapAttr.FK_MapData = frmID;
      mapAttr.MyPK = frmID + '_' + tb2;
      mapAttr.KeyOfEn = tb2;
      mapAttr.Name = tb1;
      mapAttr.UIContralType = UIContralType.HandWriting; //写字板.
      enName = 'TS.FrmUI.FrmHandWriting';
      mapAttr.SetPara('EnName', enName);
      await mapAttr.Insert();
    }

    //图片附件
    if (pageNo === 'image') {
      mapAttr.GroupID = groupID;
      mapAttr.FK_MapData = frmID;
      mapAttr.MyPK = frmID + '_' + tb2;
      mapAttr.KeyOfEn = tb2;
      mapAttr.Name = tb1;
      mapAttr.UIContralType = UIContralType.FrmImgAth; //写字板.
      enName = 'TS.FrmUI.FrmImgAth';
      mapAttr.SetPara('EnName', enName);
      if ((await mapAttr.IsExits()) == true) return new GPNReturnObj(GPNReturnType.Error, '附件ID[' + mapAttr.MyPK + ']已存在');

      const ath = new FrmImgAth();
      ath.MyPK = mapAttr.MyPK;
      if ((await mapAttr.IsExits()) == false) {
        //插入附件信息.
        ath.FK_MapData = frmID;
        ath.CtrlID = tb2;
        ath.Name = tb1;
        ath.GroupID = groupID;
        ath.IsDtlAth = 0;
        await ath.Insert();
      }
      await mapAttr.Insert();
    }

    //公文组件
    if (pageNo === 'office') {
      mapAttr.GroupID = groupID;
      mapAttr.FK_MapData = frmID;
      mapAttr.MyPK = frmID + '_' + tb2;
      mapAttr.KeyOfEn = tb2;
      mapAttr.Name = tb1;
      mapAttr.UIContralType = UIContralType.GovDocFile; //公文组件.
      enName = 'TS.FrmUI.MapAttrGovDocFile';
      mapAttr.SetPara('EnName', enName);
      await mapAttr.Insert();
    }

    //如果是从表.
    if (pageNo === 'Dtl') {
      const mapDtl = new MapDtl();
      mapDtl.No = frmID + tb2;
      if (await mapDtl.IsExits()) {
        message.info(tb2 + '已经存在');
        return;
      }
      mapDtl.Name = tb1;
      mapDtl.FK_MapData = frmID;
      mapDtl.PTable = mapDtl.No;

      const gf = new GroupField();
      gf.Lab = mapDtl.Name;
      gf.FrmID = mapDtl.FK_MapData;
      gf.CtrlType = 'Dtl';
      gf.CtrlID = mapDtl.No;
      await gf.Insert();

      mapDtl.GroupField = gf.OID;
      await mapDtl.Insert();
      enName = 'TS.Frm.MapDtlExt';

      const url = '/@/WF/Comm/En.vue?EnName=' + enName + '&PKVal=' + mapDtl.No;
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    const url = '/@/WF/Comm/En.vue?EnName=' + enName + '&PKVal=' + mapAttr.MyPK;
    return new GPNReturnObj(GPNReturnType.GoToUrl, url);
  }

  // 新建string枚举
  public readonly FieldAth = `
  #### 帮助
  - 字段附件，附件以字段名的形式在页面中显示; 
  #### 图例
  ![输入图片说明](./resource/WF/Admin/FrmLogic/SFTable/Img/Ath1.png "屏幕截图.png") 
  #### 数据存储
  - 附件的默认保存在web服务器上。
  - 可以保存到ftp服务器上, ftp的服务器的连接配置在全局的配置文件中。
  - 如果需要保存到数据库，就需要考虑数据库的存储与备份的问题，文件将会存储在 Sys_FrmAttachmentDB 表中。
 
    `;

  // 新建int枚举
  public readonly NewIntEnum = `
  #### 帮助
  - 填写格式1: 团员,党员,群众
  - 系统解析为: 0是团员，1是党员，2是群众.
  - 填写格式2: @0=团员@1=党员@2=群众
  - 系统解析为: 0是团员，1是党员，2是群众，这样就可以自己定义枚举值.
  #### 数据存储
  - int类型的枚举值是常用的数据类型，ccfrom是格式化的存储到数据表里.
  - 创建一个int类型的字段，用于存储枚举的数据.
    `;

  // 选择自定的枚举
  public readonly Docs1 = `
  #### 帮助 
   - 该表单是固定格式的表单,可以展现4列6列展现.
   - 优点:开发效率高,展现简洁,学习成本低,业务人员可以入手.
   - 缺点:展示样式固定.
  `;

  // 选择系统枚举
  public readonly Docs2 = `

  #### 帮助
   - 依托富文本编辑器,实现对表单的编辑.
   - 优点:格式灵活,展现效果随心所欲.
   - 缺点:业务人员入手需要一定的学习成本.
   - 适用于:效果
    
  `;
}
