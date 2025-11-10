import { TabsBase } from '/@/bp/UIEntity/TabsBase';
import { dealClassId } from '/@/utils/gener/StringUtils';

const CLASS_PREFIX = '/Tabs_';
const allTsInfo = import.meta.glob('/src/**/*.ts');
const tabsTSKeys = Object.keys(allTsInfo).filter((key) => key.includes(CLASS_PREFIX));
const modules: Recordable = {};
tabsTSKeys.forEach((key) => {
  modules[key] = allTsInfo[key];
});

export class ClassFactoryOfTabs {
  public static async GetEn(classID: string): Promise<TabsBase> {
    // 如果是全路径匹配
    classID = dealClassId(classID, CLASS_PREFIX);
    const fileSrc = tabsTSKeys.find((key) => key.includes(classID + '.ts'));
    if (!fileSrc) {
      throw new Error(`没有找到 Tabs class - [${classID}]`);
    }
    const moduleLoader = modules[fileSrc];
    if (!moduleLoader) {
      throw new Error('Tabs-GetEn 没有找到文件:' + fileSrc);
    }
    const clsModule = (await moduleLoader()) as object;
    const jsModule = clsModule[classID];
    if (!jsModule) {
      const keys = Object.keys(clsModule);
      const message = `Tabs-GetEn 文件 [${fileSrc}] 中 没有正确导出名为 ${classID} 的模块，现有模块名为 [${[...keys]}]  请检查`;
      alert(message);
      throw new Error(message);
    }
    return new jsModule();
  }

  public static async toJSON(filteredPrefix: string[] = []) {
    const targetClsList = tabsTSKeys
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
