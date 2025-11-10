// 实验过程管理标本
import request from '/@/WF/Admin/FoolFormDesigner/utils/hswRequest';

// 查询【请填写功能名称】列表
export function listSample(query) {
  return request({
    url: '/app/sample/list',
    method: 'get',
    params: query
  })
}

// 查询【请填写功能名称】详细
export function getSample(id) {
  return request({
    url: '/app/sample/' + id,
    method: 'get'
  })
}

// 新增【请填写功能名称】
export function addSample(data) {
  return request({
    url: '/app/sample',
    method: 'post',
    data: data
  })
}

// 修改【请填写功能名称】
export function updateSample(data) {
  return request({
    url: '/app/sample',
    method: 'put',
    data: data
  })
}

// 删除【请填写功能名称】
export function delSample(id) {
  return request({
    url: '/app/sample/' + id,
    method: 'delete'
  })
}

// 导出【请填写功能名称】
export function exportSample(query) {
  return request({
    url: '/app/sample/export',
    method: 'get',
    params: query
  })
}

// 下载【请填写功能名称】导入模板
export function importTemplate() {
  return request({
    url: '/app/sample/importTemplate',
    method: 'get'
  })
}
