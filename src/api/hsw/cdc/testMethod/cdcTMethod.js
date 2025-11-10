// 试验方法主表
import request from '/@/WF/Admin/FoolFormDesigner/utils/hswRequest';

// 查询实验方法主表列表
export function listMethod(query) {
  return request({
    url: '/cdc/method/list',
    method: 'get',
    params: query
  })
}

// 查询实验方法主表详细
export function getMethod(id) {
  return request({
    url: '/cdc/method/' + id,
    method: 'get'
  })
}

// 新增实验方法主表
export function addMethod(data) {
  return request({
    url: '/cdc/method',
    method: 'post',
    data: data
  })
}

// 修改实验方法主表
export function updateMethod(data) {
  return request({
    url: '/cdc/method',
    method: 'put',
    data: data
  })
}

// 删除实验方法主表
export function delMethod(id) {
  return request({
    url: '/cdc/method/' + id,
    method: 'delete'
  })
}

// 导出实验方法主表
export function exportMethod(query) {
  return request({
    url: '/cdc/method/export',
    method: 'get',
    params: query
  })
}

// 下载实验方法主表导入模板
export function importTemplate() {
  return request({
    url: '/cdc/method/importTemplate',
    method: 'get'
  })
}

// 获取实验步骤列表
export function getTStepByMethodId(query) {
  return request({
    url: '/cdc/step/getTStepByMethodId?methodId='+query.methodId,
    method: 'get',
    // params: query
  })
}


