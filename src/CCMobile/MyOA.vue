<template>
  <Loading v-if="loading === true" />
</template>

<script lang="ts" setup>
  import { useRoute } from 'vue-router';
  import { showFailToast, Loading } from 'vant';
  import { ref } from 'vue';
  import axios from 'axios';
  import WebUser from '../bp/web/WebUser';
  import { Emps } from '../bp/port/Emp';
  const route = useRoute();
  const query = route.query || {};
  const loading = ref(false);
  //通过成员授权获取到的code
  const code = ref(query.code as string);
  const state = ref(query.state as string);
  const InitPage = async () => {
    try {
      loading.value = true;
      if (WebUser.No == null) {
        //如果当前登录人员帐号为 null
        const accessToken = getAccessToken(); //获取 AccessToken
        const userinfo = getUserId(code, accessToken); //获取用户信息
        const { errcode, errmsg, userid, user_ticket } = userinfo;
        if (errcode != 0) {
          showFailToast('获取访问用户身份失败，错误码:' + errcode + '错误信息：' + errmsg);
          return;
        } else {
          //验证用户是否存在（No或者Tel）
          const ens = new Emps();
          await ens.Retrieve('No', userid);
          if (ens.length <= 0) {
            await ens.Retrieve('Tel', userid);
            if (ens.length <= 0) {
              showFailToast('用户名错误，没有找到登录信息.userid=[' + userid + ']');
              return;
            }
            //使用ens[0].No进行登录
          } else {
            //使用ens[0].No进行登录
          }
        }
      }
      loading.value = false;
      //通过state标识去跳转页面
      if (state.value == 'Home') window.location.replace('/#/CCMobile/Home');
      else window.location.replace('/#/CCMobile/' + state.value);
    } catch (e) {
      showFailToast(e as string);
      return;
    } finally {
      loading.value = false;
    }
  };
  const getAccessToken = async () => {
    // 当前企业的 corp_id
    const appid = 'wx8eac6a18c5efec30';
    // 当前企业的 secret
    const appsecret = 'ygZRZ8C3Z3667ChQn4lyzc-x7IqVUKFRnBp4hNgoPi8';
    const url = `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${appid}&corpsecret=${appsecret}`;
    await axios
      .get(url, {
        responseType: 'text',
        timeout: 39000,
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
      })
      .then((response) => {
        console.log(response.data);
        let { access_token } = response.data;
        return access_token;
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const getUserId = async (code, accessToken) => {
    const url = 'https://qyapi.weixin.qq.com/cgi-bin/auth/getuserinfo?access_token=' + accessToken + '&code=' + code;
    await axios
      .get(url, {
        responseType: 'text',
        timeout: 39000,
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
      })
      .then((response) => {
        console.log(response.data);
        return response.data;
      })
      .catch((error) => {
        console.error(error);
      });
  };
  InitPage();
</script>

<style scoped></style>
