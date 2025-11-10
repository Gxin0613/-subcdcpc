import request from '/@/WF/Admin/FoolFormDesigner/utils/hswRequest';

// 查询
export function selectCheckDetailById(id) {
	return request({
		url: '/pcCheckDetail/loadList/'+id,
		method: 'get',
	})
}

//修改
export function updateFlag(id,deviceFlag) {
  return request({
    url: '/pcCheckDetail/updateFlag?detailId='+id + "&flag=" + deviceFlag,
    method: 'get',
  })
}
