import { PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { dealClassId } from '/@/utils/gener/StringUtils';
import GPNMetadata from 'virtual:gpn-metadata';

const CLASS_PREFIX = '/GPN_';
const allTsInfo = import.meta.glob('/src/**/*.ts');
const gpnTsKeys = Object.keys(allTsInfo).filter((key) => key.includes(CLASS_PREFIX));
const modules: Recordable = {};
gpnTsKeys.forEach((key) => {
  modules[key] = allTsInfo[key];
});

const _en_gpn_map = new Map();

// 表单类工厂
export class ClassFactoryOfGroupPageNew {
  public static async GetEn(classID: string): Promise<PageBaseGroupNew> {
    // 如果是全路径匹配
    classID = dealClassId(classID, CLASS_PREFIX);
    const fileSrc = gpnTsKeys.find((key) => key.includes(classID + '.ts'));
    if (!fileSrc) {
      throw new Error(`没有找到 GPN class - [${classID}]`);
    }
    const moduleLoader = modules[fileSrc];
    if (!moduleLoader) {
      throw new Error('GPN-GetEn 没有找到文件:' + fileSrc);
    }
    const clsModule = (await moduleLoader()) as object;
    const jsModule = clsModule[classID];
    if (!jsModule) {
      const keys = Object.keys(clsModule);
      const message = `GPN-GetEn 文件 [${fileSrc}] 中 没有正确导出名为 ${classID} 的模块，现有模块名为 [${[...keys]}]  请检查`;
      alert(message);
      throw new Error(message);
    }
    return new jsModule();
  }

  public static async GetEnByEntityClassID(entityClassID: string): Promise<Nullable<PageBaseGroupNew>> {
    let targetGPN: Nullable<PageBaseGroupNew> = null;
    if (entityClassID === '') {
      return null;
    }
    if (_en_gpn_map.has(entityClassID)) {
      return _en_gpn_map.get(entityClassID);
    }
    if (Array.isArray(GPNMetadata)) {
      const found = GPNMetadata.find((item) => item.relateEntity === entityClassID);
      if (found) {
        targetGPN = await this.GetEn(found.classId);
        _en_gpn_map.set(entityClassID, targetGPN);
        return targetGPN;
      }
    }
    return null;
  }

  public static async toJSON(filteredPrefix: string[]) {
    const targetClsList = gpnTsKeys
      .map((classID) => dealClassId(classID, CLASS_PREFIX))
      .filter((key) => {
        for (const prefix of filteredPrefix) {
          if (key.startsWith(prefix)) return false;
        }
        return true;
      });
    const queue = targetClsList.map(async (classID) => {
      const clsObj = await this.GetEn(classID);
      return {
        No: classID,
        Name: clsObj.PageTitle + `(${classID})`,
      };
    });
    const res = await Promise.allSettled(queue);
    return JSON.stringify(res.filter((p) => p.status === 'fulfilled').map((r) => r?.value));
  }
}
