import type { Component } from 'vue';
import { PageModelEdit, PageModelNew } from './EnumLab';
import type { Entity } from '/@/bp/en/Entity';

// 页面
export class Page {
  // 编号.
  public No = '';
  // 名称
  public Name = '';
  // 修改页面类型.
  public HisPageModelEdit: PageModelEdit | null = PageModelEdit.SelfComponent;
  // 新建页面类型.
  public HisPageModelNew: PageModelNew | null = PageModelNew.SelfComponent;
  //实体类.
  public HisEntity: Nullable<Entity> = null;
  // 分组编号(只有GroupPage联合才有意义)
  public GroupNo = '';

  //链接
  public Url: string | null = null;
  //图标
  public Icon: string | null = 'icon-drop';
  //描述
  public HelpDocs: string | null = null;
  //组件
  public Component: Component | null = null;
  public ComponentParams: Recordable = {};
  // 参数.
  public Tag0: any | null = null;
  // Tag0是属性的key
  public Tag1: any | null = null;
  // Tag1是placeHolder
  public Tag2: any | null = null;
  public Tag3: any | null = null;
  public Tag4: any | null = null;
  public Tag5: any | null = null;
  public Tag6: any | null = null;
  public BindFunction: string | Function = '';
  public DefaultVal: any | null = null;
  public IsMultiSelect = false;
  public enableSearch = false;
  public labelVisible = false;
  public IsLazily = false;
  // 额外数据
  public ex_params: Recordable = {};
  public Title = '';
}

/// 属性集合
export class Pages extends Array<Page> {
  public Add(pg: Page) {
    this.push(pg);
  }
}
