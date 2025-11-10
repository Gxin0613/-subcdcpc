import { FormItem } from '../form/FormComponents';
import Entity from '../../dto/Entity';
import BSEntity from '/@/utils/gener/BSEntity';
import BSEntities from '/@/utils/gener/BSEntities';
import { GroupField } from '../../../FrmLogic/GroupField';
import { MapDtl } from '../../../FrmLogic/MapDtl';

// 没什么好办法，先从Entity拿到分组oid才能创建实体类
export async function getGroupFieldData(formId: string, myPk: string) {
  const group = new BSEntities('BP.Sys.GroupFields');
  await group.Retrieve('FrmID', formId, 'CtrlID', myPk);
  // 判断有没有
  const entities = group.getData();
  if (entities.length === 0) {
    return null;
  }
  const OID = entities[0].OID;
  const gf = new BSEntity('BP.Sys.GroupField', OID);
  await gf.Init();
  return gf;
}

// 创建分组字段
export async function createGroupField(target: FormItem, formId: string, index: number, type: string) {
  const gf12 = new GroupField();
  gf12.Lab = target.title;
  gf12.FrmID = formId;
  gf12.Idx = index;
  gf12.CtrlType = type;
  await gf12.DirectInsert();
  const mygf = new BSEntity('BP.Sys.GroupField', gf12.OID.toString());
  await mygf.Retrieve();
  return mygf;
}

// 创建表格附件
export async function createAthTable(target: FormItem, formId: string, index: number) {
  const athTable = new Entity('BP.Sys.FrmAttachment');
  await athTable.Init();
  const pk = `${formId}_${target.id}`;
  athTable.setVal('MyPK', pk);
  athTable.setPK(pk);
  const isExist = await athTable.RetrieveFromDBSources();
  if (isExist) {
    return null;
  }
  athTable.setVal('MyPK', pk);
  athTable.setPK(pk);
  athTable.setVal('NoOfObj', target.id);
  athTable.setVal('FrmID', formId);
  athTable.setVal('FK_MapData', formId);
  athTable.setVal('UploadType', 1);
  athTable.setVal('Name', target.title);
  athTable.setPara('IsShowMobile', 1);
  await athTable.Insert();
  const gf = await getGroupFieldData(formId, athTable.getVal('MyPK'));
  if (!gf) {
    return null;
  }
  gf.setVal('Idx', index);
  await gf.Update();
  return gf;
}

// 创建iframe
export async function createIframe(target: FormItem, formId: string, index: number) {
  const iframeField = new Entity('BP.Sys.MapFrame');
  await iframeField.Init();
  const pk = `${formId}_${target.id}`;
  iframeField.setPK(pk);
  const isExist = await iframeField.RetrieveFromDBSources();
  if (isExist) {
    return null;
  }
  iframeField.setPK(pk);
  iframeField.setVal('FrmID', formId);
  iframeField.setVal('Name', target.title);
  iframeField.setVal('FrameURL', 'MapFrameDefPage.htm');
  iframeField.setVal('H', 200);
  iframeField.setVal('W', 200);
  iframeField.setVal('X', 100);
  iframeField.setVal('Y', 100);
  await iframeField.Insert();
  const gf = await getGroupFieldData(formId, iframeField.getVal('MyPK'));
  if (!gf) {
    return null;
  }
  gf.setVal('Idx', index);
  await gf.Update();
  return gf;
}

// 创建从表， 创建完成之后需要使用intMapAttrs初始化
export async function createSlavaTable_DDD(target: any, formId: string, _index: number) {
  const mapDtl = new MapDtl();
  if (target.id.trim() === '') {
    target.id = 'Dtl1';
  }
  if (target.title.trim() === '') {
    target.title = '从表';
  }

  mapDtl.No = formId + target.id;
  const isExist = await mapDtl.RetrieveFromDBSources();
  if (isExist) {
    return null;
  }

  //执行入库.
  try {
    mapDtl.No = formId + target.id;
    mapDtl.FK_Node = 0;
    mapDtl.PTable = mapDtl.No;
    mapDtl.Name = target.title;
    mapDtl.FrmID = formId;
    mapDtl.FK_MapData = formId;
    mapDtl.H = 300;
    await mapDtl.Insert();

    const gf = new GroupField();
    gf.CtrlType = 'Dtl';
    gf.CtrlID = mapDtl.No;
    gf.Idx = 100;
    await gf.Insert();

    const mygf = new BSEntity('BP.Sys.GroupField');
    mygf.setVal('OID', gf.OID);
    mygf.Retrieve();
    return mygf;
  } catch (e) {
    alert(e);
    return null;
  }
}

// 创建从表， 创建完成之后需要使用intMapAttrs初始化
export async function createSlavaTable(target: any, formId: string, _index: number) {
  const mapDtl = new BSEntity('BP.Sys.MapDtl');
  await mapDtl.Init();
  if (target.id.trim() === '') {
    target.id = 'Dtl1';
  }
  if (target.title.trim() === '') {
    target.title = '从表';
  }
  mapDtl.No = formId + target.id;
  const isExist = await mapDtl.RetrieveFromDBSources();
  if (isExist) {
    return null;
  }
  mapDtl.PTable = mapDtl.No;
  mapDtl.Name = target.title;
  mapDtl.Alias = target.id;
  mapDtl.FK_MapData = formId;
  mapDtl.setPK(mapDtl.No);
  await mapDtl.Insert();
  await mapDtl.DoMethodReturnString('IntMapAttrs');
  //插入从表数据时已经增加从表分组
  // const gf = new GroupField();
  // gf.CtrlType = 'Dtl';
  // gf.CtrlID = mapDtl.No;
  // gf.Idx = 100;
  // await gf.DirectInsert();

  const gfEns = new BSEntities('BP.Sys.GroupFields');
  await gfEns.Retrieve('CtrlID', mapDtl.No, 'FrmID', formId);
  const oid = gfEns.getData()[0].OID;
  const gfEn = new BSEntity('BP.Sys.GroupField', oid);
  await gfEn.Retrieve();
  return gfEn;
}
