//实验过程试剂
import request from '/@/WF/Admin/FoolFormDesigner/utils/hswRequest';

// 查询【请填写功能名称】列表
export function listReagent(query) {
  return request({
    url: '/app/reagent/list',
    method: 'get',
    params: query
  })
}

// 查询【请填写功能名称】详细
export function getReagent(id) {
  return request({
    url: '/app/reagent/' + id,
    method: 'get'
  })
}

// 新增【请填写功能名称】
export function addReagent(data) {
  return request({
    url: '/app/reagent',
    method: 'post',
    data: data
  })
}

// 修改【请填写功能名称】
export function updateReagent(data) {
  return request({
    url: '/app/reagent',
    method: 'put',
    data: data
  })
}

// 删除【请填写功能名称】
export function delReagent(id) {
  return request({
    url: '/app/reagent/' + id,
    method: 'delete'
  })
}

// 导出【请填写功能名称】
export function exportReagent(query) {
  return request({
    url: '/app/reagent/export',
    method: 'get',
    params: query
  })
}

// 下载【请填写功能名称】导入模板
export function importTemplate() {
  return request({
    url: '/app/reagent/importTemplate',
    method: 'get'
  })
}
