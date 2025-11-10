import { dealClassId } from '/@/utils/gener/StringUtils';
import { WaiGuaBaseEntity } from '../../../bp/UIEntity/WaiGuaBaseEntity';

const CLASS_PREFIX = '/WGEntity_';
const allTsInfo = import.meta.glob('/src/App/**/*.ts');
const gpnTsKeys = Object.keys(allTsInfo).filter((key) => key.includes(CLASS_PREFIX));
const modules: Recordable = {};
gpnTsKeys.forEach((key) => {
  modules[key] = allTsInfo[key];
});

// 表单类工厂
export class ClassFactoryOfWaiGuaEntity {
  public static async GetEn(classID: string): Promise<WaiGuaBaseEntity | undefined> {
    // 如果是全路径匹配
    classID = dealClassId(classID, CLASS_PREFIX);
    const fileSrc = gpnTsKeys.find((key) => key.includes(classID + '.ts'));
    if (!fileSrc) {
      return undefined;
    }
    const moduleLoader = modules[fileSrc];
    if (!moduleLoader) {
      throw new Error('WGEntity-GetEn 没有找到文件:' + fileSrc);
    }
    const clsModule = (await moduleLoader()) as object;
    const jsModule = clsModule[classID];
    if (!jsModule) {
      const keys = Object.keys(clsModule);
      const message = `WGEntity-GetEn 文件 [${fileSrc}] 中 没有正确导出名为 ${classID} 的模块，现有模块名为 [${[...keys]}]  请检查`;
      alert(message);
      throw new Error(message);
    }
    return new jsModule();
  }
}
