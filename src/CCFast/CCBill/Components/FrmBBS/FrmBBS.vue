<template>
  <div style="margin: 0 20px">
    <!--评论-->
    <Comment v-for="(item, i) in commentList" :key="item.commentNo" :author="item.author" class="comment-body">
      <template #actions>
        <span
          ><a @click="replyComment(i, item.commentNo)">{{ '回复' }}</a></span
        >
        <span>
          <Popconfirm :title="'是否确定删除?'" :ok-text="'确定'" :cancel-text="'取消'" placement="bottomLeft" @confirm="deleteComment(i, item.commentNo)">
            <a>{{ '删除' }}</a>
          </Popconfirm>
        </span>
      </template>
      <template #avatar>
        <Avatar :src="item.avatar" :alt="item.author" style="color: #f56a00; background-color: #fde3cf"> {{ item.author }} </Avatar>
      </template>
      <template #content>
        <p>
          {{ item.content }}
        </p>
      </template>
      <template #datetime>
        <Tooltip :title="item.datetime.format('YYYY-MM-DD HH:mm:ss')">
          <span>{{ item.datetime.fromNow() }}</span>
        </Tooltip>
      </template>
      <!--回复-->
      <Comment v-for="(replie, j) in item.replies" :key="replie.replyNo" :author="replie.author">
        <template #actions>
          <span>
            <Popconfirm :title="'是否确定删除?'" :ok-text="'确定'" :cancel-text="'取消'" placement="bottomLeft" @confirm="deleteReplie(i, j, replie.replyNo)">
              <a>{{ '删除' }}</a>
            </Popconfirm>
          </span>
        </template>
        <template #avatar>
          <Avatar :src="replie.avatar" :alt="replie.author" style="color: #00f514; background-color: #1890cc">
            {{ replie.author }}
          </Avatar>
        </template>
        <template #content>
          <p>
            {{ replie.content }}
          </p>
        </template>
        <template #datetime>
          <Tooltip :title="replie.datetime.format('YYYY-MM-DD HH:mm:ss')">
            <span>{{ item.datetime.fromNow() }}</span>
          </Tooltip>
        </template>
      </Comment>
    </Comment>
    <!-- 写评论 -->
    <Comment>
      <template #avatar>
        <Avatar :src="currentUser" :alt="WebUser.Name" style="color: #f56a00; background-color: #fde3cf">
          {{ WebUser.Name }}
        </Avatar>
      </template>
      <template #content>
        <FormItem>
          <Textarea
            id="comment-content"
            :auto-size="{ minRows: 4, maxRows: 5 }"
            :placeholder="'填写评论内容'"
            v-model:value="commentContent"
            type="textarea"
            showCount
            :maxlength="100"
            allow-clear:="true"
          />
        </FormItem>
        <FormItem>
          <Button html-type="submit" :loading="submitting" type="primary" shape="round" @click="submitComment"> {{ '发表评论' }} </Button>
        </FormItem>
      </template>
    </Comment>
  </div>
  <!-- 写回复 -->
  <Modal v-model:open="replyVisible" :title="'回复'" :ok-text="'确定'" :cancel-text="'取消'" v-if="currentCommentIndex !== null" show-cancel-button @ok="submitReply">
    <div style="padding: 4px 6px">
      <Textarea id="reply-content" :auto-size="{ minRows: 4, maxRows: 5 }" :placeholder="'填写回复内容'" v-model:value="replyContent" type="textarea" showCount :maxlength="100" />
    </div>
  </Modal>
</template>
<script lang="ts" setup>
  import { Textarea, Button, message, Comment, Tooltip, FormItem, Avatar, Modal, Popconfirm } from 'ant-design-vue';
  import dayjs, { Dayjs } from 'dayjs';
  import { ref, onMounted } from 'vue';
  import relativeTime from 'dayjs/plugin/relativeTime';
  import { FrmBBSs, FrmBBS } from '/@/CCFast/CCBill/Components/FrmBBS/FrmBBS';
  import WebUser from '/@/bp/web/WebUser';
  import { getAppEnvConfig } from '/@/utils/env';
  import DefaultUserIcon from '/@/assets/icons/default_user_icon.png';
  import { useI18n } from '/@/hooks/web/useI18n';

  dayjs.extend(relativeTime);

  const { t } = useI18n();
  const { VITE_GLOB_API_URL } = getAppEnvConfig();

  const basicPath = import.meta.env.MODE === 'development' ? '/api' : VITE_GLOB_API_URL;
  const avatarPath = `${basicPath}/DataUser/UserIcon/`;
  const currentUser = `${avatarPath}${WebUser.No}.png`;

  const commentList = ref<CommentItem[]>([]);
  const commentContent = ref('');
  const submitting = ref(false);
  const replyVisible = ref(false);
  const replyContent = ref('');
  const currentCommentIndex = ref<number | null>(null);
  const currentCommentNo = ref<string | undefined>(undefined);

  const props = defineProps<{
    params: Record<string, any>;
  }>();

  interface CommentItem {
    commentNo: string;
    author?: string;
    authorNo?: string;
    avatar: string;
    content: string;
    datetime: Dayjs;
    replies: ReplyItem[];
  }
  interface ReplyItem {
    replyNo: string;
    author?: string;
    authorNo?: string;
    avatar: string;
    content: string;
    datetime: Dayjs;
  }

  // 获取默认头像
  function defaultEmpIcon(e: any) {
    e.avatar = DefaultUserIcon;
    return false;
  }

  // 提交评论
  async function submitComment() {
    if (!commentContent.value.trim()) {
      message.warning('评论内容不能为空！');
      return;
    }
    submitting.value = true;
    try {
      const datetime = dayjs();
      const frmID = props.params.FrmID;
      const workID = props.params.workID || props.params.WorkID || props.params.PKVal;
      const en = new FrmBBS();
      en.SetValByKey('PKVal', `${frmID}_${workID}`);
      en.SetValByKey('ParentNo', 0);
      en.SetValByKey('WorkID', workID);
      en.SetValByKey('FrmID', frmID);
      en.SetValByKey('Docs', commentContent.value.trim());
      en.SetValByKey('RDT', datetime.format('YYYY-MM-DD HH:mm:ss'));
      await en.Insert();

      commentList.value.push({
        commentNo: en.No,
        author: en.RecName,
        authorNo: en.Rec,
        avatar: `${avatarPath}${en.Rec}.png`,
        content: commentContent.value.trim(),
        datetime,
        replies: [],
      });
      commentContent.value = '';
    } finally {
      submitting.value = false;
    }
  }

  // 删除评论及其回复
  async function deleteComment(index: number, commentNo?: string) {
    try {
      const en = new FrmBBS(commentNo);
      await en.Delete();

      const replies = commentList.value[index].replies;
      const deletePromises = replies.map((reply) => new FrmBBS(reply.replyNo).Delete());
      await Promise.allSettled(deletePromises);

      commentList.value.splice(index, 1);
      message.success('删除成功');
    } catch (e) {
      message.error(`${'删除失败，失败信息：'}${e}`);
    }
  }

  // 打开回复窗口
  function replyComment(index: number, commentNo?: string) {
    currentCommentIndex.value = index;
    replyVisible.value = true;
    currentCommentNo.value = commentNo;
  }

  // 提交回复
  async function submitReply() {
    if (!replyContent.value.trim()) {
      message.error('回复内容不能为空！');
      return;
    }
    try {
      const datetime = dayjs();
      const frmID = props.params.FrmID;
      const workID = props.params.workID || props.params.WorkID || props.params.PKVal;
      const en = new FrmBBS();
      en.SetValByKey('PKVal', `${frmID}_${workID}`);
      en.SetValByKey('ParentNo', currentCommentNo.value);
      en.SetValByKey('WorkID', workID);
      en.SetValByKey('FrmID', frmID);
      en.SetValByKey('Docs', replyContent.value.trim());
      en.SetValByKey('RDT', datetime.format('YYYY-MM-DD HH:mm:ss'));
      await en.Insert();

      const reply: ReplyItem = {
        replyNo: en.No,
        author: en.RecName,
        authorNo: en.Rec,
        avatar: `${avatarPath}${en.Rec}.png`,
        content: replyContent.value.trim(),
        datetime,
      };
      commentList.value[currentCommentIndex.value!].replies.push(reply);
      replyContent.value = '';
      currentCommentIndex.value = null;
      currentCommentNo.value = undefined;
      replyVisible.value = false;
    } catch (e) {
      message.error(`${t('generlist.tip.replyfail')}${e}`);
    }
  }

  // 删除回复
  async function deleteReplie(index: number, childIndex: number, replyNo?: string) {
    try {
      const en = new FrmBBS(replyNo);
      await en.Delete();
      commentList.value[index].replies.splice(childIndex, 1);
      message.success('删除成功');
    } catch (e) {
      message.error(`${'删除失败，失败信息：'}${e}`);
    }
  }

  // 加载评论及回复数据
  async function InitPage() {
    const ens = new FrmBBSs();
    const workID = props.params.workID || props.params.WorkID || props.params.PKVal;
    await ens.Retrieve('WorkID', workID, 'ParentNo', 0);
    if (ens.length === 0) {
      const pkVal = `${props.params.FrmID}_${workID}`;
      await ens.Retrieve('PKVal', pkVal, 'ParentNo', 0);
    }
    for (const [i, item] of ens.entries()) {
      commentList.value.push({
        commentNo: item.No,
        author: item.RecName,
        authorNo: item.Rec,
        avatar: `${avatarPath}${item.Rec}.png`,
        content: item.Docs,
        datetime: dayjs(item.RDT),
        replies: [],
      });

      const dtl = new FrmBBSs();
      await dtl.Retrieve('WorkID', workID, 'ParentNo', item.No);
      for (const reply of dtl) {
        commentList.value[i].replies.push({
          replyNo: reply.No,
          author: reply.RecName,
          authorNo: reply.Rec,
          avatar: `${avatarPath}${reply.Rec}.png`,
          content: reply.Docs,
          datetime: dayjs(reply.RDT),
        });
      }
    }
  }

  InitPage();
</script>
<style lang="less" scoped>
  :deep(.ant-input-affix-wrapper-textarea-with-clear-btn) {
    padding: 0 15px !important;
  }
  .comment-body {
    padding: 15px 20px;
    margin: 10px 0;
    border-radius: 12px;
    border: 2px solid #e0e0e0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    background-color: #f8f9fa;
    color: #333;
  }
  .ant-comment-inner {
    padding: 4px 0 !important;
  }
</style>
