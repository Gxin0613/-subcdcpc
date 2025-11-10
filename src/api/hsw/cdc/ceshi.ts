import request from '/@/WF/Admin/FoolFormDesigner/utils/Request';

export function Flow_StartAsWorkID(workIDHistory: number) {
  return request.get<null, Recordable>('/WF/API/Flow_StartAsWorkID', {
    params: {
      workIDHistory,
    },
  });
}

// 移交工作
export function TransferWork(workID: number, toEmpNo: string, Msg = '未填写移交原因', token: string) {
  return request.post<null, Recordable>(`/WF/API/Node_Shift?workID=${workID}&toEmpNo=${toEmpNo}&msg=${Msg}&token=${token}`);
}

export function ceshi(data :object) {
  return request.get<null, Recordable>('/cdc/sample/category/list', {
    params: data

  });
}
