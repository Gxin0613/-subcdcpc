import Entities from '../dto/Entities';

export function useID() {
  // 查找字段分类
  const getNextId = async (type: string, formId: string) => {
    const entities = new Entities('BP.Sys.MapAttrs', 'FrmID', formId);
    await entities.Init();
    const data = entities.getData();
    const typePrefix = `${formId}_${type}`;
    const newData = data.map((attr) => attr.MyPK).filter((pk) => pk.startsWith(typePrefix));
    if (newData.length === 0) {
      return {
        id: type + 1,
        title: type + 1,
      };
    }
    const serialNumbers =
      Math.max.apply(
        null,
        newData.map((data) => parseInt(data.replace(typePrefix, '')) || 0),
      ) + 1;
    return {
      id: type + serialNumbers,
      title: type + serialNumbers,
    };
  };

  return {
    getNextId,
  };
}
