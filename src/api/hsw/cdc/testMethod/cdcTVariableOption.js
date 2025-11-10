// 变量的下拉选择表
import request from '/@/WF/Admin/FoolFormDesigner/utils/hswRequest';

// 查询变量的下拉选择表列表
export function listOption(variableId) {
  return request({
    url: '/cdc/option/getTVariableOptionByVariableId?variableId=' + variableId,
    method: 'get',
  })
}

// 查询变量的下拉选择表详细
export function getOption(id) {
  return request({
    url: '/cdc/option/' + id,
    method: 'get'
  })
}

// 新增变量的下拉选择表
export function addOption(data) {
  return request({
    url: '/cdc/option',
    method: 'post',
    data: data
  })
}

// 修改变量的下拉选择表
export function updateOption(data) {
  return request({
    url: '/cdc/option',
    method: 'put',
    data: data
  })
}

// 删除变量的下拉选择表
export function delOption(id) {
  return request({
    url: '/cdc/option/' + id,
    method: 'delete'
  })
}

// 导出变量的下拉选择表
export function exportOption(query) {
  return request({
    url: '/cdc/option/export',
    method: 'get',
    params: query
  })
}

// 下载变量的下拉选择表导入模板
export function importTemplate() {
  return request({
    url: '/cdc/option/importTemplate',
    method: 'get'
  })
}
