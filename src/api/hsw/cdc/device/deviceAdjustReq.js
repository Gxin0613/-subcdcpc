import request from '/@/WF/Admin/FoolFormDesigner/utils/hswRequest';

// 查询DeviceAdjustReq列表
export function listReq(query) {
  return request({
    url: '/deviceAdjustReq/req/list',
    method: 'get',
    params: query
  })
}

// 查询DeviceAdjustReq详细
export function getReq(id) {
  return request({
    url: '/deviceAdjustReq/req/' + id,
    method: 'get'
  })
}

// 新增DeviceAdjustReq
export function addReq(data) {
  return request({
    url: '/deviceAdjustReq/req',
    method: 'post',
    data: data
  })
}

// 修改DeviceAdjustReq
export function updateReq(data) {
  return request({
    url: '/deviceAdjustReq/req',
    method: 'put',
    data: data
  })
}

// 删除DeviceAdjustReq
export function delReq(id) {
  return request({
    url: '/deviceAdjustReq/req/' + id,
    method: 'delete'
  })
}

// 导出DeviceAdjustReq
export function exportReq(query) {
  return request({
    url: '/deviceAdjustReq/req/export',
    method: 'get',
    params: query
  })
}

// 下载DeviceAdjustReq导入模板
export function importTemplate() {
  return request({
    url: '/deviceAdjustReq/req/importTemplate',
    method: 'get'
  })
}
//获取部门信息
export function selectDeptId(){
  return request({
    url:"/deviceAdjustReq/req/selectDep",
    method:'get'
  })
}
//打印调配报表
export function tz(id){
  return request({
		url: '/report/tp?id='+id,
		method: 'get'
  })
}
// 修改资产报废申请单
export function auditReq(data) {
  return request({
    url: '/deviceAdjustReq/req/audit',
    method: 'put',
    data: data
  })
}
