import request from '/@/WF/Admin/FoolFormDesigner/utils/Request';
// import requestCDC from '@/utils/requestCDC'

// 图片上传
export function uploadImg(data) {
  return request({
    url: '/app/upload/uploadFile',
    method: 'post',
    data: data
  })
}

//获取表格信息
export function getUserTableStyle(data) {
  return request({
    url: '/system/user/getUserTableStyle',
    method: 'post',
    data: data
  })
}

//设置表格信息
export function saveUserTableStyle(data) {
  return request({
    url: '/system/user/saveUserTableStyle',
    method: 'post',
    data: data
  })
}
