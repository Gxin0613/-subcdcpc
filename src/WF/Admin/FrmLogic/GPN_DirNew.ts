import { message } from 'ant-design-vue';
import { FrmAttachment } from '../FrmLogic/FrmAttachment/FrmAttachment';
import { MapAttr } from '../FrmLogic/MapAttrs/MapAttr';
import { GroupCtrlType, GroupField } from './GroupField';
import { MapDtl } from './MapDtl';
import { UIContralType } from '/@/bp/en/EnumLab';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { FrmImgAth } from '/@/WF/Admin/FrmLogic/MapAttrs/FrmImgAth';
import { GloComm } from '../../Comm/GloComm';
import { MapData } from './MapData';

export class GPN_DirNew extends PageBaseGroupNew {
  constructor() {
    super('GPN_DirNew');
    this.PageTitle = '新建目录';
  }
  public Init() {
    //增加子页面.
    this.AddGroup('A', '新建目录'); //增加分组.
    this.TextBox1_Name('Dir', '新建纯目录', this.HelpDirGroupField, '新建纯目录章节', '纯目录章节', '输入目录名称');
    this.TextBox1_Name('Attr', '新建Attr章节', this.HelpAttrGroupField, '新建Attr章节', 'Attr章节', '输入目录名称');
    // this.TextBox1_Name('Default', '新建节目录', this.HelpDefaultGroupField, '节目录', '目录1', '输入目录名称');
    this.TextBox2_NameNo('Dtl', '新建从表', this.FieldAth, 'Dtl', '从表ID', '名称', '从表');
    this.TextBox2_NameNo('Ath', '新建表格附件', this.FieldAth, 'Ath', '附件ID', '名称', '附件');
    this.TextBox2_NameNo('ChapterFrmLinkFrm', '自定义表单', this.HelpUn, '', '表单ID', '名称', '自定义表单');
    this.TextBox2_NameNo('Self', '自定义URL', this.HelpUn, '', 'url', '名称', '自定义Url');
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  public override async Save_TextBox_X(pageNo: string, _sortNo: string, tb1: string, tb2: string, _tb3: string) {
    const frmID = this.RequestVal('FrmID');
    const gf = new GroupField();
    gf.FrmID = frmID;
    gf.ParentOID = this.RequestVal('ParentOID');
    let enName = '';
    const groupID = this.RequestVal('ParentOID');
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
    if (pageNo === 'Ath') {
      // mapAttr.GroupID = groupID;
      // mapAttr.FK_MapData = frmID;
      mapAttr.MyPK = frmID + '_' + tb2;
      enName = 'TS.FrmUI.FrmAttachmentExt';

      gf.Lab = tb1;
      gf.FrmID = frmID;
      gf.CtrlID = mapAttr.MyPK;
      gf.CtrlType = GroupCtrlType.Ath; // 附件.;
      gf.Icon = 'icon-paper-clip';
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
      const url = '/@/WF/Comm/EnOnly.vue?EnName=' + enName + '&PKVal=' + ath.MyPK;
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
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

      gf.Lab = mapDtl.Name;
      gf.CtrlType = 'Dtl';
      gf.CtrlID = mapDtl.No;
      gf.Icon = 'icon-list';
      await gf.Insert();

      mapDtl.GroupField = gf.OID;
      await mapDtl.Insert();
      enName = 'TS.Frm.MapDtlExt';
      const url = '/@/WF/Comm/EnOnly.vue?EnName=' + enName + '&PKVal=' + mapDtl.No;
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }
    //如果是普通章节
    if (pageNo === 'Dir') {
      gf.Lab = tb1;
      gf.CtrlType = 'Dir';
      gf.SetPara('EnName', 'TS.FrmUI.GroupField');
      await gf.Insert();
    }
    //如果是Attr章节
    if (pageNo === 'Attr') {
      gf.Lab = tb1;
      gf.CtrlType = 'Attr';
      gf.SetPara('EnName', 'TS.FrmUI.GroupField');
      await gf.Insert();
    }
    //如果是自定义url章节
    if (pageNo === 'Self') {
      gf.Lab = tb1;
      gf.CtrlType = 'ChapterFrmSelfUrl';
      gf.CtrlID = tb2;
      gf.SetPara('EnName', 'TS.FrmUI.GroupField');
      gf.Icon = 'icon-link';
      await gf.Insert();
    }
    //如果是自定义表单章节
    if (pageNo === 'ChapterFrmLinkFrm') {
      const md = new MapData(frmID);
      md.No = tb2;
      if ((await md.RetrieveFromDBSources()) == 0) return 'err@表单ID输入错误.';
      gf.Lab = tb1;
      gf.CtrlType = 'ChapterFrmLinkFrm';
      gf.CtrlID = tb2;
      gf.SetPara('EnName', 'TS.FrmUI.GroupField');
      gf.Icon = 'icon-cup';
      await gf.Insert();
    }

    const url = GloComm.UrlEn(gf.GetParaString('EnName', ''), gf.OID);
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
  // 帮助：章节表单Dir章节
  public readonly HelpDirGroupField = `
 #### 帮助
 - Dir章节内的子级只能是附件，从表，Attr章节，Dir章节，大块文本字段.
`;
  // 帮助：章节表单默认类型章节
  public readonly HelpDefaultGroupField = `
#### 帮助
- CtrlType是空的字符串或者null.
- 子级可以是 或者 附件，从表，Attr章节，Dir章节.
`;
  // 帮助：章节表单Attr章节
  public readonly HelpAttrGroupField = `
 #### 帮助
 - Attr章节内的字段会显示为小表单的形式.
`;
}
