import request from '/@/WF/Admin/FoolFormDesigner/utils/hswRequest';

// 查询检测申请单主列表
export function listBatch(query) {
  return request({
    url: '/cdc/batchReceive/batch/list',
    method: 'get',
    params: query
  })
}

// 查询检测申请单主详细
export function getBatch(batchId) {
  return request({
    url: '/cdc/batchReceive/batch/' + batchId,
    method: 'get'
  })
}

// 新增检测申请单主
export function addBatch(data) {
  return request({
    url: '/cdc/batchReceive/batch',
    method: 'post',
    data: data
  })
}

// 修改检测申请单主
export function updateBatch(data) {
  return request({
    url: '/cdc/batchReceive/batch',
    method: 'put',
    data: data
  })
}

// 删除检测申请单主
export function delBatch(batchId) {
  return request({
    url: '/cdc/batchReceive/batch/' + batchId,
    method: 'delete'
  })
}

// 导出检测申请单主
export function exportBatch(query) {
  return request({
    url: '/cdc/batchReceive/batch/export',
    method: 'get',
    params: query
  })
}

// 下载检测申请单主导入模板
export function importTemplate() {
  return request({
    url: '/cdc/batchReceive/batch/importTemplate',
    method: 'get'
  })
}
