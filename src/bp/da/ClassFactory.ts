import { Entities } from '../en/Entities';
import { Entity } from '../en/Entity';
import EntityMetaData from 'virtual:entity-metadata';
const modules = import.meta.glob('/src/**/*.ts');

export class ClassFactory {
  public static getTargetClassName(classID: string) {
    if (!classID?.includes('.')) {
      throw new Error('未找到此className:' + classID);
    }
    const lastDot = classID.lastIndexOf('.') + 1;
    return classID.substring(lastDot, classID.length);
  }

  public static async getObject(classID: string, isArray = false) {
    const suffix = isArray ? 's' : '';
    const targetClassName = this.getTargetClassName(classID) + suffix;
    const fileSrc = '/' + EntityMetaData.find((item) => item.classId === classID)?.filePath;
    try {
      let exportedClass: string[] = [];

      const moduleFileLoader = modules[fileSrc];
      if (moduleFileLoader) {
        const dynamicModule = (await moduleFileLoader()) as object;
        if (dynamicModule) {
          const clsModule = dynamicModule[targetClassName];
          if (clsModule) {
            return clsModule;
          }
          exportedClass = Object.getOwnPropertyNames(dynamicModule);
          const errMsg =
            'ClassFactory中未能找到目标类\n请求模块路径为 [' +
            fileSrc +
            ']\n此模块导出的对象为 [' +
            exportedClass +
            ']\n未包含[' +
            targetClassName +
            ']\n请检查是否正确导出[' +
            targetClassName +
            ']';
          console.trace('err: load from disk, fileSrc:', fileSrc);
          alert(errMsg);
          throw new Error(errMsg);
        }
      }
    } catch (e: any) {
      const errMsg = 'ClassFactory加载模块失败 [' + e.toString() + ']\n模块路径 [' + fileSrc + ']';
      console.trace('err: load from disk, fileSrc:', fileSrc);
      alert(errMsg);
      throw new Error(errMsg);
    }
  }

  public static async GetEn(classID: string): Promise<Entity> {
    const obj = await this.getObject(classID, false);
    if (obj) {
      return new obj();
    }
    throw new Error('GetEn没有判断的类名 ClassFactory:' + classID);
  }

  public static async GetEns(classID: string): Promise<Entities> {
    const obj = await this.getObject(classID, true);
    if (obj) {
      return new obj();
    }
    throw new Error('GetEns 没有判断的类名 ClassFactory:' + classID);
  }
  // 参数暂保留，防止兼容问题
  public static async toJSON(_filteredPrefix: string[] = []) {
    return EntityMetaData.map((item) => {
      return {
        No: item.classId,
        Name: item.desc,
        PTable: item.tableName,
      };
    });
  }
}
