import { ClassFactory } from '/@/bp/da/ClassFactory';
import { DataType } from '/@/bp/en/DataType';
import { Entity } from '/@/bp/en/Entity';
import { FieldType, UIContralType } from '/@/bp/en/EnumLab';
import { Attr } from '/@/bp/en/Map/Attr';
import { SysEnums } from '/@/WF/Admin/FrmLogic/SysEnum/SysEnum';
import { splitAtString } from '/@/bp/tools/ParamUtils';
import { useTreeConvert } from '/@/hooks/ens/useDataConvert';
import { SFTable } from '/@/WF/Admin/FrmLogic/SFTable/SFTable';
import { DataBankBase } from '/@/bp/UIEntity/DataBankBase';
import DBAccess from '/@/utils/gener/DBAccess';
// import { SFTable } from '/@/WF/Admin/FrmLogic/SFTable/SFTable';
// import BSEntity from '/@/utils/gener/BSEntity';
// import { GloWF } from '/@/WF/Admin/GloWF';
// import DBAccess from '/@/utils/gener/DBAccess';

export interface callbackOption {
  label: string;
  value: any;
}

export function parseValByType(dataType: DataType, val: any) {
  if (dataType === DataType.AppInt) return parseInt(val);
  if (dataType === DataType.AppFloat || dataType === DataType.AppDouble) return parseFloat(val);
  return val;
}

export function useDDLDataLoader(entityRef: Entity) {
  const getDDLData = async (attr: Attr, row?: Recordable): Promise<callbackOption[]> => {
    const { UIBindKey, UITag, Key } = attr;
    // 如果是API接口
    // if(UIBindKey) {
    //   const table=new SFTable();
    //   table.No = UIBindKey;
    //   table.Retrieve();
    //   await table.GenerData();
    // }
    // 如果是SQL
    const isMapObject = row instanceof Map;
    if (typeof UIBindKey === 'string' && UIBindKey.startsWith('SQL_')) {
      const sfTable = new SFTable(UIBindKey);
      const data = await sfTable.GenerData();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item) => {
          return {
            value: item.No || item.MyPK || item.WorkID || item.OID,
            label: item.Name,
            text: item.Name,
          };
        });
      }
      return [];
    }
    if (
      typeof UIBindKey === 'string' &&
      (UIBindKey.startsWith('Port_') ||
        UIBindKey.startsWith('Flow_') ||
        UIBindKey.startsWith('Frm_') ||
        UIBindKey.startsWith('DBSrc_') ||
        UIBindKey.startsWith('DemoStudent_') ||
        UIBindKey.startsWith('App_') ||
        UIBindKey.startsWith('Ens://') ||
        UIBindKey.startsWith('En://') ||
        UIBindKey.toLowerCase().startsWith('handler://'))
    ) {
      const mark = UIBindKey;
      let paras = '';
      if (!!row) {
        let keys = Object.keys(row);
        if (keys.length === 0) keys = Object.keys(Object.fromEntries(row));
        for (const key of keys) {
          // paras += '@'+key+'='+(row[key] || row.get(key));
          paras += '@' + key + '=' + (row instanceof Map ? (row.has(key) ? row.get(key) : '') : !!row[key] ? row[key] : '');
        }
      }

      const data = await DBAccess.RunSQLReturnTable(mark, 'local', paras);
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item) => {
          return {
            value: item.No.toString() || item.MyPK || item.WorkID || item.OID,
            label: item.Name,
            text: item.Name,
          };
        });
      }
      return [];
    }
    if (typeof UIBindKey === 'string' && UIBindKey.startsWith('DBSrc.')) {
      let mark = UIBindKey;
      if (!!row) {
        let keys = Object.keys(row);
        if (keys.length === 0) keys = Object.keys(Object.fromEntries(row));
        for (const key of keys) {
          mark = mark.replace(/'@'+key/g, row[key] || row.get(key));
        }
      }
      const data = await DataBankBase.GenerStringByMarkID(mark);
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item) => {
          return {
            value: item.No || item.MyPK || item.WorkID || item.OID,
            label: item.Name,
            text: item.Name,
          };
        });
      }
      return [];
    }

    if (UIBindKey?.trim().substring(0, 6).toLowerCase() === 'select') {
      const data = await entityRef?.GenerSQLAttrDB(Key, row);
      if (Array.isArray(data) && data.length > 0) {
        const keys = Object.keys(data[0]);
        const pKey = keys.find((key) => key.toLowerCase() == 'parentno');
        if (Array.isArray(data)) {
          if (pKey) {
            const { listToTree } = useTreeConvert();
            data.forEach((item) => {
              item.label = item.Name;
              item.value = item.No;
              item.text = item.Name;
              item.ParentNo = item[pKey];
            });
            const list = listToTree('0', data, false);
            return list as any;
          }
          return data.map((item) => {
            return {
              value: parseValByType(attr.MyDataType, item.No),
              label: item.Name,
              text: item.Name,
            };
          });
        }
        return [];
      }
    }

    // 如果是外部数据源.

    // if (attr.LGType == 0 && attr.UIContralType === UIContralType.DDL) {
    //   const sfTable = new SFTable(attr.UIBindKey);
    //   // sfTable.SelectStatement

    //   const dictEn = new BSEntity('BP.Sys.SFTable', attr.UIBindKey);
    //   const data = await dictEn.DoMethodReturnJSON('GenerJson');

    //   const relatedEns = await ClassFactory.GetEns(attr.HisFKEns || '');
    //   if (!relatedEns) return [];
    //   await relatedEns.Init();
    //   await relatedEns.RetrieveAll();
    //   return relatedEns.slice(0, relatedEns.length).map((item) => {
    //     return {
    //       value: parseValByType(attr.MyDataType, item.No),
    //       label: item.Name,
    //       text: item.Name,
    //     };
    //   });
    // }

    // 如果是外键下拉
    if (attr.MyFieldType === FieldType.RefText && attr.UIContralType === UIContralType.DDL) {
      if (attr.UIIsReadonly == true && !!row && isMapObject) {
        return [
          {
            value: row.get(attr.Key),
            label: row.get(attr.Key + 'Text'),
          },
        ];
      } else {
        const relatedEns = await ClassFactory.GetEns(attr.HisFKEns || '');
        if (!relatedEns) return [];
        await relatedEns.Init();
        await relatedEns.RetrieveAll();
        return relatedEns.slice(0, relatedEns.length).map((item) => {
          return {
            value: parseValByType(attr.MyDataType, item.No),
            label: item.Name,
            text: item.Name,
          };
        });
      }
    }

    // 如果是外键下拉
    if (attr.MyFieldType === FieldType.FK && attr.UIContralType === UIContralType.DDL) {
      if (attr.UIIsReadonly && !!row && isMapObject) {
        return [
          {
            value: row.get(attr.Key),
            label: row.get(attr.Key + 'Text') || '',
          },
        ];
      }
      const relatedEns = await ClassFactory.GetEns(attr.HisFKEns || '');
      if (!relatedEns) return [];
      await relatedEns.Init();
      await relatedEns.RetrieveAll();
      return relatedEns.slice(0, relatedEns.length).map((item) => {
        return {
          value: parseValByType(attr.MyDataType, item.No),
          label: item.Name,
          text: item.Name,
        };
      });
    }
    // 如果是枚举下拉
    if (attr.MyFieldType === FieldType.Enum && attr.MyDataType === DataType.AppInt && attr.UIContralType === UIContralType.DDL && !UITag) {
      const enums = new SysEnums();
      await enums.Retrieve('EnumKey', UIBindKey);
      return enums.slice(0, enums.length).map((item) => {
        return {
          value: parseValByType(attr.MyDataType, item.IntKey),
          label: item.Lab,
          text: item.Lab,
        };
      });
    }

    const keys = typeof UITag === 'string' ? splitAtString(UITag) : [];
    const res = keys.map((kv: string) => {
      const [key, val] = kv.split('=');
      return {
        value: parseValByType(attr.MyDataType, key),
        label: val,
        text: val,
      };
    });
    return res;
  };

  return {
    getDDLData,
  };
}
