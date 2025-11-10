import { ElMessage, ElMessageBox, ElNotification, ElLoading } from "element-plus";

let loadingInstance;

export default {
  // 错误消息提示
  msgError(content) {
    ElMessage.error(content);
  },
  // 成功消息提示
  msgSuccess(content) {
    ElMessage.success(content);
  },
  // 警告消息提示
  msgWarning(content) {
    ElMessage.warning(content);
  },
  // 确认对话框
  confirm(content) {
    return ElMessageBox.confirm(content, "系统提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
  }
};
