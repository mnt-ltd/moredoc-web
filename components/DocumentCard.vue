<template>
  <div class="com-document-card">
    <nuxt-link :to="`/document/${document.id}`" class="el-link el-link--default">
      <h3>
        <img v-if="document.id>0" :src="`/static/images/${getIcon(document.ext)}_24.png`" />
        {{ document.title }}
      </h3>
    </nuxt-link>
    <el-row :gutter="10">
      <el-col :span="7" class="doc-cover">
        <nuxt-link :to="`/document/${document.id}`">
          <document-cover :document="document" :lazy="false" />
        </nuxt-link>
      </el-col>
      <el-col :span="17">
        <el-descriptions :column="1" border>
          <el-descriptions-item>
            <template slot="label">
              <i class="el-icon-user"></i>
              上传
            </template>
            <nuxt-link
              :to="`/user/${document.user_id}`"
              class="el-link el-link--primary"
            >{{ document.user && document.user.username }}</nuxt-link>
          </el-descriptions-item>
          <el-descriptions-item>
            <template slot="label">
              <i class="el-icon-coin"></i>
              价格
            </template>
            {{document.price || 0}} {{ settings.system.credit_name || '魔豆' }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template slot="label">
              <i class="el-icon-news"></i>
              大小
            </template>
            {{formatBytes(document.size)}}
          </el-descriptions-item>
          <el-descriptions-item>
            <template slot="label">
              <i class="el-icon-files"></i>
              页数
            </template>
            {{document.pages || '-'}} 页
          </el-descriptions-item>
        </el-descriptions>
      </el-col>
      <el-col :span="24" class="mgt">
        <el-descriptions :column="1" border>
          <el-descriptions-item>
            <template slot="label">
              <i class="el-icon-star-on"></i>
              评分
            </template>
            <div class="description">
              <el-rate
                v-model="score"
                disabled
                show-score
                text-color="#ff9900"
                score-template="{value}"
              ></el-rate>
            </div>
          </el-descriptions-item>
          <el-descriptions-item>
            <template slot="label">
              <i class="el-icon-tickets"></i>
              摘要
            </template>
            <div class="description">{{ document.description }}</div>
          </el-descriptions-item>
        </el-descriptions>
      </el-col>
    </el-row>
  </div>
</template>
  
  <script>
	import { formatBytes, getIcon } from '~/utils/utils'
	import { mapGetters } from 'vuex'
	export default {
		name: 'DocumentCard',
		props: {
			document: {
				type: Object,
				default: () => ({}),
			},
		},
		data() {
			return {
				score: 3,
			}
		},
		watch: {
			document: {
				handler: function (val) {
					this.score = val.score / 100 || 3
				},
				deep: true,
			},
		},
		computed: {
			...mapGetters('setting', ['settings']),
		},
		methods: {
			formatBytes,
			getIcon,
		},
	}
</script>
  
<style lang="scss">
	.com-document-card {
		h3 {
			margin-top: 0;
			img {
				height: 20px;
				vertical-align: middle;
				margin-top: -4px;
			}
		}
		.el-descriptions-item__label.is-bordered-label {
			width: 100px;
		}
		.doc-cover img {
			max-width: 130px;
		}
		.mgt {
			margin-top: 5px;
		}
		.description {
			// 只显示3行
			overflow: hidden;
			text-overflow: ellipsis;
			display: -webkit-box;
			-webkit-line-clamp: 4;
			-webkit-box-orient: vertical;
		}
	}
</style>
  