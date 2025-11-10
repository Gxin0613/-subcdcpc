// 实验步骤关联设备表
import request from '/@/WF/Admin/FoolFormDesigner/utils/hswRequest';

// 查询实验步骤关联设备表列表
export function listStep(query) {
  return request({
    url: '/cdc/step/device/list',
    method: 'get',
    params: query
  })
}

// 查询实验步骤关联设备表详细
export function getStep(id) {
  return request({
    url: '/cdc/step/device/' + id,
    method: 'get'
  })
}

// 新增实验步骤关联设备表
export function addStep(data) {
  return request({
    url: '/cdc/step/device',
    method: 'post',
    data: data
  })
}

// 修改实验步骤关联设备表
export function updateStep(data) {
  return request({
    url: '/cdc/step/device',
    method: 'put',
    data: data
  })
}

// 删除实验步骤关联设备表
export function delStep(id) {
  return request({
    url: '/cdc/step/device/' + id,
    method: 'delete'
  })
}

// 导出实验步骤关联设备表
export function exportStep(query) {
  return request({
    url: '/cdc/step/device/export',
    method: 'get',
    params: query
  })
}

// 下载实验步骤关联设备表导入模板
export function importTemplate() {
  return request({
    url: '/cdc/step/device/importTemplate',
    method: 'get'
  })
}
