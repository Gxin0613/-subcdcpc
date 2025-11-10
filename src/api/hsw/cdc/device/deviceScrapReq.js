import request from '/@/WF/Admin/FoolFormDesigner/utils/hswRequest';

// 查询资产报废申请单列表
export function listReq(query) {
  return request({
    url: '/deviceScrapReq/req/list',
    method: 'get',
    params: query
  })
}

// 查询资产报废申请单详细
export function getReq(id) {
  return request({
    url: '/deviceScrapReq/req/' + id,
    method: 'get'
  })
}

// 新增资产报废申请单
export function addReq(data) {
  return request({
    url: '/deviceScrapReq/req',
    method: 'post',
    data: data
  })
}

// 修改资产报废申请单
export function updateReq(data) {
  return request({
    url: '/deviceScrapReq/req',
    method: 'put',
    data: data
  })
}
// 修改资产报废申请单
export function auditReq(data) {
  return request({
    url: '/deviceScrapReq/req/audit',
    method: 'put',
    data: data
  })
}
// 删除资产报废申请单
export function delReq(id) {
  return request({
    url: '/deviceScrapReq/req/' + id,
    method: 'delete'
  })
}

// 导出资产报废申请单
export function exportReq(query) {
  return request({
    url: '/deviceScrapReq/req/export',
    method: 'get',
    params: query
  })
}

// 下载资产报废申请单导入模板
export function importTemplate() {
  return request({
    url: '/deviceScrapReq/req/importTemplate',
    method: 'get'
  })
}
//查询原科室
export function selectDep(){
  return request({
    url:'/deviceAdjustReq/req/selectDep',
    method:'get'
  })
}
//报表
export function bf(id){
  return request({
    url:'/report/bf?id='+id,
    method:'get',
  })
}
export function hx(id){
  return request({
    url:'/report/hx?id='+id,
    method:'get',
  })
}

