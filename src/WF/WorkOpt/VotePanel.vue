<template>
  <div class="vote-container">
    <div class="header">用户{{ getStarterUsername() }}发起提交，请确认 ({{ Math.floor(sformStore.remainSeconds / 1000) }} 秒)</div>
    <div class="user-list">
      <div class="user-info" v-for="u in sformStore.onlineUsers" :key="u.UserId">
        <CheckCircleOutlined :style="{ color: getColor(u) }" v-if="u.VoteStatus == UserVoteStatus.Agree" />
        <CloseCircleOutlined :style="{ color: getColor(u) }" v-if="u.VoteStatus == UserVoteStatus.Reject" />
        <LoadingOutlined :style="{ color: getColor(u) }" v-if="u.VoteStatus == UserVoteStatus.None" />
        <img :src="u.Avatar" @error="defaultIcon" />
        <div class="user-name" :style="voteUserStyle(u)">{{ u.Username }} </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { CloseCircleOutlined, CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons-vue';
  import { useSharedFormStore, UserVoteStatus } from '/@/store/modules/sharedForm';
  import DefaultUserIcon from '/@/assets/icons/default_user_icon.png';
  const sformStore = useSharedFormStore();

  const defaultIcon = (e) => {
    const img = e.srcElement;
    img.src = DefaultUserIcon;
    img.onerror = null;
  };
  const getStarterUsername = () => {
    return sformStore.onlineUsers.find((u) => u.IsVoteStarter)?.Username;
  };
  const getColor = (u) => {
    let color = '#333';
    if (u.VoteStatus == UserVoteStatus.Agree) {
      color = '#52c41a';
    } else if (u.VoteStatus == UserVoteStatus.Reject) {
      color = '#f5222d';
    }
    return color;
  };
  const voteUserStyle = (u) => {
    return {
      color: getColor(u),
    };
  };
</script>

<style lang="less" scoped>
  .vote-container {
    .header {
      font-size: 16px;
      font-weight: bold;
      padding: 10px;
      background-color: #f0f0f0;
    }
    .user-list {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      .user-info {
        display: flex;
        align-items: center;
        padding: 10px;
        img {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          margin-right: 10px;
          margin-left: 12px;
        }
        .user-name {
          font-size: 14px;
        }
      }
    }
    .countdown {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .remain-seconds {
        width: 60px;
        margin-left: 12px;
      }
    }
  }
</style>
