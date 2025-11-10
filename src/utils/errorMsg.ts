//解决异常抛出问题
//截取最后一个@err前面的内容，跟截取第一个@后面的内容,只保留中间的内容
export function errorMsg(message) {
  // 找到最后一个'err@'的位置
  const lastIndex = message.lastIndexOf('err@');
  if (lastIndex === -1) {
    // 如果没有找到'err@'，则返回空字符串
    return message;
  }

  // 截取从最后一个'err@'之后到字符串结束的部分
  const restOfString = message.substring(lastIndex + 'err@'.length);

  // 查找第一个'@'的位置
  const atIndex = restOfString.indexOf('@');
  if (atIndex === -1) {
    // 如果没有找到'@'，则返回整个剩余部分
    return restOfString.trim();
  }

  // 截取从'err@'之后到第一个'@'之前的部分
  const errorMessage = restOfString.substring(0, atIndex).trim();

  return errorMessage;
}
