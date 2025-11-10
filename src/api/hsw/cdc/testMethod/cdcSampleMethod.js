// 实验方法步骤
import request from '/@/WF/Admin/FoolFormDesigner/utils/hswRequest';

// 查询【请填写功能名称】列表
export function listMethod(query) {
  return request({
    url: '/app/method/list',
    method: 'get',
    params: query
  })
}

// 查询【请填写功能名称】详细
export function getMethod(id) {
  return request({
    url: '/app/method/' + id,
    method: 'get'
  })
}

// 新增【请填写功能名称】
export function addMethod(data) {
  return request({
    url: '/app/method',
    method: 'post',
    data: data
  })
}

// 修改【请填写功能名称】
export function updateMethod(data) {
  return request({
    url: '/app/method',
    method: 'put',
    data: data
  })
}

// 删除【请填写功能名称】
export function delMethod(id) {
  return request({
    url: '/app/method/' + id,
    method: 'delete'
  })
}

// 导出【请填写功能名称】
export function exportMethod(query) {
  return request({
    url: '/app/method/export',
    method: 'get',
    params: query
  })
}

// 下载【请填写功能名称】导入模板
export function importTemplate() {
  return request({
    url: '/app/method/importTemplate',
    method: 'get'
  })
}
