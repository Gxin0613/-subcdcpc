import request from '/@/WF/Admin/FoolFormDesigner/utils/hswRequest';
// 实验过程管理
// 查询【请填写功能名称】列表
export function listBatch(query) {
  return request({
    url: '/app/batch/list',
    method: 'get',
    params: query
  })
}

// 查询【请填写功能名称】详细
export function getBatch(id) {
  return request({
    url: '/app/batch/' + id,
    method: 'get'
  })
}

// 新增【请填写功能名称】
export function addBatch(data) {
  return request({
    url: '/app/batch',
    method: 'post',
    data: data
  })
}

// 修改【请填写功能名称】
export function updateBatch(data) {
  return request({
    url: '/app/batch',
    method: 'put',
    data: data
  })
}

// 删除【请填写功能名称】
export function delBatch(id) {
  return request({
    url: '/app/batch/' + id,
    method: 'delete'
  })
}

// 导出【请填写功能名称】
export function exportBatch(query) {
  return request({
    url: '/app/batch/export',
    method: 'get',
    params: query
  })
}

// 下载【请填写功能名称】导入模板
export function importTemplate() {
  return request({
    url: '/app/batch/importTemplate',
    method: 'get'
  })
}

// 获取样本步骤表详细信息
export function getRecord(id) {
  return request({
    url: '/cdc/sample/record/'+id,
    method: 'get'
  })
}

//获取已分配的实验批次
export function getAllocatedBatch(query) {
  return request({
    url: '/cdc/sample/receive/batch/next/list',
    method: 'get',
    params: query
  })
}

//根据批次获取实验标本列表
export function getSampleList(query) {
  return request({
    url: '/sampleDetailNext/next/list',
    method: 'get',
    params: query
  })
}

//获取实验标本信息
export function getSampleInfo(id) {
  return request({
    url: '/sampleDetailNext/next/'+id,
    method: 'get'
  })
}

//获取实验标本方法下的实验步骤
export function getMethodStep(query) {
  return request({
    url: '/cdc/sample/record/list',
    method: 'get',
    params: query
  })
}

//试剂接口
export function getReagent() {
  return request({
    url: '/batch/reagentNewBatch/allList',
  method: 'get'
  })
}
