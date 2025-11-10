import { defineStore } from 'pinia';
import { useUserStore } from '/@/store/modules/user';
import { getAppEnvConfig } from '/@/utils/env';
export enum UserVoteStatus {
  None, // none
  Agree, // 准备
  Reject, // 进行中
}
type OnlineUser = {
  UserId: string;
  Username: string;
  Avatar: string;
  DefaultIcon: Function;
  HexColor: string;
  VoteStatus: UserVoteStatus;
  IsVoteStarter: boolean;
};

enum MessageType {
  Login,
  Exit,
  LockField,
  ReleaseField,
  UpdateEditInfo,
  UpdateFieldValue,
  PubData, // 推送数据
  StartVote, // 开始投票
  UpdateOnlineUsers,
  Ping,
  AgreeSubmit, // 同意提交
  DenySubmit, // 拒绝提交
  UpdateVoteList, // 更新投票信息
  UpdateFormStatus, // 更新表单状态
}

interface MessageBody {
  Type: MessageType;
  Data: Recordable;
}

export enum RoomVoteStatus {
  Pending, // 准备
  InProgress, // 进行中
}

let ws: Nullable<WebSocket> = null;
let _countdownTimer: any = null;

export const useSharedFormStore = defineStore('app-shared-form', {
  state: () => ({
    onlineUsers: [] as OnlineUser[], // 在线用户列表
    editInfo: {} as Recordable, // 编辑信息
    gloData: {} as Recordable, // 全局数据
    roomId: '', // 当前房间ID
    isConnected: false, // WebSocket 连接状态
    voteList: [] as OnlineUser[], // 投票列表
    voteStatus: RoomVoteStatus.Pending,
    voteSuccess: false, // 表单是否已经提交
    remainSeconds: 0, // 剩余秒数
    msg: '', // 错误信息
  }),

  getters: {
    // 计算获取 WebSocket 是否已连接
    isOnline(state): boolean {
      return state.isConnected;
    },
  },

  actions: {
    // 初始化 WebSocket 连接
    initWebSocket(wsUrl: string, workId: string, frmId: string) {
      if (ws === null) {
        this.roomId = workId + '_' + frmId; // 设置房间ID
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          this.sendMsg(MessageType.Login);
          this.startPing();
          this.isConnected = true; // 连接成功
        };

        ws.onmessage = (event) => {
          const str = event.data;
          try {
            const command = JSON.parse(str) as MessageBody;
            this.handleCommand(command);
          } catch (e: any) {
            console.trace('Error parsing message:', e.toString());
          }
        };

        ws.onclose = () => {
          this.stopPing();
          this.isConnected = false; // 连接关闭
        };
      }
    },

    // 发送消息
    sendMsg(type: MessageType, data = {}) {
      if (!ws) return;
      const userStore = useUserStore();
      data['token'] = userStore.getToken;
      data['roomId'] = this.roomId;
      const msg = {
        Type: type,
        Data: data,
      };
      ws.send(JSON.stringify(msg));
    },

    // 处理从 WebSocket 收到的命令
    handleCommand(command: MessageBody) {
      const { VITE_GLOB_API_URL } = getAppEnvConfig();
      const basicPath = import.meta.env.MODE === 'development' ? '/api' : VITE_GLOB_API_URL;

      switch (command.Type) {
        case MessageType.PubData:
          this.gloData = { ...this.gloData, ...command.Data };
          break;
        case MessageType.UpdateOnlineUsers:
          this.onlineUsers = (command.Data?.users || []) as OnlineUser[];
          this.onlineUsers.forEach((u) => {
            u.Avatar = basicPath + '/DataUser/UserIcon/' + u.UserId + '.png';
            u.DefaultIcon = (e) => {
              const img = e.srcElement;
              img.src = basicPath + '/DataUser/UserIcon/Default.png';
              img.onerror = null;
            };
          });
          break;
        case MessageType.UpdateEditInfo:
          this.editInfo = command.Data?.EditInfo as Recordable;
          break;
        case MessageType.UpdateFieldValue:
          this.gloData = { ...this.gloData, ...command.Data };
          break;
        case MessageType.UpdateVoteList:
          const status = command.Data?.Status;
          if (status == 'reject') {
            this.voteStatus = RoomVoteStatus.Pending;
            this.msg = '有人拒绝了提交';
            clearInterval(_countdownTimer);
            return;
          }
          if (status == 'agree') {
            this.voteSuccess = true;
            this.msg = '表单已提交';
            clearInterval(_countdownTimer);
            return;
          }
          break;
        case MessageType.StartVote:
          this.voteStatus = command.Data?.Status;
          this.remainSeconds = command.Data?.ExpiredTimeStamp - new Date().getTime();
          if (this.remainSeconds > 0) {
            _countdownTimer = setInterval(() => {
              this.remainSeconds -= 1000;
              if (this.remainSeconds <= 0) {
                clearInterval(_countdownTimer);
                this.denySubmit();
              }
            }, 1000);
          }
          break;
        default:
          console.warn('Unhandled message type:', command.Type);
      }
    },

    // 启动心跳
    startPing() {
      // _ping = setInterval(() => {
      //   this.sendMsg(MessageType.Ping, {});
      // }, 10 * 1000);
    },

    // 停止心跳
    stopPing() {
      // if (_ping != null) {
      //   clearInterval(_ping);
      //   _ping = null;
      // }
    },

    closeWebSocket() {
      ws?.close();
      ws = null;
    },

    // 锁定字段
    tryLockField(attrKey: string) {
      this.sendMsg(MessageType.LockField, { field: attrKey });
    },

    // 释放字段
    tryReleaseField(attrKey: string) {
      this.sendMsg(MessageType.ReleaseField, { field: attrKey });
    },

    // 更新字段值
    updateFieldVal(attrKey: string, value: any) {
      this.sendMsg(MessageType.UpdateFieldValue, { key: attrKey, value });
    },

    // 发起投票
    startVote() {
      this.sendMsg(MessageType.StartVote);
    },
    // 同意提交
    agreeSubmit() {
      this.sendMsg(MessageType.AgreeSubmit);
    },
    // 拒绝提交
    denySubmit() {
      this.sendMsg(MessageType.DenySubmit);
    },
  },
});
