<template>
  <div class="com-form-download">
    <h3>您当前正在下载文档《{{ document.title }}》</h3>
    <el-form
      ref="formDownload"
      label-position="left"
      label-width="80px"
      :model="download"
    >
      <el-form-item class="download">
        <div>
          <el-radio
            v-for="item in typeOptions"
            :key="'dt-' + item.value"
            v-model="download.type"
            :label="item.value"
            size="medium"
            border
            >{{ item.label }}</el-radio
          >
        </div>
        <div class="tips mgt-20px code-tip" v-if="download.type === 2">
          <div v-html="settings.download.code_tip"></div>
        </div>
      </el-form-item>
      <template v-if="download.type === 0">
        <el-form-item class="qrcode">
          <div class="tips">您已购买当前文档，可直接下载</div>
          <el-row :gutter="15">
            <el-col :span="8" :xs="12">
              <img
                src="/static/images/qrcode.jpeg"
                style="max-width: 100%"
                alt=""
              />
            </el-col>
            <el-col :span="16" :xs="24">
              <div class="price-tip">
                支付金额：<span class="el-link el-link--danger">802.70</span> 元
              </div>
              <div>
                请用
                <span class="el-link el-link--success">
                  <img src="/static/images/icon-wepay.png" alt="微信支付" />
                  微信</span
                >
                /
                <span class="el-link el-link--primary">
                  <img src="/static/images/icon-alipay.png" alt="支付宝" />
                  支付宝</span
                >
                扫码支付
              </div>
              <div>
                登录用户购买文档后，<span
                  v-if="settings.download.free_download_duration"
                  >可在
                  <span class="el-link el-link--danger">{{
                    settings.download.free_download_duration || 0
                  }}</span>
                  天内，</span
                >可持续免费下载
              </div>
            </el-col>
          </el-row>
        </el-form-item>
      </template>
      <template v-else-if="download.type === 1">
        <div class="tips">
          <div>用户可免费下载自己上传的文档</div>
          <div>
            所有用户每个IP每天可以下载
            <span class="el-link el-link--danger">{{
              settings.download.times_every_ip || 0
            }}</span>
            篇文档
          </div>
          <div>
            每个登录用户每天可下载
            <span class="el-link el-link--danger">{{
              settings.download.times_every_day || 0
            }}</span>
            篇文档
          </div>
          <div>
            登录用户购买文档后，<span
              v-if="settings.download.free_download_duration"
              >可在
              <span class="el-link el-link--danger">{{
                settings.download.free_download_duration || 0
              }}</span>
              天内，</span
            >可持续免费下载
          </div>
          <div>
            下载当前文档需要
            <span class="el-link el-link--danger">{{
              document.price || 0
            }}</span>
            {{ settings.system.credit_name || '魔豆' }}
          </div>
        </div>
      </template>
      <template v-else-if="download.type === 2">
        <el-form-item
          label="下载码"
          prop="code"
          :rules="[
            {
              required: true,
              message: '请输入您的下载码',
              trigger: 'blur',
            },
          ]"
        >
          <el-input
            v-model="download.code"
            placeholder="请输入您的下载码"
          ></el-input>
        </el-form-item>
      </template>
      <el-form-item
        v-if="captcha.enable"
        label="验证码"
        prop="captcha"
        :rules="[
          {
            required: true,
            message: '请输入验证码',
            trigger: 'blur',
          },
        ]"
      >
        <div v-if="captcha.type == 'audio'">
          <el-row :gutter="15">
            <el-col :span="20">
              <audio controls="controls" :src="captcha.captcha"></audio>
            </el-col>
            <el-col :span="4">
              <el-tooltip placement="top" content="刷新语音验证码">
                <el-button
                  icon="el-icon-refresh"
                  class="btn-audio-refresh"
                  @click="loadCaptcha"
                ></el-button>
              </el-tooltip>
            </el-col>
          </el-row>
        </div>
        <div v-else>
          <el-tooltip placement="right" content="点击可刷新验证码">
            <img :src="captcha.captcha" class="pointer" @click="loadCaptcha" />
          </el-tooltip>
        </div>
        <el-input
          v-model="download.captcha"
          placeholder="请输入验证码"
        ></el-input>
      </el-form-item>
      <el-form-item class="download">
        <el-button
          type="primary"
          class="btn-block btn-download"
          icon="el-icon-download"
          :disabled="
            download.enable_code_download &&
            (document.price || 0) > (settings.download.max_price || 0)
          "
          @click="execDownload"
          :loading="downloading"
          >马上下载</el-button
        >
        <div
          v-if="
            download.enable_code_download &&
            (document.price || 0) > (settings.download.max_price || 0)
          "
        >
          <div class="tips mgt-20px">
            下载码只能免费下载价格不超过
            <span class="el-link el-link--danger">{{
              settings.download.max_price || 0
            }}</span>
            {{ settings.system.credit_name || '魔豆' }}的文档
          </div>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import { downloadDocument } from '~/api/document'
import { getUserCaptcha } from '~/api/user'
export default {
  name: 'FormDownload',
  props: {
    document: {},
  },
  data() {
    return {
      download: {
        enable_code_download: false,
        code: '',
        captcha: '',
        captcha_id: '',
        type: 0, // 0，付费下载，1，积分下载，2，下载码下载
      },
      captcha: {
        enable: false,
      },
      downloading: false,
      activeTab: 'direct',
      typeOptions: [
        {
          label: '付费下载',
          value: 0,
        },
        {
          label: '积分下载',
          value: 1,
        },
        {
          label: '下载码下载',
          value: 2,
        },
      ],
    }
  },
  created() {
    this.loadCaptcha()
  },
  computed: {
    ...mapGetters('setting', ['settings']),
  },
  methods: {
    ...mapActions('user', ['getUser']),
    async execDownload() {
      this.$refs.formDownload.validate(async (valid) => {
        if (valid) {
          this.downloading = true
          const res = await downloadDocument({
            id: this.document.id,
            code: this.download.code,
            captcha: this.download.captcha,
            captcha_id: this.download.captcha_id,
          })
          if (res.status === 200) {
            this.getUser()
            this.$emit('success')
            // 跳转下载
            window.location.href = res.data.url
          } else {
            this.loadCaptcha()
            this.$message.error(res.data.message || '下载失败')
          }
          this.downloading = false
        }
      })
    },
    async loadCaptcha() {
      const res = await getUserCaptcha({ type: 'download', t: Date.now() })
      if (res.data.enable) {
        // 启用了验证码
        this.download = {
          ...this.download,
          captcha_id: res.data.id,
        }
        this.captcha = res.data
      }
    },
  },
}
</script>
<style lang="scss">
.com-form-download {
  .tips {
    margin-bottom: 20px;
    border: 1px dashed #f60;
    padding: 15px 20px;
    border-radius: 4px;
    line-height: 24px;
    .el-link {
      cursor: auto;
      position: relative;
      top: -2px;
    }
  }
  .price-tip {
    font-size: 20px;
    margin: 10px 0;
  }
  .code-tip {
    margin-bottom: 0;
  }
  .btn-audio-refresh {
    vertical-align: -webkit-baseline-middle;
  }
  .download {
    .el-form-item__content {
      margin-left: 0 !important;
    }
  }
  .el-radio {
    margin-right: 10px;
  }
  .qrcode {
    .el-form-item__content {
      margin-left: 0 !important;
    }
    .el-link {
      position: relative;
      top: -2px;
      img {
        width: 18px;
        position: relative;
        top: 1px;
        margin-right: 3px;
      }
      &.el-link--danger {
        font-size: 25px;
        top: -1px;
      }
    }
  }
}
</style>
