//实验过程管理步骤记录
import request from '/@/WF/Admin/FoolFormDesigner/utils/hswRequest';

// 查询【请填写功能名称】列表
export function listRecord(query) {
  return request({
    url: '/app/record/list',
    method: 'get',
    params: query
  })
}

// 查询【请填写功能名称】详细
export function getRecord(id) {
  return request({
    url: '/app/record/' + id,
    method: 'get'
  })
}

// 新增【请填写功能名称】
export function addRecord(data) {
  return request({
    url: '/app/record',
    method: 'post',
    data: data
  })
}

// 修改【请填写功能名称】
export function updateRecord(data) {
  return request({
    url: '/app/record',
    method: 'put',
    data: data
  })
}

// 删除【请填写功能名称】
export function delRecord(id) {
  return request({
    url: '/app/record/' + id,
    method: 'delete'
  })
}

// 导出【请填写功能名称】
export function exportRecord(query) {
  return request({
    url: '/app/record/export',
    method: 'get',
    params: query
  })
}

// 下载【请填写功能名称】导入模板
export function importTemplate() {
  return request({
    url: '/app/record/importTemplate',
    method: 'get'
  })
}
