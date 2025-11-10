<template>
  <div>
    <Button type="primary" style="margin-right: 1em" @click="toPrevDept">{{ '上一级' }}</Button>
    <Button type="primary" style="margin-right: 1em" @click="BtnOK">{{ '确定' }}</Button>
    <Button type="primary" @click="Cancel">{{ '取消' }}</Button>
  </div>
  <BasicTree
    v-model:selectedKeys="selectedKeys"
    v-model:checkedKeys="checkedKeys"
    :checkable="!!props.isMultiSelect"
    :clickRowToExpand="true"
    :defaultExpandAll="true"
    :autoExpandParent="true"
    ref="asyncTreeRef"
    v-if="treeData.length"
    :treeData="treeData"
    :load-data="onLoadData"
    @select="handlerSelect"
  />
</template>

<script lang="ts" setup>
  import { message, Spin, Button } from 'ant-design-vue';
  import { BasicTree, TreeActionType, TreeItem } from '/@/components/Tree/index';
  // 父组件传过来的属性
  import { reactive, ref, unref } from 'vue';
  import WebUser from '/@/bp/web/WebUser';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  const props = defineProps({
    params: {
      //请求参数集合
      type: Object,
      default: () => {},
    },
    isMultiSelect: {
      type: Boolean,
      default: true,
    },
  });
  //错误提示
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const loading = ref(false);
  const checkable = props.isMultiSelect ? true : false;
  const treeData = ref<Array<TreeItem>>([]);
  const parentNo = ref<string>('');
  const rootNo = ref<string>('');
  const asyncTreeRef = ref<Nullable<TreeActionType>>(null);
  const selectedKeys = ref<string[]>([]);
  const checkedKeys = ref<string[]>([]);

  const nodes = ref<Record<string, any>>([]);
  const InitPage = async () => {
    try {
      loading.value = true;
      parentNo.value = WebUser.DeptNo || '0';
      rootNo.value = parentNo.value;
      await loadTreeData(parentNo.value);
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  /**
   * 上一级
   */
  const toPrevDept = async () => {
    if (parentNo.value == '0') {
      message.warning('已到第一机构了');
      return;
    }
    if (WebUser.CCBPMRunModel != 0 && parentNo.value === '100') {
      message.warning('已到第一级机构');
      return;
    }
    //设置根节点编号=上一级的节点编号
    rootNo.value = parentNo.value;
    await loadTreeData(parentNo.value);
  };
  /**
   * 获取表单树形结构
   * @param deptNo
   */
  async function loadTreeData(deptNo: string) {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
    handler.AddPara('FK_Dept', deptNo);
    handler.AddPara('FK_Node', props.params.FK_Node);
    const data = await handler.DoMethodReturnString('SelectEmps_Init');
    if (typeof data === 'string' && data.includes('err@')) {
      message.error(data.replace('err@', ''));
      return;
    }
    const result = JSON.parse(JSON.stringify(data));
    result.Emps.forEach((emp) => {
      emp.No = emp.No.replace('Emp_', '');
    });
    const children = ref<TreeItem[]>([]);
    result.Depts.forEach((item) => {
      if (item.ParentNo == deptNo) {
        children.value.push({
          title: item.Name || '',
          key: item.No || '',
          isLeaf: false,
          disabled: false,
          children: [],
        });
      }
    });
    result.Emps.forEach((emp) => {
      if (deptNo == emp.FK_Dept) {
        children.value.push({
          title: emp.Name || '',
          key: emp.No || '',
          isLeaf: true,
          children: [],
        });
      }
    });
    result.Depts.forEach((item) => {
      if (deptNo === rootNo.value && deptNo === item.No) {
        treeData.value = [];
        treeData.value.push({
          title: item.Name || '',
          key: item.No || '',
          disabled: false,
          children: children.value,
        });
        parentNo.value = item.ParentNo;
      }
    });
    nodes.value.push({
      deptNo: deptNo,
      children: children.value || [],
    });
    return children.value;
  }
  InitPage();
  /**
   * 懒加载表单
   */
  const onLoadData = async (treeNode) => {
    if (treeNode.children.length != 0) {
      return;
    }

    const asyncTreeAction: TreeActionType | null = unref(asyncTreeRef);
    if (asyncTreeAction) {
      const nodeChildren = await loadTreeData(treeNode.eventKey);
      asyncTreeAction.updateNodeByKey(treeNode.eventKey, { children: nodeChildren });
      asyncTreeAction.setExpandedKeys([treeNode.eventKey, ...asyncTreeAction.getExpandedKeys()]);
    }
    return;
  };
  const emit = defineEmits(['AddEmps']);
  /**
   * 确定
   * @constructor
   */
  const BtnOK = () => {
    if (selectedKeys.value.length == 0 && checkedKeys.value.length == 0) {
      message.warning('请选择接收人');
      return;
    }
    emit('AddEmps', selectedKeys.value.length > 0 ? selectedKeys.value : checkedKeys.value);
  };
  /**
   * 取消
   * @constructor
   */
  const Cancel = () => {
    emit('AddEmps', []);
  };
</script>
<style scoped></style>
