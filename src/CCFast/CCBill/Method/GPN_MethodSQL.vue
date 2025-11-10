<template>
  <div id="code-editor">
    <Textarea v-model:value="sqlValue" :placeholder="'请输入SQL语句'" :rows="12" />
  </div>
  <!-- <ShowHelp @changeShowHelp="changeShowHelp" :isGPEShowHelp="isGPEShowHelp" style="margin-top: 10px" /> -->
  <!-- <Card style="margin-top: 12px; border-radius: 8px" ref="helpCard" v-show="isGPEShowHelp">
    <v-md-preview v-if="helpDocs" :text="helpDocs" preview-class="vuepress-markdown-body" height="400px" />
  </Card> -->
</template>

<script setup lang="ts">
  import { Textarea, message, Card } from 'ant-design-vue';
  import { onMounted, ref, unref } from 'vue';
  import BSEntity from '/@/utils/gener/BSEntity';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  // import ShowHelp from '/@/WF/Comm/UIEntity/ShowHelp.vue';
  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
  });
  const { PKVal } = unref(props.params);
  const sqlValue = ref('');
  const Save = async () => {
    const en = new BSEntity('BP.CCBill.Template.MethodFunc', PKVal);
    await en.Retrieve();
    const val = await en.DoMethodReturnString('SaveSQLScript', unref(sqlValue));
    if (val != '保存成功.') {
      message.error('保存失败' + val);
      return;
    }
    return 'skipUpdate';
  };

  onMounted(async () => {
    const handler = new HttpHandler('BP.CCBill.WF_CCBill_Admin_MethodDoc');
    handler.AddPara('TypeOfFunc', 0);
    handler.AddPara('No', PKVal);
    const val = await handler.DoMethodReturnString('MethodDoc_GetScript');
    sqlValue.value = val;
  });

  //帮助
  const isGPEShowHelp = ref(false);
  const changeShowHelp = (GPEHelp, GPNHelp) => {
    isGPEShowHelp.value = GPEHelp;
  };

  const helpDocs = `
  #### 说明
   - 您可以编写SQL语句在这个方法里。
   - 实体:在SQL的表达式里，有@OID作为参数字段。
   - 单据: 在SQL的表达式里，有@No作为参数字段。
   - 可以使用参数按钮，为执行该方法增加参数。
  `;

  defineExpose({
    Save,
  });
  console.log(props.params);
</script>
