//  const wpsjsrpcsdk = require('./wpsjsrpcsdk.cjs');

// 获取当前网址
export function onlineEdit(officeBtnEnable, name, downloadFileUrl, uploadFileUrl) {
  const suffix = 'docx'; //仅支持word其他文件按照word格式打开
  const params = {};
  params.docType = 0;
  params.fileName = downloadFileUrl;
  params.uploadPath = uploadFileUrl; // 文件在线编辑后重新保存地址,可以?追加token信息等等
  params.suffix = suffix; //文件后缀
  params.docId = new Date().getTime().toString();
  params.userName = name; //操作人姓名
  const openType = {};
  openType.protectType = officeBtnEnable; // 文档保护类型，-1：不启用保护模式，3：只读
  params.openType = openType;
  params.downloadUrl = downloadFileUrl;
  _WpsInvoke(
    [
      {
        OpenDoc: params,
      },
    ],
    true,
  ); // OpenDoc方法对应于OA助手dispatcher支持的方法名
}
function _WpsInvoke(funcs, front) {
  console.info('-------------------------调用_WpsInvoke--------------------------------');
  front = front ? front : false;
  const bUseHttps = false;
  // const jsPluginsXml = 'http://172.16.100.141:9527/wps/jsplugins.xml'
  // const jsPluginsXml = ''
  const info = {};
  info.funcs = funcs;
  // caocao注释代码, jsPluginsXml备用选项,默认使用publish模式发布wps加载项
  // this.wpsClient.jsPluginsXml = this.jsPluginsXml;

  const wpsClient = new WpsClient(WpsInvoke.ClientType.wps);
  wpsClient.InvokeAsHttp(
    'WpsOAAssist', // 插件名，与wps客户端加载的加载的插件名对应
    'dispatcher', // 插件方法入口，与wps客户端加载的加载的插件代码对应，详细见插件代码
    info, // 传递给插件的数据
    (result) => {
      console.log(result.response);
      wpsClient.clientId = result.response.clientId;
    },
    front,
  );
}

//this.documentsUrl = pathArr[0] + '//' + pathArr[2] + '/api/documents';
/*
 * 将自己的加载项地址配置到这里来
 * 需要保证加载项的name和业务业务系统中传递加载项name相对应
 * url必须以/ 结尾，且url+ribbon.xml和url+index.html在清除浏览器缓存的情况下能直接访问，不会被重定向
 * addonType:对应组件类型，wps文字，wpp演示，et表格
 */
//复制开始
//    var curList = [{"name":"EtOAAssist","addonType":"et","online":"false","url":"http://127.0.0.1/jsplugindir/EtOAAssist.7z","version":"1.0.0"}]; //离线模式参考
var curList = [{ name: 'WpsOAAssist', addonType: 'wps', online: 'true', url: import.meta.env.VITE_GLOB_API_URL + '/DataUser/ThirdpartySoftware/wps/WpsOAAssist/' }]; //在线模式配置参考
var localList = [];
var publishIndex = 0;
/*获取用户本地全部加载项的接口是必须要的，这个接口做了判断，
 ** 如果58890端口未启动，会先去启动这个端口
 */
//加载项安装函数
export function installWpsAddin(callBack, data) {
  WpsAddonMgr.getAllConfig(function (e) {
    if (import.meta.env.MODE === 'development') {
      if (!e.response || e.response.indexOf('null') >= 0) {
        //本地没有加载项，直接安装
        if (curList.length > 0) {
          installWpsAddinOne(callBack, data);
        }
      } else {
        //本地有加载项，先卸载原有加载项，然后再安装
        localList = JSON.parse(e.response);
        unInstallWpsAddin(callBack, data);
      }
    } else {
      if (!e.response || e.response.indexOf('null') >= 0) {
        //本地没有加载项，直接安装
        if (curList.length > 0) {
          installWpsAddinOne(callBack, data);
        }
      }
      callBack && callBack(...data);
    }
  });
}
//安装单个加载项
function installWpsAddinOne(callBack, data) {
  if (publishIndex >= curList.length) {
    publishIndex = 0;
  }

  WpsAddonMgr.enable(curList[publishIndex], function (e) {
   // debugger;
    publishIndex++;
    if (e.status) {
      console.log(e.msg || e.message);
    } else {
      console.log('安装成功');
      if (publishIndex >= curList.length) {
        callBack && callBack(...data);
      }
    }
    if (publishIndex < curList.length) {
      installWpsAddinOne(callBack, data);
    }
  });
}
//卸载所有加载项
function unInstallWpsAddin(callBack, data) {
  WpsAddonMgr.disableall({}, function (e) {
    if (e.status) {
      console.log(e.msg || e.message);
    } else {
      console.log('卸载成功');
    }
    if (curList.length > 0) {
      installWpsAddinOne(callBack, data);
    }
  });
}
