// 创建表格附件
import { FormItem } from '../form/FormComponents';
import Entities from '../../dto/Entities';
import Entity from '../../dto/Entity';
import { fieldType } from '../database/DatabaseFormItem';
import { UIContralType } from '/@/bp/en/EnumLab';
import HttpHandler from '/@/utils/gener/HttpHandler';

// 创建基础字段
async function createBasicField(target: FormItem, formId: string, index: number) {
  const entity = new Entity('BP.Sys.MapAttr');
  const PK = `${formId}_${target.id}`;
  entity.setPK(PK);
  if (await entity.RetrieveFromDBSources()) {
    return null;
  }
  const attr = entity.getData();
  attr.KeyOfEn = target.id;
  attr.MyDataType = fieldType.get(target.key);
  attr.GroupID = target.groupId;
  attr.Idx = index;
  attr.MyPK = PK;
  attr.FrmID = formId;
  attr.FK_MapData = formId;
  return entity;
}

/**
 *   [1, "text"],
 *   [2, "integer"],
 *   [8, "amount"],
 *   [3, "number"],
 *   [6, "date"],
 *   [7, "datetime"],
 *   [4, "checkbox"]
 * @param target
 * @param formId
 * @param index
 */
// 创建文本
export async function createBasicTextField(target: FormItem, formId: string, index: number) {
  const entity = await createBasicField(target, formId, index);
  if (!entity) return null;
  const attr = entity.getData();
  attr.Name = target.title || `文字_${attr.KeyOfEn}`;
  attr.MaxLen = 50;
  attr.MinLen = 0;
  attr.DefValType = 1;
  await GenerEndLabIcon(entity, 1);
  await entity.Insert();
  return entity;
}

// 创建文本Big
export async function createBasicTextFieldBig(target: FormItem, formId: string, index: number, UIHeight = 200) {
  const entity = await createBasicField(target, formId, index);
  if (!entity) return null;
  const attr = entity.getData();
  attr.Name = target.title || `文字_${attr.KeyOfEn}`;
  attr.MaxLen = 3000;
  attr.MinLen = 0;
  attr.DefValType = 1;
  attr.ColSpan = 4;
  attr.UIHeight = UIHeight;
  attr.TextModel = 3;
  // attr.IsSupperText = 1;
  await entity.Insert();
  return entity;
}

/**
 * @description 创建字段后处理赋值后缀提示 zsy 2024.2.23
 * @param ParentOID 实体
 */
async function GenerEndLabIcon(entity: Entity, mydataType) {
  try {
    const httphandler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
    httphandler.AddPara('name', entity.getData().Name);
    const data = await httphandler.DoMethodReturnJson<Recordable[]>('FrmAPI_GenerFieldEndInfo');
    if (Array.isArray(data) && data.length > 0) {
      entity.setVal('Tip', data[0].tip);
      entity.setVal('ICON', data[0].icon);
      if (mydataType !== 1) entity.setPara('suffix', data[0].unitEndLabName); // 后缀
    }
  } catch (error) {
    console.log(error);
  }
}

// 创建签批组件
export async function createSignCheck(target: FormItem, formId: string, index: number) {
  const field = await createBaseControlField(target, formId, index);
  if (!field) return null;
  const attr = field?.getData();
  attr.UIContralType = 14;
  await GenerEndLabIcon(field, 1);
  await field.Insert();
  return field;
}

// 创建整数型
export async function createBasicIntegerField(target: FormItem, formId: string, index: number) {
  const entity = await createBasicField(target, formId, index);
  if (!entity) return null;
  const attr = entity.getData();

  attr.Name = target.title || `整形_${attr.KeyOfEn}`;
  attr.DefValType = 1;
  await GenerEndLabIcon(entity, 2);
  await entity.Insert();
  return entity;
}

// 创建数字型
export async function createBasicNumberField(target: FormItem, formId: string, index: number) {
  const entity = await createBasicField(target, formId, index);
  if (!entity) return null;
  const attr = entity.getData();
  attr.Name = target.title || `浮点_${attr.KeyOfEn}`;
  attr.DefValType = 1;
  await GenerEndLabIcon(entity, 3);

  await entity.Insert();
  return entity;
}

// 创建布尔型
export async function createBasicBooleanField(target: FormItem, formId: string, index: number) {
  const entity = await createBasicField(target, formId, index);
  if (!entity) return null;
  const attr = entity.getData();
  attr.Name = target.title || `开关_${attr.KeyOfEn}`;
  attr.UIContralType = 2;
  attr.DefValType = 1;
  await GenerEndLabIcon(entity, 4);

  await entity.Insert();
  return entity;
}

// 创建金额型
export async function createBasicAmountField(target: FormItem, formId: string, index: number) {
  const entity = await createBasicField(target, formId, index);
  if (!entity) return null;
  const attr = entity.getData();
  attr.Name = target.title || `金额_${attr.KeyOfEn}`;
  attr.DefValType = 1;
  await GenerEndLabIcon(entity, 8);

  await entity.Insert();
  return entity;
}

// 创建日期型
export async function createBasicDateField(target: FormItem, formId: string, index: number) {
  const entity = await createBasicField(target, formId, index);
  if (!entity) return null;
  const attr = entity.getData();
  attr.Name = target.title || `日期_${attr.KeyOfEn}`;
  attr.DefValType = 6;
  attr.IsSupperText = 0; //日期格式.

  await entity.Insert();
  return entity;
}

// 创建日期时间型
export async function createBasicDatetimeField(target: FormItem, formId: string, index: number) {
  const entity = await createBasicField(target, formId, index);
  if (!entity) return null;
  const attr = entity.getData();
  attr.Name = target.title || `时间_${attr.KeyOfEn}`;
  attr.DefValType = 7;
  attr.IsSupperText = 2; //日期格式.
  await entity.Insert();
  return entity;
}

// 检查是否存在
async function checkExist(...args: Array<string>) {
  const entities = new Entities('BP.Sys.MapAttrs');
  await entities.Retrieve(...args);
  return !entities.isEmpty();
}

// 创建一个基本的附件字段，其余的无非是参数不同
async function createBaseControlField(target: FormItem, formId: string, index: number) {
  const pk = formId + target.id;
  if (await checkExist('FrmID', formId, 'Name', pk)) return null;
  const baseControlField = new Entity('BP.Sys.MapAttr');
  await baseControlField.Init();
  baseControlField.setPK(pk);
  const isExist = await baseControlField.RetrieveFromDBSources();
  if (isExist) return null;
  const attr = baseControlField.getData();
  attr.FrmID = formId;
  attr.FK_MapData = formId;
  attr.KeyOfEn = target.id;
  attr.Name = target.title || `控件_${target.id}`;
  attr.GroupID = target.groupId;
  attr.MyDataType = 1;
  attr.LGType = 0;
  attr.ColSpan = 1;
  attr.LabelColSpan = 1;
  attr.UIWidth = 150;
  attr.UIHeight = 170;
  attr.IsEnableInAPP = 0;
  attr.Idx = index;
  return baseControlField;
}

// 附件字段
export async function createAthField(target: FormItem, formId: string, index: number) {
  const field = await createBaseControlField(target, formId, index);
  if (!field) return null;
  const attr = field.getData();
  attr.UIContralType = 6;
  await field?.Insert();
  // 附件字段需要额外创建一个表单附件实体
  const athEntity = new Entity('BP.Sys.FrmAttachment');
  await athEntity.Init();
  const data = athEntity.getData();
  data.MyPK = `${formId}_${attr.KeyOfEn}`;
  data.FrmID = formId;
  data.FK_MapData = formId;
  data.NoOfObj = attr.KeyOfEn; // 从前一个实体拿到id
  data.GroupID = target.groupId;
  data.Name = attr.Name; // 从前一个实体拿到姓名
  data.UploadType = 1; //表格附件..
  data.IsVisable = 0;
  await athEntity.Insert(); //插入到数据库.
  return field;
}

// 创建附件图片
export async function createImgAth(target: FormItem, formId: string, index: number) {
  const field = await createBaseControlField(target, formId, index);
  if (!field) return null;
  const attr = field?.getData();
  attr.UIContralType = 12;
  delete attr.IsEnableInAPP;
  await field.Insert();
  await field.RetrieveFromDBSources();
  const entity = new Entity('TS.FrmUI.FrmImgAth');
  await entity.Init();
  const data = entity.getData();
  data.MyPK = `${formId}_${attr.KeyOfEn}`;
  data.FrmID = formId;
  data.FK_MapData = formId;
  data.CtrlID = attr.KeyOfEn;
  data.Name = attr.Name;
  data.GroupID = target.groupId;
  await entity.Insert();
  return field;
}

// 创建公文组件
export async function createGovDoc(target: FormItem, formId: string, index: number) {
  const field = await createBaseControlField(target, formId, index);
  if (!field) return null;
  const attr = field?.getData();
  attr.UIContralType = 110;
  attr.MyPK = `${formId}_${attr.KeyOfEn}`;
  await field.Insert();
  return field;
}

// 创建手写板
export async function createHandWriting(target: FormItem, formId: string, index: number) {
  const field = await createBaseControlField(target, formId, index);
  if (!field) return null;
  const attr = field?.getData();
  attr.UIContralType = 8;
  attr.MyPK = `${formId}_${attr.KeyOfEn}`;
  await field.Insert();
  return field;
}

// 创建按钮
export async function createButton(target: FormItem, formId: string, index: number) {
  const field = await createBaseControlField(target, formId, index);
  if (!field) return null;
  const attr = field?.getData();
  attr.UIContralType = 18;
  attr.ColSpan = 0;
  delete attr.KeyOfEn;
  await field.Insert();
  return field;
}

// 创建链接
export async function createLink(target: FormItem, formId: string, index: number) {
  const field = await createBaseControlField(target, formId, index);
  if (!field) return null;
  const attr = field?.getData();
  attr.UIHeight = 23;
  attr.UIContralType = 9;
  attr.Tag1 = '_blank';
  attr.Tag2 = 'https://gitee.com/opencc';
  await field.Insert();
  return field;
}

// 创建评分
export async function createScore(target: FormItem, formId: string, index: number) {
  const field = await createBaseControlField(target, formId, index);
  if (!field) return null;
  const attr = field?.getData();
  attr.UIContralType = 101;
  attr.Tag2 = 5;
  // todo 这里好像忘记解析了
  await field.Insert();
  return field;
}

// 创建地图
export async function createMap(target: FormItem, formId: string, index: number) {
  const field = await createBaseControlField(target, formId, index);
  if (!field) return null;
  const attr = field?.getData();
  attr.UIContralType = 4;
  attr.UIWidth = 800;
  attr.UIHeight = 500;
  await field.Insert();

  const mapEntity = new Entity('BP.Sys.MapAttr');
  await mapEntity.Init();
  const mapAttr = mapEntity.getData();
  mapAttr.UIContralType = 0;
  mapAttr.MyPK = formId + '_AtPara';
  mapAttr.FrmID = formId;
  mapAttr.FK_MapData = formId;
  mapAttr.KeyOfEn = 'AtPara';
  mapAttr.UIVisible = 0;
  mapAttr.Name = 'AtPara';
  mapAttr.MyDataType = 1;
  mapAttr.LGType = 0;
  mapAttr.ColSpan = 1; //
  mapAttr.UIWidth = 100;
  mapAttr.UIHeight = 23;
  await mapEntity.Insert(); //插入字段
  return field;
}

// 创建定位
export async function createLocate(target: FormItem, formId: string, index: number) {
  const mapEntity = new Entity('TS.FrmUI.MapAttrFixed', formId + '_Fixed');
  if (!(await mapEntity.RetrieveFromDBSources())) {
    const mapAttr = mapEntity.getData();
    mapAttr.frmID = formId;
    mapAttr.KeyOfEn = 'Fixed';
    mapAttr.Name = '系统定位';
    mapAttr.GroupID = target.groupId;
    mapAttr.UIContralType = 16; //系统定位
    mapAttr.MyDataType = 1;
    mapAttr.ColSpan = 1;
    mapAttr.LabelColSpan = 1;
    mapAttr.LGType = 0; //文本
    mapAttr.UIIsEnable = 0; //不可编辑
    mapAttr.UIIsInput = 0;
    mapAttr.UIWidth = 150;
    mapAttr.UIHeight = 23;
    mapAttr.Idx = index;
    await mapEntity.Insert(); //插入字段.
    return mapEntity;
  } else {
    return null;
  }
}

// 创建进度
export async function createExecJob(target: FormItem, formId: string) {
  const name = '流程进度图';
  const id = 'JobSchedule';
  const myPK = formId + '_' + id;
  const mapEntity = new Entity('BP.Sys.MapAttr', myPK);
  if (await mapEntity.RetrieveFromDBSources()) {
    return null;
  }
  const mapAttr = mapEntity.getData();
  mapAttr.UIContralType = 50; //流程进度图.
  mapAttr.MyPK = myPK;
  mapAttr.FrmID = formId;
  mapAttr.FK_MapData = formId;
  mapAttr.KeyOfEn = id;
  mapAttr.Name = name;
  mapAttr.GroupID = target.groupId;
  mapAttr.MyDataType = 1;
  mapAttr.LGType = 0;
  mapAttr.ColSpan = 4; //
  mapAttr.UIWidth = 0;
  mapAttr.UIHeight = 100;
  mapAttr.Idx = 0;
  await mapEntity.Insert(); //插入字段.
  return mapEntity;
}

// 创建大块html说明
export async function createHTML(target: FormItem, formId: string, index: number) {
  const field = await createBaseControlField(target, formId, index);
  if (!field) return null;
  const attr = field?.getData();
  field.setPara('EnName', 'TS.FrmUI.SelfCommonent.FrmHtml');
  attr.UIContralType = 60;
  await field.Insert();
  return field;
}

// 创建大块html说明
export async function createUniversalImg(target: FormItem, formId: string, index: number) {
  const field = await createBaseControlField(target, formId, index);
  if (!field) return null;
  const attr = field?.getData();
  attr.UIContralType = UIContralType.FrmImg;
  await field.Insert();
  return field;
}

export async function createIDCardFields(target: FormItem, formId: string, index: number) {
  const callbackEns: Array<Entity | string> = [];
  const fields = [
    { No: 'IDCardName', Name: '姓名' },
    { No: 'IDCardNo', Name: '身份证号' },
    { No: 'IDCardAddress', Name: '地址' },
  ];
  for (const item of fields) {
    const entity = new Entity('BP.Sys.MapAttr');
    entity.setPK(`${formId}_${item.No}`);
    // 如果从数据库查到数据了
    if (!(await entity.RetrieveFromDBSources())) {
      const mapAttr = entity.getData();
      mapAttr.FrmID = formId;
      mapAttr.FK_MapData = formId;
      mapAttr.KeyOfEn = item.No;
      mapAttr.Name = item.Name;
      mapAttr.GroupID = target.groupId;
      mapAttr.UIContralType = 13; //身份证号.
      mapAttr.MyDataType = 1;
      mapAttr.ColSpan = item.No == 'IDCardAddress' ? 3 : 1;
      mapAttr.LabelColSpan = 1;
      mapAttr.LGType = 0; //文本
      mapAttr.UIIsEnable = 0; //不可编辑
      mapAttr.UIIsInput = 1; //必填
      mapAttr.UIWidth = 150;
      mapAttr.UIHeight = 23;
      mapAttr.Idx = index;
      await entity.Insert();
      callbackEns.push(entity);
      // 如果没有查到
    } else {
      callbackEns.push('字段' + item.No + '已存在，请变更表单中的' + entity.getData().Name + '的编号');
    }
  }
  return callbackEns;
}
