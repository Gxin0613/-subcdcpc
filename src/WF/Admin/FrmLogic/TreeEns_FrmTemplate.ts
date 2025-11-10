import { PageBaseTreeEns } from '/@/bp/UIEntity/PageBaseTreeEns';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';
import DBAccess from '/@/utils/gener/DBAccess';
import { message, Modal } from 'ant-design-vue';
import { GroupField, GroupFields } from './GroupField';
import { MapAttr, MapAttrs } from './MapAttrs/MapAttr';
import { FieldTypeS, UIContralType } from '/@/bp/en/EnumLab';
import { DataType } from '/@/bp/en/DataType';
import { createVNode } from 'vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue/lib/icons';
import { AtPara } from '/@/bp/da/AtPara';
import { MapExts } from './MapExt';
export class TreeEns_FrmTemplate extends PageBaseTreeEns {
  constructor() {
    super('TreeEns_FrmTemplate');
    this.PageTitle = '字段模板';
  }
  //重写的构造方法.
  override async Init() {
    this.RootNo = '0';
    //分组数据.
    const trees = new GroupFields();
    const num = await trees.Retrieve('FrmID', 'FrmTemplate', 'Idx');
    if (num == 0) {
      const en = new GroupField();
      en.Lab = '基础模板';
      en.FrmID = 'FrmTemplate';
      en.Idx = 0;
      en.ParentOID = 1;
      await en.Insert();

      en.OID = 0;
      en.Lab = '公文模板';
      en.FrmID = 'FrmTemplate';
      en.Idx = 1;
      en.ParentOID = 1;
      await en.Insert();
      await trees.Retrieve('FrmID', 'FrmTemplate', 'Idx');
    }
    const en = new GroupField();
    en.Lab = '模板';
    en.OID = 1;
    en.ParentOID = 0;
    trees.unshift(en);
    trees.forEach((item) => {
      item.No = item.OID.toString();
      item.ParentNo = item.ParentOID.toString();
      item.Name = item.Lab;
      item.SetValByKey('No', item.OID.toString());
      item.SetValByKey('ParentNo', item.ParentOID.toString());
      item.SetValByKey('Name', item.Lab);
    });
    this.TreeEns = trees;

    // 定义列，这些列用于显示.
    this.Columns = [
      { id: 'KeyOfEn', name: '编号' },
      { id: 'Name', name: '名称', Width: 300 },
      { id: 'Type', name: '字段类型' },
    ];
    // 关联的字段
    this.EnableContextMenu = false; // 不右击
    this.RefKey = 'GroupID'; //关联实体
    this.BtnsOfTableTop = '选择插入,新建字段,新建分组';
    this.BtnsOfItemOptions = '编辑,删除'; //行操作的按钮.
    this.IsEnMove = false; //实体是否可以移动？
    this.DtlEns = new MapAttrs();
  }

  public override async GetDtls(nodeID: string) {
    const attrs = new MapAttrs();
    await attrs.Retrieve('FrmID', 'FrmTemplate', 'GroupID', nodeID, 'Idx');
    attrs.forEach((mapAttr) => {
      if ((mapAttr.LGType === FieldTypeS.Normal && mapAttr.UIContralType === UIContralType.DDL) || mapAttr.LGType === FieldTypeS.FK) mapAttr.SetValByKey('Type', '外键');
      else if (mapAttr.LGType === FieldTypeS.Enum) {
        if (mapAttr.UIContralType === UIContralType.CheckBok) mapAttr.SetValByKey('Type', '枚举多选');
        else mapAttr.SetValByKey('Type', '枚举');
      } else if (mapAttr.MyDataType === DataType.AppBoolean) mapAttr.SetValByKey('Type', '单复选框');
      else if (mapAttr.MyDataType === DataType.AppInt && mapAttr.LGType === FieldTypeS.Normal) mapAttr.SetValByKey('Type', '整数');
      else if (mapAttr.MyDataType === DataType.AppFloat || mapAttr.MyDataType === DataType.AppDouble) mapAttr.SetValByKey('Type', '数值');
      else if (mapAttr.MyDataType === DataType.AppMoney) mapAttr.SetValByKey('Type', '金额');
      else if (mapAttr.MyDataType === DataType.AppDate) mapAttr.SetValByKey('Type', '日期');
      else if (mapAttr.MyDataType === DataType.AppDateTime) mapAttr.SetValByKey('Type', '日期时间');
      else mapAttr.SetValByKey('Type', '文本');
    });
    return attrs;
  }
  public async BtnClick(btnLab: string, treeNodeID: string, itemIDs: string, _selectTreeOrg, _record: Nullable<RowData> = null) {
    if (btnLab === '新建字段') {
      const url = GloComm.UrlGPN('GPN_DtlField', '', '&FrmID=FrmTemplate&GroupID=' + treeNodeID + '&inlayer=1&s=' + Math.random());
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    }
    if (btnLab === '新建分组') {
      const frmID = 'FrmTemplate';
      const name = window.prompt('创建分组', '');
      if (!name) return;

      //判断分组名称是否存在
      const ens = new GroupFields();
      const num = await ens.Retrieve('FrmID', 'FrmTemplate', 'Lab', name);
      if (num > 0) {
        message.error('分组已经创建,名称不能重复');
        return;
      }
      const en = new GroupField();
      en.Lab = name;
      en.FrmID = 'FrmTemplate';
      en.ParentOID = 1;
      await en.Insert();
      return new GPNReturnObj(GPNReturnType.Reload);
    }
    if (btnLab === '选择插入') {
      const frmID = this.RequestVal('FrmID');
      if (!itemIDs) {
        message.error('请选择需要使用的字段模板');
        return;
      }
      const strs = itemIDs.split(',');
      //字段重命名
      if (strs.length == 1) {
        const mapAttr = new MapAttr(itemIDs);
        await mapAttr.Retrieve();
        const name = window.prompt('请输入字段名称', mapAttr.Name);
        if (!name) {
          message.error('请输入字段名称');
          return;
        }

        const keyOfEn = window.prompt('请输入字段编号', mapAttr.KeyOfEn);
        if (!keyOfEn) {
          message.error('请输入字段编号');
          return;
        }
        mapAttr.MyPK = frmID + '_' + keyOfEn;
        if (await mapAttr.IsExits()) {
          message.error('字段[' + keyOfEn + ']已经存在,请重命名');
          return;
        }
        //替换主键、FK_MapData
        mapAttr.KeyOfEn = keyOfEn;
        mapAttr.FK_MapData = frmID;
        mapAttr.MyPK = mapAttr.FK_MapData + '_' + mapAttr.KeyOfEn;
        await mapAttr.Insert();
        //扩展属性
        const mapExts = new MapExts();
        await mapExts.Retrieve('FK_MapData', 'FrmTemplate', 'AttrOfOper', itemIDs.replace('FrmTemplate_', ''));
        const insertQueue = mapExts.map((mapExt) => {
          debugger;
          mapExt.MyPK = mapExt.MyPK.replace(mapExt.FK_MapData, frmID).replace(mapExt.AttrOfOper, keyOfEn);
          mapExt.FK_MapData = frmID;
          mapExt.KeyOfEn = keyOfEn;
          mapExt.Insert();
        });
        await Promise.all(insertQueue);
        message.success('插入成功,关闭刷新');
        return;
      }
      //多个字段不重名，可能会有关联关系，判断是否有重复字段，
      const mypks = "'" + itemIDs.replace(/,/g, "','") + "'";
      const mapAttrs = new MapAttrs();
      const num = await mapAttrs.RetrieveIn('MyPK', mypks.replace(/FrmTemplate/g, frmID));
      if (num != 0) {
        const _this = this;
        Modal.confirm({
          title: '选择的字段在表单中存在重复，是否排除重复字段继续插入?',
          icon: createVNode(ExclamationCircleOutlined),
          okText: '确认',
          cancelText: '取消',
          async onOk() {
            await _this.InsertAttrsToForm(mypks, mapAttrs, true, frmID);
            message.success('插入成功,关闭刷新');
            return;
          },
        });
      } else {
        await this.InsertAttrsToForm(mypks, mapAttrs, false, frmID);
        message.success('插入成功,关闭刷新');
        return;
      }
    }

    if (btnLab === '编辑') {
      const paras = _record?.AtPara;
      const atPara = new AtPara(paras);
      const url = GloComm.UrlEn(atPara.GetValStrByKey('EnName'), _record?.MyPK);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    }

    if (btnLab === '删除') {
      const attr = new MapAttr(_record.MyPK);
      attr.MyPK = _record.MyPK;

      Modal.confirm({
        title: '您确定想删除该字段吗?',
        icon: createVNode(ExclamationCircleOutlined),
        okText: '确认',
        cancelText: '取消',
        async onOk() {
          await attr.Delete();
          return new GPNReturnObj(GPNReturnType.Reload);
        },
      });
    }
  }

  private async InsertAttrsToForm(mypks: string, mapAttrs: MapAttrs, isExit: boolean, frmID: string) {
    const attrs = new MapAttrs();
    await attrs.RetrieveIn('MyPK', mypks);
    const promiseQueue: Promise<string | false>[] = [];

    for (const attr of attrs) {
      const isInsert = !isExit ? true : mapAttrs.find((item) => item.KeyOfEn === attr.KeyOfEn) == null ? true : false;
      if (isInsert) {
        //替换主键、FK_MapData
        attr.FK_MapData = frmID;
        attr.MyPK = attr.FK_MapData + '_' + attr.KeyOfEn;
        promiseQueue.push(attr.Insert());
        //扩展属性
        const mapExts = new MapExts();
        await mapExts.Retrieve('FK_MapData', 'FrmTemplate', 'AttrOfOper', attr.KeyOfEn);
        mapExts.forEach((mapExt) => {
          mapExt.MyPK = mapExt.MyPK.replace(mapExt.FK_MapData, frmID);
          mapExt.FK_MapData = frmID;
          promiseQueue.push(mapExt.Insert());
        });
      }
    }
    await Promise.all(promiseQueue);
  }
}
