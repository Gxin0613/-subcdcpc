import { Entity } from '/@/bp/en/Entity';
import { WaiGuaBaseEntity } from '/@/bp/UIEntity/WaiGuaBaseEntity';

// 扩展类的表单规则优先级更高
export const getFormRule = (entity: Entity, enExt: WaiGuaBaseEntity) => {
  const rules = {
    ...entity._enMap._validator,
    ...(enExt?.GetFormRule() || {}),
  };
  if (Object.keys(rules).length == 0) {
    return undefined;
  }
  return rules;
};
