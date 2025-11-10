<template>
  <div class="bg_choose_register">
    <div class="choose_register">
      <!-- 选择注册方式 -->
      <div class="choose_way">
        <PageHeader :title="'请选择注册方式'" />
        <div>{{'我们提供三种注册模式'}}</div>
        <Tabs v-model:activeKey="activeKey">
          <TabPane key="1" :tab="'模式1：网站账户注册'">
            <ul>
              <li class="register_content">普通的注册方式，输入账号，企业信息进行注册.</li>
              <li class="register_content"
                ><a
                  @click="
                    () => {
                      router.push('/Register');
                    }
                  "
                  style="color: #1890ff; font-weight: 700"
                  >点击这里开始注册</a
                ></li
              >
            </ul>
          </TabPane>
          <TabPane key="2" :tab="'模式2：从企业微信商城注册'" force-render>
            <ul>
              <li class="register_content">{{'在PC上下载企业微信端，并使用管理员登录。'}}</li>
              <li class="register_content"
                >点击:<a
                  @click="
                    () => {
                      message.warning('暂未开放');
                    }
                  "
                  style="color: #1890ff; font-weight: 700"
                >
                  请点击这里
                </a>
              </li>
              <li class="register_content">{{'按照步骤执行添加安装,进入系统后，完善与修改人员、部门信息。'}}</li>
            </ul>
          </TabPane>
          <TabPane key="3" :tab="'模式3：从钉钉商城注册(未开放)'">
            <ul>
              <li class="register_content">{{'在PC上下载钉钉PC端，并使用管理员登录。'}}</li>
              <li class="register_content"
                >点击:<a
                  @click="
                    () => {
                      message.warning('暂未开放');
                    }
                  "
                  style="color: #1890ff; font-weight: 700"
                >
                  请点击这里
                </a>
              </li>
              <li class="register_content">{{'按照步骤执行添加安装,进入系统后，完善与修改人员、部门信息。'}}</li>
            </ul>
          </TabPane>
        </Tabs>
      </div>
      <div>
        <PageHeader :title="'已有帐号,我要登录'" />
        <div>
          <a
            @click="
              () => {
                router.push('/OpLogin');
              }
            "
            style="color: #1890ff; font-weight: 700"
            >登录</a
          >
        </div>
      </div>
      <div>
        <PageHeader :title="'特别声明'" />
        <ul>
          <li class="register_content"> 1. {{ VITE_GLOB_SX_TITLE }}BPM不提供saas服务，仅仅提供saas模式的测试，应用{{ VITE_GLOB_SX_TITLE }}bpm需要本地化部署。</li>
          <li class="register_content"> 2. {{ VITE_GLOB_SX_TITLE }}BPM分为：单组织版、集团版、SAAS版本. 前端分为：H5、vue2、vue3版本。</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { PageHeader, Tabs, TabPane, message } from 'ant-design-vue';
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { getAppEnvConfig } from '/@/utils/env';
  const { VITE_GLOB_SX_TITLE } = getAppEnvConfig();
  const router = useRouter();

  const activeKey = ref('1');
</script>
<style lang="less" scoped>
  .bg_choose_register {
    .choose_register {
      background: #f5f5f5;
      width: 800px;
      margin: 0 auto;
      margin-top: 60px;
      padding: 40px 50px;
      box-shadow: 0 0 5px 2px #dedede;
      .ant-page-header {
        padding: 10px 0;
      }
      .register_content {
        margin: 5px 0;
      }
    }
  }
</style>
