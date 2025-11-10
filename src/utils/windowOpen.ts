import HttpHandler from '/@/utils/gener/HttpHandler';
import { getToken } from '/@/utils/auth';
import { message } from 'ant-design-vue';
import { useUserStoreWithOut } from '/@/store/modules/user';

export function windowOpen(url: string) {
  let _url = url;
  if (_url.startsWith('/#/')) {
    _url = location.pathname + url.substring(1);
  }
  const self = window.open(_url, '_blank');
  if ((_url.includes('EditFlow') || _url.includes('MyFlow')) && self) {
    const loop = setInterval(async function () {
      if (self.closed) {
        clearInterval(loop);
        if (_url.includes('MyFlow')) {
          parent.location.reload();
        }
        if (_url.includes('EditFlow')) {
          const token = getToken();
          if (token != undefined) {
            //让管理员登录
            const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_TestingContainer');
            handler.AddPara('Token', token);
            const data = await handler.DoMethodReturnString('Default_LetAdminerLogin');
            if (typeof data === 'string' && data.includes('err@')) {
              message.error(data.replace('err@', ''));
              return;
            }
            //获取当前测试用户的信息
            const userStore = useUserStoreWithOut();
            // userStore.setTestToken('');
            userStore.token = token as string;
            await userStore.getUserInfoAction();
          }
        }
      }
    }, 1000);
  }
}
