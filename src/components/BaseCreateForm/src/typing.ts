import { type Page } from '/@/bp/UIEntity/Page';

export type Item = {
  No: string;
  Name: string;
  Icon: string;
};
export type BaseListData = {
  No: string;
  Name: string;
  Icon: string;
  Help: string;
  children: Item[];
};

export type BaseSelectListData = {
  No: string;
  Name: string;
  children: Item[];
};

// 生成拼音类型
export type PinYinMode = 'full' | 'simple';

// 分步表单
export type StepTypes = {
  title: string;
  page: Page;
};
