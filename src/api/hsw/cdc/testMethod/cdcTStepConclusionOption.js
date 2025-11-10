// 试验方法步骤表
import request from '/@/WF/Admin/FoolFormDesigner/utils/hswRequest';
// 查询实验步骤结论下拉表列表
export function listStepConclusion(query) {
  return request({
    url: '/cdc/conclusion/option/list',
    method: 'get',
    params: query
  })
}

// 查询实验步骤关联设备表详细
export function getStepConclusion(id) {
  return request({
    url: '/cdc/conclusion/option/' + id,
    method: 'get'
  })
}

// 新增实验步骤关联设备表
export function addStepConclusion(data) {
  return request({
    url: '/cdc/conclusion/option',
    method: 'post',
    data: data
  })
}

// 修改实验步骤关联设备表
export function updateStepConclusion(data) {
  return request({
    url: '/cdc/conclusion/option',
    method: 'put',
    data: data
  })
}

// 删除实验步骤关联设备表
export function delStepConclusion(id) {
  return request({
    url: '/cdc/conclusion/option/' + id,
    method: 'delete'
  })
}

// 导出实验步骤关联设备表
export function exportStepConclusion(query) {
  return request({
    url: '/cdc/conclusion/option/export',
    method: 'get',
    params: query
  })
}

// 下载实验步骤关联设备表导入模板
export function importTemplate() {
  return request({
    url: '/cdc/conclusion/option/importTemplate',
    method: 'get'
  })
}
