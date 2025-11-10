<template>
  <div> 打印rtf文件. </div>
</template>
<script setup lang="ts">
  import HttpHandler from '/@/utils/gener/HttpHandler';

  const hander = new HttpHandler('BP.CCBill.WF_CCBill');
  hander.AddPara('MethondID', '');
  hander.AddPara('WorkID', '');
  hander.AddPara('FrmID', '');
  var data = hander.DoMethodReturnJson('MyDict_PrintRTF');
  const name = data.FileName;
  const url = data.FileUrl;
</script>
