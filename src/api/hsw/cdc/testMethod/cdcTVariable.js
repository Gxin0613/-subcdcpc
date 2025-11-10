// 步骤变量表
import request from '/@/WF/Admin/FoolFormDesigner/utils/hswRequest';

// 查询步骤变量表列表
export function listVariable(query) {
  return request({
    url: '/cdc/variable/list',
    method: 'get',
    params: query
  })
}

// 查询步骤变量表详细
export function getVariable(id) {
  return request({
    url: '/cdc/variable/' + id,
    method: 'get'
  })
}

// 新增步骤变量表
export function addVariable(data) {
  return request({
    url: '/cdc/variable',
    method: 'post',
    data: data
  })
}

// 修改步骤变量表
export function updateVariable(data) {
  return request({
    url: '/cdc/variable',
    method: 'put',
    data: data
  })
}

// 删除步骤变量表
export function delVariable(id) {
  return request({
    url: '/cdc/variable/' + id,
    method: 'delete'
  })
}

// 导出步骤变量表
export function exportVariable(query) {
  return request({
    url: '/cdc/variable/export',
    method: 'get',
    params: query
  })
}

// 下载步骤变量表导入模板
export function importTemplate() {
  return request({
    url: '/cdc/variable/importTemplate',
    method: 'get'
  })
}
