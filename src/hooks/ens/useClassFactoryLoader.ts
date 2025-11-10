export interface ClassFactoryBase {
  GetEn: Function;
  GetEns: Function;
  toJSON: Function;
}

const factories = new Map<string, any>([
  ['ClassFactory', import('/@/bp/da/ClassFactory')],
  ['ClassFactoryOfTabs', import('/@/WF/Comm/UIEntity/ClassFactoryOfTabs')],
  ['ClassFactoryOfRpt2D', import('/@/WF/Comm/UIEntity/ClassFactoryOfRpt2D')],
  ['ClassFactoryOfRpt3D', import('/@/WF/Comm/UIEntity/ClassFactoryOfRpt3D')],

  ['ClassFactoryOfPageBaseTreeEns', import('/@/WF/Comm/UIEntity/ClassFactoryOfPageBaseTreeEns')],
  ['ClassFactoryOfGenerList', import('/@/WF/GenerList/ClassFactoryOfGenerList')],
  ['ClassFactoryOfPanelGroup', import('/@/WF/Comm/UIEntity/ClassFactoryOfPanelGroup')],
  ['ClassFactoryOfGroupPageNew', import('/@/WF/Comm/UIEntity/ClassFactoryOfGroupPageNew')],
  ['ClassFactoryOfDataV', import('/@/WF/Comm/UIEntity/ClassFactoryOfDataV')],
]);

export function useClassFactoryLoader(factoryName: string): Promise<ClassFactoryBase> {
  const asyncImport = factories.get(factoryName);
  if (!asyncImport) throw new Error('请检查classFactory名称是否存在');
  return new Promise((resolve, reject) => {
    asyncImport
      .then((module) => {
        resolve(module[factoryName]);
      })
      .catch((e) => {
        reject(e);
      });
  });
  // return asyncImport;
}
