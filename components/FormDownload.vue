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
            v-model="download.payment_type"
            :label="creditDownload"
            size="medium"
            border
            >积分下载</el-radio
          >
          <el-radio
            v-model="download.payment_type"
            :label="codeDownload"
            v-if="settings.download.enable_code_download"
            size="medium"
            border
            >下载码下载</el-radio
          >
        </div>
        <div class="tips mgt-20px code-tip">
          <template v-if="download.payment_type === codeDownload">
            <div v-if="settings.download.enable_code_download &&
                (document.price || 0) > (settings.download.max_price || 0)
              "
            >
              下载码只能免费下载价格不超过
              <span class="el-link el-link--danger">{{
                settings.download.max_price || 0
              }}</span>
              {{ settings.system.credit_name || '魔豆' }}的文档
            </div>
            <div v-else v-html="settings.download.code_tip"></div>
          </template>
          <div v-if="download.payment_type===creditDownload">
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
        </div>
      </el-form-item>
      <template v-if="download.payment_type === codeDownload">
        <el-form-item
          label="下载码"
          prop="downcode"
          :rules="[
            {
              required: true,
              message: '请输入您的下载码',
              trigger: 'blur',
            },
          ]"
        >
          <el-input
            v-model="download.downcode"
            placeholder="请输入您的下载码"
          ></el-input>
        </el-form-item>
      </template>
      <el-form-item class="download">
        <el-button
          type="primary"
          class="btn-block btn-download"
          icon="el-icon-download"
          :disabled="
            download.payment_type === 9 &&
            settings.download.enable_code_download &&
            (document.price || 0) > (settings.download.max_price || 0)
          "
          @click="execDownload"
          :loading="downloading"
          >马上下载</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import { downloadDocument } from '~/api/document'
import { payOrder } from '~/api/order'
export default {
  name: 'FormDownload',
  props: {
    document: {
      type: Object,
      default: () => ({}),
    },
    order_no: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      downloading: false,
      activeTab: 'direct',
      creditDownload: 5,
      codeDownload: 9, 
      download: {
        payment_type: 5, // 默认
        order_no: this.order_no,
        downcode: '',
        is_wap: this.isMobile,
      },
    }
  },
  computed: {
    ...mapGetters('setting', ['settings']),
  },
  methods: {
    ...mapActions('user', ['getUser']),
    async execDownload(){
      this.downloading = true
      let res = await payOrder(this.download)
      this.downloading = false
      if (res.status !== 200) {
        this.$message.error(res.data.message || '下载失败')
        return
      }

      res = await downloadDocument({ id: this.document.id })
      if (res.status === 200) {
        location.href = res.data.url
        this.$emit('success')
      } else {
        this.$message.error(res.data.message || '下载失败')
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
