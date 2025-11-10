<template>
  <BasicTable @register="registerTable" />
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { ClassFactoryOfGroupPageNew } from '../UIEntity/ClassFactoryOfGroupPageNew';
  import { ClassFactory } from '/@/bp/da/ClassFactory';
  import { RefMethodType } from '/@/bp/en/Map/RefMethod';
  import { PageModelEdit, PageModelNew } from '/@/bp/UIEntity/EnumLab';
  // import useComponentLoader from '/@/hooks/ens/useComponentLoader';
  import { BasicTable, useTable } from '/@/components/Table';
  import { ClassFactoryOfGroupPageBaseEdit } from '/@/WF/Comm/UIEntity/ClassFactoryOfGroupPageEdit';

  const columns = ref<Array<Record<string, any>>>([]); // 表单列
  const dataSource = ref<Array<Record<string, any>>>([]); // 数据源

  // 列选择
  // const rowSelection = computed(() => {
  //   // const res = props.isSearch ? null : { type: 'checkbox', selectedRowKeys: checkedKeys, onChange: onSelectChange };
  //   // console.log(res);
  //   // return res;
  //   return [];
  // });

  // const drawerInfo = reactive({
  //   visible: false,
  //   title: '',
  //   url: '',
  //   component: {},
  // });

  // 处理右侧抽屉
  // const { loadComponent } = useComponentLoader();
  // 双击
  // const handleRowDbClick = (record: Recordable) => {
  //   const editUrl = '/src/WF/Comm/En.vue?EnName=TS.Port.Emp&PKVal=' + record.No;
  //   drawerInfo.title = '编辑:' + record.Name;
  //   drawerInfo.url = editUrl;
  //   drawerInfo.component = markRaw(loadComponent(editUrl));
  //   drawerInfo.visible = true;
  // };

  columns.value = [
    { dataIndex: 'SysModuleName', title: '系统模块名称' },
    { dataIndex: 'SubModuleName', title: '子模块名称' },
    { dataIndex: 'UseCaseDoc', title: '用例描述(测试项)' },
    { dataIndex: 'Condition', title: '前置条件' },
    { dataIndex: 'OperateStep', title: '操作步骤' },
    { dataIndex: 'InputDoc', title: '输入数据说明' },
    { dataIndex: 'ExpectOutput', title: '预期输出' },
    { dataIndex: 'TestResult', title: '测试结果' },
  ];

  const initPage = async () => {
    const classList = await ClassFactory.toJSON();

    let sources: Array<Recordable> = [];
    for (const cls of classList) {
      const { rms } = cls;
      for (const rm of rms) {
        if (rm.RefMethodType === RefMethodType.GroupPageEdit) {
          try {
            const gpe = await ClassFactoryOfGroupPageBaseEdit.GetEn(rm.Tag.classID);
            await gpe.Init();
            const sysModuleName = gpe.entity?._enMap.EnDesc;
            const subModuleName = gpe.PageTitle;
            const subPages = gpe.SubPages;
            const dataList = subPages.map((page) => {
              let InputDoc = '';
              //空白的帮助
              if (page.HisPageModelEdit == PageModelEdit.Blank) {
                InputDoc = '无需输入';
              }
              // 富文本.
              if (page.HisPageModelEdit == PageModelEdit.SingleRichTxt) {
                InputDoc = '无需输入';
              }
              // 实体编辑器.
              if (page.HisPageModelEdit == PageModelEdit.Entity) {
                InputDoc = '无需输入';
              }
              // SQL文本.
              if (page.HisPageModelEdit == PageModelEdit.SingleTBSQL) {
                InputDoc = page.Tag1 + '输入相应参数';
              }
              // Entities 下拉框
              if (page.HisPageModelEdit == PageModelEdit.SingleDDLEntities) {
                InputDoc = '选择枚举';
              }
              //两个文本框.
              if (page.HisPageModelEdit == PageModelEdit.TextBox2) {
                InputDoc = '输入:' + page.Tag1 + ' , ' + page.Tag3;
              }
              // 自定义url.
              if (page.HisPageModelEdit == PageModelEdit.SelfComponent) {
                InputDoc = '输入:' + page.Tag1;
              }
              // 单个文本框.
              if (page.HisPageModelEdit == PageModelEdit.SingleTB) {
                InputDoc = '输入:' + page.Tag1;
              }
              // 单个大块文本.
              if (page.HisPageModelEdit == PageModelEdit.SingleTextArea) {
                InputDoc = '输入:' + page.Tag1;
              }
              // 单独枚举
              if (page.HisPageModelEdit == PageModelEdit.SingleEnumRadioButton) {
                InputDoc = '输入:' + page.Tag1;
              }
              // 枚举下拉
              if (page.HisPageModelEdit == PageModelEdit.SingleDDLEnum) {
                InputDoc = '输入:' + page.Tag1;
              }
              // SQL下拉框
              if (page.HisPageModelEdit == PageModelEdit.SingleDDLSQL) {
                InputDoc = '输入:' + page.Tag1;
              }

              return {
                SysModuleNo: gpe.entity?._enMap.EnClassID,
                SysModuleName: sysModuleName,
                SubModuleName: subModuleName,
                funcNo: page.No,
                funcName: page.Name,
                UseCaseDoc: page.HelpDocs,
                ExpectOutput: '保存成功',
                OperateStep: `选择[${page.Name}]`,
                InputDoc,
                TestResult: '测试成功',
              };
            });

            sources = [...sources, ...dataList];
          } catch (e: unknown) {
            continue;
          }
        }

        if (rm.RefMethodType === RefMethodType.GroupPageNew) {
          try {
            const gpn = await ClassFactoryOfGroupPageNew.GetEn(rm.Tag.classID);
            await gpn.Init();
            const sysModuleName = gpn.entity?._enMap.EnDesc;
            const subModuleName = gpn.PageTitle;
            const subPages = gpn.SubPages;

            const dataList = subPages.map((page) => {
              let InputDoc = '';
              //空白的
              if (page.HisPageModelNew == PageModelNew.Blank) {
                InputDoc = '无需输入';
              }
              //两个文本框.
              if (page.HisPageModelNew == PageModelNew.Text2NoName) {
                InputDoc = '输入:' + page.Tag1 + ' , ' + page.Tag3;
              }
              // 自定义url.
              if (page.HisPageModelNew == PageModelNew.SelfComponent) {
                InputDoc = '输入:' + page.Tag1;
              }
              // 单个文本框.
              if (page.HisPageModelNew == PageModelNew.Text1Name) {
                InputDoc = '输入:' + page.Tag1;
              }
              // 三个文本框.
              if (page.HisPageModelNew == PageModelNew.Text3NoNameNote) {
                InputDoc = '输入:' + page.Tag1 + ' , ' + page.Tag3 + ' , ' + page.Tag5;
              }
              // 文件上传
              if (page.HisPageModelNew == PageModelNew.FileUpload) {
                InputDoc = '输入:' + page.Tag1;
              }
              //
              if (page.HisPageModelNew == PageModelNew.SelectItemsByList) {
                InputDoc = '无需输入';
              }

              return {
                SysModuleName: sysModuleName,
                SubModuleName: subModuleName,
                funcNo: page.No,
                funcName: page.Name,
                UseCaseDoc: page.HelpDocs,
                ExpectOutput: '保存成功',
                OperateStep: `选择[${page.Name}]`,
                InputDoc,
                TestResult: '测试成功',
              };
            });

            sources = [...sources, ...dataList];
          } catch (e: unknown) {
            continue;
          }
        }
      }
    }
    dataSource.value = sources;

    console.log('datasource:', sources);
  };

  initPage();

  const [registerTable] = useTable({
    dataSource: dataSource, // 在这里定义数据源
    columns: columns, // 表格的列
    // rowKey: 'No',
  });
</script>
