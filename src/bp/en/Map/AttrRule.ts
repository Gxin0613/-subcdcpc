// types/validator.ts
import { Rule } from 'ant-design-vue/es/form';

// 扩展原有的 Rule 类型
export interface ExtendedRule extends Omit<Rule, 'validator'> {
  validator?: (rule: any, value: any, callback: any, rowData?: any) => Promise<void> | void;
}

// 定义扩展的规则集合类型
export type ExtendedRules = Record<string, ExtendedRule[]>;
