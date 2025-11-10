<template>
  <iframe v-if="url" :src="url" scrolling="auto" frameborder="no" style="width: 100%; height: calc(100vh - 70px)"></iframe>
<!--  <component :is="currentComponent"></component>-->
</template>

<script setup name="ceshi">
import {onMounted, ref} from 'vue';

const url = ref('http://localhost:3000/#/041112-46131-1114413/1415912-41422-813914/En_CheLiangTaiZhang');
const currentComponent = ref('http://localhost:3000/#/DBInstall');

// onMounted(() => {
//   const prefix = import.meta.env.MODE === 'development' ? '/api' : VITE_GLOB_API_URL;
//   const apiPath = '/WF/Comm/ProcessRequest';
//   url.value = prefix + apiPath + '?DoType=HttpHandler&DoMethod=AttachmentUpload_Down&HttpHandlerName=BP.WF.HttpHandler.WF_CCForm&WorkID=0&MyPK=0&Token=' + WebUser.Token;
// })

</script>
