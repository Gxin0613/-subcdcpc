import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { dealClassId } from '/@/utils/gener/StringUtils';
const CLASS_PREFIX = '/GPE_';
const allTsInfo = import.meta.glob('/src/**/*.ts');
const gpeTsKeys = Object.keys(allTsInfo).filter((key) => key.includes(CLASS_PREFIX));
const modules: Recordable = {};
gpeTsKeys.forEach((key) => {
  modules[key] = allTsInfo[key];
});

export class ClassFactoryOfGroupPageBaseEdit {
  public static async GetEn(classID: string): Promise<PageBaseGroupEdit> {
    const fileSrc = gpeTsKeys.find((key) => key.includes(classID + '.ts'));
    if (!fileSrc) {
      throw new Error(`没有找到 GPE class - [${classID}]`);
    }
    const moduleLoader = modules[fileSrc];
    if (!moduleLoader) {
      throw new Error('GPE-GetEn没有找到文件:' + fileSrc);
    }
    const clsModule = (await moduleLoader()) as object;
    const jsModule = clsModule[classID];
    if (!jsModule) {
      const keys = Object.keys(clsModule);
      const message = `GPE-GetEn 文件 [${fileSrc}] 中 没有正确导出名为 ${classID} 的模块，现有模块名为 [${[...keys]}]  请检查`;
      alert(message);
      throw new Error(message);
    }
    return new jsModule();
  }

  public static async toJSON(filteredPrefix: string[]) {
    const targetClsList = gpeTsKeys
      .map((path) => dealClassId(path, CLASS_PREFIX))
      .filter((key) => {
        for (const prefix of filteredPrefix) {
          if (key.startsWith(prefix)) return false;
        }
        return true;
      });
    const queue = targetClsList.map(async (item) => {
      const clsObj = await this.GetEn(item);
      return {
        No: item,
        Name: clsObj.PageTitle + `(${item})`,
      };
    });
    const res = await Promise.allSettled(queue);
    return JSON.stringify(res.filter((p) => p.status === 'fulfilled').map((r) => r?.value));
  }
}
