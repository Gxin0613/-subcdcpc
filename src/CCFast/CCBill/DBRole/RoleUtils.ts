import { ClassFactory } from '/@/bp/da/ClassFactory';
import { ClassFactoryOfWaiGuaEntity } from '/@/WF/Comm/UIEntity/ClassFactoryOfWaiGuaEntity';

export async function createMethodsGroup(classID: string) {
  const en = await ClassFactory.GetEn(classID);
  const groups = Array.from(new Set(en._enMap.rms.map((rm) => rm.GroupName))).map((groupName) => {
    return {
      No: groupName,
      Name: groupName,
    };
  });
  const allGroups = [...groups, { No: '外挂行内方法', Name: '外挂行内方法' }, { No: '外挂工具栏方法', Name: '外挂工具栏方法' }];
  return JSON.stringify(allGroups);
}

export async function createMethods(entityID: string) {
  const en = await ClassFactory.GetEn(entityID);
  const method = en._enMap.rms.map((rm) => {
    return {
      Name: rm.Title,
      No: rm.Title,
      GroupNo: rm.GroupName,
    };
  });
  // 加载外挂
  const extEn = await ClassFactoryOfWaiGuaEntity.GetEn(('WGEntity_' + entityID.substring(entityID.lastIndexOf('.') + 1)) as string);
  const extMethodOptions = extEn?.SearchOptBtns;
  let extMethodStr = '';
  if (typeof extMethodOptions === 'function') {
    extMethodStr = await extMethodOptions({});
  } else if (typeof extMethodOptions === 'string') {
    extMethodStr = extMethodOptions;
  }
  if (!extMethodStr) extMethodStr = '';
  const extRowFunctions = extMethodStr
    .split(',')
    .filter((item) => item.trim().length > 0)
    .map((item) => {
      return {
        Name: item,
        No: item,
        GroupNo: '外挂行内方法',
      };
    });
  const toolbarFunctions =
    extEn?.SearchToolbarBtns?.split(',')
      .filter((item) => item.trim().length > 0)
      .map((item) => {
        return {
          Name: item,
          No: item,
          GroupNo: '外挂工具栏方法',
        };
      }) || [];

  const allMethods = [...method, ...toolbarFunctions, ...extRowFunctions];
  //如何获取该实体的EnMap的 KeyOfEn, Name 两个属性生成json.返回过去.
  return JSON.stringify(allMethods);
}
