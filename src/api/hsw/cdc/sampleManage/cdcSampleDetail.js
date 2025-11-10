import request from '/@/WF/Admin/FoolFormDesigner/utils/hswRequest';

// 查询检测申请单明细-样品（跟cdc_sample_receive_batch关联）列表
export function listDetail(query) {
  return request({
    url: '/cdc/sampleDetail/detail/list',
    method: 'get',
    params: query
  })
}

// 查询检测申请单明细-样品（跟cdc_sample_receive_batch关联）详细
export function getDetail(sampleId) {
  return request({
    url: '/cdc/sampleDetail/detail/' + sampleId,
    method: 'get'
  })
}

// 新增检测申请单明细-样品（跟cdc_sample_receive_batch关联）
export function addDetail(data) {
  return request({
    url: '/cdc/sampleDetail/detail',
    method: 'post',
    data: data
  })
}

// 修改检测申请单明细-样品（跟cdc_sample_receive_batch关联）
export function updateDetail(data) {
  return request({
    url: '/cdc/sampleDetail/detail',
    method: 'put',
    data: data
  })
}

// 删除检测申请单明细-样品（跟cdc_sample_receive_batch关联）
export function delDetail(sampleId) {
  return request({
    url: '/cdc/sampleDetail/detail/' + sampleId,
    method: 'delete'
  })
}

// 导出检测申请单明细-样品（跟cdc_sample_receive_batch关联）
export function exportDetail(query) {
  return request({
    url: '/cdc/sampleDetail/detail/export',
    method: 'get',
    params: query
  })
}

// 下载检测申请单明细-样品（跟cdc_sample_receive_batch关联）导入模板
export function importTemplate() {
  return request({
    url: '/cdc/sampleDetail/detail/importTemplate',
    method: 'get'
  })
}
