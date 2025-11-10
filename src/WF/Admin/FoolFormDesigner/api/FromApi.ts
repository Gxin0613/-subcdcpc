import request from '/@form/utils/Request';
import { MapAttr } from '/@form/props/database/FormInfo';
import { REQUEST_URL, RICH_TEXT_URL } from '/@form/config/EnvProperties';
import { ClassFactory } from '/@/bp/da/ClassFactory';
import BSEntity from '/@/utils/gener/BSEntity';
import { MapAttr as MapAttrCls } from '../../FrmLogic/MapAttrs/MapAttr';
import { MapExts } from '../../FrmLogic/MapExt';
import WebUser from '/@/bp/web/WebUser';
import { DataType } from '/@/bp/en/DataType';

//类型.
// 获取枚举值
export function getEnums(EnumKey: string) {
  return request.post<null, Array<any>>(REQUEST_URL, null, {
    params: {
      DoType: 'Entities_Init',
      EnsName: 'BP.Sys.SysEnums',
      Paras: `@OrgNo=${WebUser.OrgNo}@EnumKey=${EnumKey}@OrderBy=IntKey`,
      t: Date.now(),
    },
  });
}

export function getHtml(key: string) {
  return request.get<null, string>(`${RICH_TEXT_URL}/${key}.htm?t=${Date.now()}`);
}

export function getSlaveTableInfo(pk: string, orderKey: string) {
  return request.post<null, Array<MapAttr>>(REQUEST_URL, null, {
    params: {
      DoType: 'Entities_Init',
      EnsName: 'BP.Sys.MapAttrs',
      Paras: `@FK_MapData=${pk}@OrderBy=${orderKey}`,
      t: Date.now(),
    },
  });
}

export function updateTableColumnsSort(pk: string, formData: FormData) {
  return request.post(REQUEST_URL, formData, {
    params: {
      DoType: 'Entity_DoMethodReturnString',
      EnName: 'BP.Sys.MapDtl',
      PKVal: pk,
      MethodName: 'ChangeMapAttrIdx',
      t: Date.now(),
    },
  });
}

export function updateContainerComponentsSort(formData: FormData) {
  return request.post(REQUEST_URL, formData, {
    params: {
      DoType: 'HttpHandler',
      DoMethod: 'Designer_Move',
      HttpHandlerName: 'BP.WF.HttpHandler.WF_Admin_FoolFormDesigner',
      t: Math.random(),
    },
  });
}

// 更新
export function updateGroupComponentSort(formData: FormData) {
  return request.post(REQUEST_URL, formData, {
    params: {
      DoType: 'HttpHandler',
      DoMethod: 'DesignerVue_GF_Move',
      HttpHandlerName: 'BP.WF.HttpHandler.WF_Admin_FoolFormDesigner',
      t: Math.random(),
    },
  });
}

export async function deleteComponent(reqParams: { [propName: string]: string }) {
//  debugger;
  // if ( reqParams.PKVal===null )
  //针对从表特殊判断.
  if (reqParams.EnName.includes('MapDtl')) {
    const en = new BSEntity('BP.Sys.MapDtl');
    en.No = reqParams.PKVal;
    await en.RetrieveFromDBSources();
    await en.Delete();
    return Promise.resolve();
  }

  let keyOfEn = '';
  //通用删除方法.
  try {
    if (reqParams.EnName.startsWith('TS.')) {
      const en = await ClassFactory.GetEn(reqParams.EnName);
      let pkVal = reqParams.PKVal;
      if (pkVal == null) pkVal = reqParams.MyPK;
      if (pkVal == null) pkVal = reqParams.No;
      if (pkVal == null) pkVal = reqParams.NodeID;
      if (pkVal == null) pkVal = reqParams.OID;
      en.setPKVal(pkVal);
      await en.RetrieveFromDBSources();
      keyOfEn = en.KeyOfEn;
      await en.Delete();
    }
    const mapAttr = new MapAttrCls(reqParams.PKVal);
    await mapAttr.RetrieveFromDBSources();
    if (keyOfEn === '') {
      keyOfEn = mapAttr.KeyOfEn;
    }
    await mapAttr.Delete();
  } catch (e: any) {
    console.error('此组件已删除: msg - ' + e.toString());
  }
  try {
    const mapAttr = new MapExts();
    await mapAttr.Delete('FK_MapData', reqParams.FrmID, 'AttrOfOper', keyOfEn);
  } catch (e: any) {
    console.error('扩展类已删除: msg - ' + e.toString());
  }
  return Promise.resolve();
}

export function webUserInit(token: string) {
  return request.post<null, string>(
    REQUEST_URL,
    {},
    {
      params: {
        DoType: 'WebUser_Init',
        Token: token,
        t: Date.now(),
      },
    },
  );
}

/**
 * @description 获取文本框后置提示 zsy 2024.2.22
 * @param str 文本描述
 */
export function GenerStuFix(str: string) {
  if (str.includes('费') == false) return DataType.AppMoney;
  if (str.includes('时间') == true) return DataType.AppDateTime;
  if (str.includes('日期') == true) return DataType.AppDate;
  if (str.includes('长度') || str.includes('身高')) return DataType.AppInt;

  return DataType.AppString;
}

export function GenerAppInt() {
  const json = ['xxx', 'xxx'];
  return json;
}
