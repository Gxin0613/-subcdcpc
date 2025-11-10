import { message } from 'ant-design-vue';
import DBAccess from '/@/utils/gener/DBAccess';
import { SFTable } from '/@/WF/Admin/FrmLogic/SFTable/SFTable';

export function useDBSourceLoader() {
  const getDBSource = async (target: string, DBSrc = 'local', paras = '') => {
    try {
      return Promise.resolve(JSON.parse(target));
    } catch (e) {
      try {
        if (typeof target === 'string' && target.startsWith('SQL_')) {
          const sfTable = new SFTable(target);
          const data = await sfTable.GenerData();
          if (Array.isArray(data) && data.length > 0) {
            return data;
          }
          return [];
        }

        const res = await DBAccess.RunSQLReturnTable(target, DBSrc, paras);
        if (Array.isArray(res) && res.length == 0) return res;
        if (Array.isArray(res) && res.length > 0) {
          const keys = Object.keys(res[0]);
          for (const item of res) {
            for (const key of keys) {
              item[key] += '';
            }
          }
          return res;
        }
        if (typeof res === 'object') {
          const keys = Object.keys(res);
          for (const key of keys) {
            res[key] += '';
          }
          return [res];
        }
        return [];
      } catch (ex) {
        message.error(ex as string);
        return [];
      }
    }
  };

  return {
    getDBSource,
  };
}
