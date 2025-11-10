// 实验过程设备
import request from '/@/WF/Admin/FoolFormDesigner/utils/hswRequest';

// 查询【请填写功能名称】列表
export function listDevice(query) {
  return request({
    url: '/app/device/list',
    method: 'get',
    params: query
  })
}

// 查询【请填写功能名称】详细
export function getDevice(id) {
  return request({
    url: '/app/device/' + id,
    method: 'get'
  })
}

// 新增【请填写功能名称】
export function addDevice(data) {
  return request({
    url: '/app/device',
    method: 'post',
    data: data
  })
}

// 修改【请填写功能名称】
export function updateDevice(data) {
  return request({
    url: '/app/device',
    method: 'put',
    data: data
  })
}

// 删除【请填写功能名称】
export function delDevice(id) {
  return request({
    url: '/app/device/' + id,
    method: 'delete'
  })
}

// 导出【请填写功能名称】
export function exportDevice(query) {
  return request({
    url: '/app/device/export',
    method: 'get',
    params: query
  })
}

// 下载【请填写功能名称】导入模板
export function importTemplate() {
  return request({
    url: '/app/device/importTemplate',
    method: 'get'
  })
}
