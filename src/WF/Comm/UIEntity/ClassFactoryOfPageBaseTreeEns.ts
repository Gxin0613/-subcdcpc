import { PageBaseTreeEns } from '/@/bp/UIEntity/PageBaseTreeEns';
import { dealClassId } from '/@/utils/gener/StringUtils';

const CLASS_PREFIX = '/TreeEns_';
const allTsInfo = import.meta.glob('/src/**/*.ts');
const gpnTsKeys = Object.keys(allTsInfo).filter((key) => key.includes(CLASS_PREFIX));
const modules: Recordable = {};
gpnTsKeys.forEach((key) => {
  modules[key] = allTsInfo[key];
});

export class ClassFactoryOfPageBaseTreeEns {
  public static async GetEn(classID: string): Promise<PageBaseTreeEns> {
    // 如果是全路径匹配
    classID = dealClassId(classID, CLASS_PREFIX);
    const fileSrc = gpnTsKeys.find((key) => key.includes(classID + '.ts'));
    if (!fileSrc) {
      throw new Error(`没有找到 TreeEns-class - [${classID}]`);
    }
    const moduleLoader = modules[fileSrc];
    if (!moduleLoader) {
      throw new Error('TreeEns-GetEn 没有找到文件:' + fileSrc);
    }
    const clsModule = (await moduleLoader()) as object;
    const jsModule = clsModule[classID];
    if (!jsModule) {
      const keys = Object.keys(clsModule);
      const message = `TreeEns-GetEn 文件 [${fileSrc}] 中 没有正确导出名为 ${classID} 的模块，现有模块名为 [${[...keys]}]  请检查`;
      alert(message);
      throw new Error(message);
    }
    return new jsModule();
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
