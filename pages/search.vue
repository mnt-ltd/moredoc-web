<template>
  <div class="page page-search">
    <el-row class="header-links hidden-xs-only">
      <el-col :span="24">
        <nuxt-link to="/" class="el-link el-link--default"
          ><i class="fa fa-home"></i> &nbsp;首页</nuxt-link
        >
        <el-popover width="520" trigger="hover">
          <CategoryCard :type="0"></CategoryCard>
          <nuxt-link
            slot="reference"
            class="el-link el-link--default"
            to="/category"
            >文库资料</nuxt-link
          >
        </el-popover>
        <el-popover width="520" trigger="hover">
          <CategoryCard :type="1"></CategoryCard>
          <nuxt-link
            slot="reference"
            class="el-link el-link--default"
            to="/article"
            >文章资讯</nuxt-link
          >
        </el-popover>
        <span class="float-right">
          <nuxt-link to="/upload" class="el-link el-link--default"
            ><i class="el-icon-upload2"></i>&nbsp;上传文档</nuxt-link
          >
          <nuxt-link to="/upload" class="el-link el-link--default"
            ><i class="el-icon-plus"></i>&nbsp;发布文章</nuxt-link
          >
          <nuxt-link
            v-if="user.id > 0"
            :to="`/user/${user.id}`"
            class="el-link el-link--default"
            ><i class="el-icon-user"></i>&nbsp;会员中心</nuxt-link
          >
          <nuxt-link v-else class="el-link el-link--default" to="/login"
            ><i class="el-icon-user"></i>&nbsp;登录账户</nuxt-link
          >
        </span>
      </el-col>
    </el-row>
    <div ref="searchBox" class="search-box">
      <el-row :gutter="20">
        <el-col :span="4" class="logo hidden-xs-only">
          <nuxt-link to="/" :title="settings.system.sitename"
            ><img
              :src="settings.system.logo || '/static/images/logo-empty.png'"
              style="max-width: 100%"
              :alt="settings.system.sitename"
          /></nuxt-link>
        </el-col>
        <el-col :span="14" class="search-form">
          <el-input
            v-model="query.wd"
            class="search-input"
            size="large"
            placeholder="请输入关键词"
            @keyup.enter.native="onSearch"
          >
            <!-- 加一个搜索前缀，搜索文章还是文档 -->
            <el-select
              slot="prepend"
              v-model="searchType"
              placeholder="请选择搜索类型"
              @change="changeSearchType"
            >
              <el-option
                v-for="item in categoryTypeOptions"
                :key="'st-' + item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
            <i
              slot="suffix"
              class="el-input__icon el-icon-search btn-search"
              @click="onSearch"
            ></i>
          </el-input>
        </el-col>
      </el-row>
    </div>
    <el-row :gutter="20">
      <template v-for="item in advertisements">
        <el-col
          v-if="item.position == 'search_top'"
          :key="item.position + item.id"
          :span="24"
        >
          <div v-html="item.content"></div>
        </el-col>
      </template>
      <el-col ref="searchMain" :span="18" class="search-main">
        <el-card v-loading="loading" shadow="never">
          <div v-if="!searchType" slot="header">
            <div class="search-filter">
              <el-dropdown :show-timeout="showTimeout">
                <el-button type="text" :size="filterSize">
                  {{ filterCategoryName(query.category_id)
                  }}<i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    v-for="item in [
                      { id: 0, title: '全部分类' },
                      ...categoryTrees.filter((item) => !item.type),
                    ]"
                    :key="'cate-' + item.id"
                    :value="item.id"
                  >
                    <nuxt-link
                      class="el-link el-link--default"
                      :class="
                        item.id == query.category_id ? 'el-link--primary' : ''
                      "
                      :to="{
                        query: { ...$route.query, category_id: item.id },
                      }"
                      >{{ item.title }}</nuxt-link
                    >
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <el-dropdown
                v-if="(settings.language || []).length > 0 && !searchType"
                :show-timeout="showTimeout"
              >
                <el-button type="text" :size="filterSize">
                  {{ filterLanguageName(query.language) }}
                  <i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    v-for="item in [
                      { code: '', language: '全部语言' },
                      ...(settings.language || []),
                    ]"
                    :key="'lang-' + item.code"
                    :value="item.code"
                  >
                    <nuxt-link
                      class="el-link el-link--default"
                      :class="
                        item.code == query.language ? 'el-link--primary' : ''
                      "
                      :to="{
                        query: { ...$route.query, language: item.code },
                      }"
                      >{{ item.language }}</nuxt-link
                    >
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <el-dropdown :show-timeout="showTimeout">
                <el-button type="text" :size="filterSize">
                  <img
                    v-if="query.ext != 'all' && query.ext != ''"
                    :src="`/static/images/${query.ext}_24.png`"
                    :alt="`${query.ext}文档`"
                  />
                  {{ filterExtName(query.ext)
                  }}<i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    v-for="item in searchExts"
                    :key="'se-' + item.value"
                  >
                    <nuxt-link
                      class="el-link el-link--default"
                      :class="item.value == query.ext ? 'el-link--primary' : ''"
                      :to="{
                        query: { ...$route.query, ext: item.value },
                      }"
                    >
                      <img
                        v-if="item.value != 'all' && item.value != ''"
                        :src="`/static/images/${item.value}_24.png`"
                        :alt="`${item.label}文档`"
                      />
                      {{ item.label }}</nuxt-link
                    >
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <el-dropdown :show-timeout="showTimeout">
                <el-button type="text" :size="filterSize">
                  {{ filterSortName(query.sort)
                  }}<i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    v-for="item in searchSorts"
                    :key="'ss-' + item.value"
                  >
                    <nuxt-link
                      class="el-link el-link--default"
                      :class="
                        item.value == query.sort ? 'el-link--primary' : ''
                      "
                      :to="{
                        query: { ...$route.query, sort: item.value },
                      }"
                      >{{ item.label }}</nuxt-link
                    >
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <el-dropdown :show-timeout="showTimeout">
                <el-button type="text" :size="filterSize">
                  {{ filterDurationName(query.duration) }}
                  <i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    v-for="item in durationOptions"
                    :key="'d-' + item.value"
                  >
                    <nuxt-link
                      class="el-link el-link--default"
                      :class="
                        item.value == query.duration ? 'el-link--primary' : ''
                      "
                      :to="{
                        query: { ...$route.query, duration: item.value },
                      }"
                      >{{ item.label }}</nuxt-link
                    >
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </div>
          <div class="search-tips">
            本次搜索耗时
            <span class="el-link el-link--danger">{{ spend || '0.000' }}</span>
            秒，为您找到相关结果约
            <span class="el-link el-link--danger">{{ total || 0 }}</span> 个.
          </div>
          <!-- <div class="search-result-none">没有搜索到内容...</div> -->
          <div class="search-result">
            <SearchResultArticle v-if="searchType === 1" :articles="articles" />
            <SearchResultDocument v-else :docs="docs" />
          </div>
          <el-pagination
            v-if="total > 0"
            :current-page="query.page"
            :page-size="query.size"
            :layout="
              isMobile
                ? 'total, prev, pager, next'
                : 'total, prev, pager, next, jumper'
            "
            :pager-count="isMobile ? 5 : 7"
            :small="isMobile"
            :total="total"
            @current-change="onPageChange"
          >
          </el-pagination>
        </el-card>
      </el-col>
      <el-col v-if="keywords.length > 0" :span="6" class="search-right">
        <div ref="searchRight" class="scroll">
          <el-card shadow="never">
            <div slot="header" class="clearfix">
              <span>相关搜索词</span>
            </div>
            <nuxt-link
              v-for="keyword in keywords"
              :key="'kw-' + keyword"
              :to="{
                path: '/search',
                query: {
                  wd: keyword,
                  page: 1,
                  size: 10,
                },
              }"
              class="el-link el-link--default"
              >{{ keyword }}</nuxt-link
            >
          </el-card>
        </div>
        <template v-for="item in advertisements">
          <div
            v-if="item.position == 'search_right'"
            :key="item.position + item.id"
            v-html="item.content"
          ></div>
        </template>
      </el-col>
    </el-row>
    <template v-for="item in advertisements">
      <div
        v-if="item.position == 'search_bottom'"
        :key="item.position + item.id"
        v-html="item.content"
      ></div>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getStats } from '~/api/config'
import { searchDocument } from '~/api/document'
import { searchArticle } from '~/api/article'
import {
  formatBytes,
  getIcon,
  formatRelativeTime,
  genTimeDuration,
} from '~/utils/utils'
import { datetimePickerOptions, categoryTypeOptions } from '~/utils/enum'
export default {
  data() {
    return {
      categoryTypeOptions,
      loading: false,
      query: {
        wd: this.$route.query.wd || '',
        page: 1,
        size: 10,
        ext: 'all', // 搜索类型
        sort: 'default', // 排序
        category_id: 0,
        duration: 'all',
      },
      searchExts: [
        { label: '全部格式', value: 'all' },
        { label: 'PDF', value: 'pdf' },
        { label: 'DOC', value: 'doc' },
        { label: 'PPT', value: 'ppt' },
        { label: 'XLS', value: 'xls' },
        { label: 'TXT', value: 'txt' },
        { label: '其他', value: 'other' },
      ],
      searchSorts: [
        { label: '默认排序', value: 'default' },
        { label: '最新排序', value: 'latest' },
        { label: '页数排序', value: 'pages' },
        // { label: '评分排序', value: 'score' },
        { label: '大小排序', value: 'size' },
        // { label: '下载排序', value: 'download_count' },
        // { label: '浏览排序', value: 'view_count' },
        // { label: '收藏排序', value: 'favorite_count' },
      ],
      durationOptions: [
        { label: '全部时间', value: 'all' },
        { label: '最近一天', value: 'day' },
        { label: '最近一周', value: 'week' },
        { label: '最近一个月', value: 'month' },
        { label: '最近三个月', value: 'three_month' },
        { label: '最近半年', value: 'half_year' },
        { label: '最近一年', value: 'year' },
      ],
      docs: [],
      articles: [],
      total: 0,
      spend: '',
      keywords: [],
      stats: {
        document_count: '-',
      },
      searchType: 0,
      searchLeftWidth: 0,
      searchRightWidth: 0,
      cardOffsetTop: 35,
      datetimePickerOptions,
      showTimeout: 50,
    }
  },
  head() {
    return {
      bodyAttrs: {
        class: 'search-page',
      },
      title: `${this.query.wd} - ${this.settings.system.title}`,
      meta: [
        {
          hid: 'keywords',
          name: 'keywords',
          content: `${this.query.wd},文档搜索,${this.settings.system.sitename},${this.settings.system.keywords}`,
        },
        {
          hid: 'description',
          name: 'description',
          content: this.settings.system.description,
        },
      ],
    }
  },
  computed: {
    ...mapGetters('user', ['user']),
    ...mapGetters('category', ['categoryTrees']),
    ...mapGetters('setting', ['settings']),
    filterSize() {
      return this.isMobile ? 'mini' : 'medium'
    },
  },
  watch: {
    '$route.query': {
      handler(val) {
        const query = {
          page: 1,
          size: 10,
          sort: 'default',
          ext: 'all',
          duration: 'all',
          ...val,
        }
        try {
          query.category_id = parseInt(query.category_id) || 0
        } catch (error) {
          console.log(error)
        }
        query.page = parseInt(query.page) || 1
        query.size = parseInt(query.size) || 10
        this.searchType = parseInt(query.type) || 0
        this.query = query
        this.execSearch()
      },
      immediate: true,
    },
  },
  created() {
    const query = { ...this.query, ...this.$route.query }
    query.page = parseInt(query.page) || 1
    query.size = parseInt(query.size) || 10
    try {
      query.category_id = parseInt(query.category_id) || 0
    } catch (error) {
      console.log(error)
    }
    this.query = query
    Promise.all([this.getStats(), this.getAdvertisements('search')])
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll)
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    formatBytes,
    formatRelativeTime,
    onSearch() {
      this.$router.push({
        path: '/search',
        query: {
          wd: this.query.wd,
          type: this.query.type,
          page: 1,
          size: 10,
          sort: 'default',
          ext: 'all',
          category_id: 0,
        },
      })
    },
    onFilter() {
      this.$router.push({
        path: '/search',
        query: {
          page: 1,
          size: 10,
          sort: 'default',
          ext: 'all',
          ...this.query,
        },
      })
    },
    changeSearchType(value) {
      if (!this.query.wd) {
        return
      }
      this.$router.push({
        path: '/search',
        query: {
          ...this.query,
          page: 1,
          size: 10,
          sort: 'default',
          type: value,
        },
      })
    },
    handleScroll() {
      if (this.isMobile) return
      const scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop
      const searchLeft = this.$refs.searchLeft
      const searchMain = this.$refs.searchMain
      const searchRight = this.$refs.searchRight
      const searchBox = this.$refs.searchBox

      if (searchLeft) {
        let maxHeight = 0
        try {
          maxHeight = searchMain.$el.offsetHeight - scrollTop - 70
        } catch (error) {
          console.log(error)
        }

        if (this.searchLeftWidth === 0) {
          this.searchLeftWidth = searchLeft.offsetWidth
          this.searchRightWidth = searchRight.offsetWidth
        }

        const fixed = 'fixed'
        const top = '105px'
        const zIndex = '100'
        if (scrollTop > this.cardOffsetTop) {
          searchLeft.style.position = fixed
          searchLeft.style.top = top
          searchLeft.style.zIndex = zIndex
          searchLeft.style.width = this.searchLeftWidth + 'px'
          if (maxHeight > 0) {
            searchLeft.style.maxHeight = maxHeight + 'px'
            searchRight.style.maxHeight = maxHeight + 'px'
          }

          searchRight.style.position = fixed
          searchRight.style.top = top
          searchRight.style.zIndex = zIndex
          searchRight.style.width = this.searchRightWidth + 'px'
          searchBox.style.top = '0'
          searchBox.style.position = fixed
          searchBox.style.zIndex = zIndex
        } else {
          searchLeft.style = null
          searchRight.style = null
          searchBox.style = null
        }
      }
    },
    async getStats() {
      const res = await getStats()
      if (res.status === 200) {
        this.stats = res.data
      }
    },
    execSearch() {
      const query = { ...this.query }
      if (!query.category_id) {
        delete query.category_id
      }
      query.created_at = genTimeDuration(query.duration)
      delete query.duration
      if (this.searchType === 1) {
        this.execSearchArticle(query)
      } else {
        this.execSearchDocument(query)
      }
    },
    async execSearchDocument(query) {
      this.loading = true
      const res = await searchDocument(query)
      this.loading = false
      if (res.status === 200) {
        this.total = res.data.total
        this.spend = res.data.spend
        const docs = res.data.document || []
        const keywords = []
        this.docs = docs.map((doc) => {
          doc.score = doc.score || 300
          doc.score = doc.score / 100
          doc.icon = getIcon(doc.ext)
          try {
            doc.keywords.split(',').map((keyword) => {
              keyword = keyword.trim()
              if (keyword && !keywords.includes(keyword)) {
                keywords.push(keyword)
              }
              return keyword
            })
          } catch (error) {}
          this.keywords = keywords
          return doc
        })
      }
      this.loading = false
    },
    async execSearchArticle(query) {
      const res = await searchArticle(query)
      if (res.status === 200) {
        this.total = res.data.total
        this.spend = res.data.spend
        const articles = res.data.article || []
        const keywords = []
        articles.map((article) => {
          try {
            article.keywords.split(',').map((keyword) => {
              keyword = keyword.trim()
              if (keyword && !keywords.includes(keyword)) {
                keywords.push(keyword)
              }
              return keyword
            })
          } catch (error) {}
          return article
        })
        this.keywords = keywords
        this.articles = articles
      }
    },
    onPageChange(page) {
      this.$router.push({
        path: '/search',
        query: {
          ...this.query,
          page,
        },
      })
    },
    filterCategoryName(id) {
      const category = this.categoryTrees.find((item) => item.id === id)
      return category ? category.title : '全部分类'
    },
    filterLanguageName(code) {
      const item = (this.settings.language || []).find(
        (item) => item.code === code
      )
      return item ? item.language : '全部语言'
    },
    filterSortName(value) {
      const sort = this.searchSorts.find((item) => item.value === value)
      return sort ? sort.label : '默认排序'
    },
    filterDurationName(value) {
      const duration = this.durationOptions.find((item) => item.value === value)
      return duration ? duration.label : '全部时间'
    },
    filterExtName(value) {
      const ext = this.searchExts.find((item) => item.value === value)
      return ext ? ext.label : '全部格式'
    },
  },
}
</script>
<style lang="scss">
.search-page {
  .layout-default {
    padding-top: 0;
    .el-main {
      padding-top: 0;
    }
  }
  .el-dropdown-menu__item {
    padding: 0;
    .el-link {
      padding: 0 20px;
      img {
        width: 16px;
        height: 16px;
        margin-right: 4px;
      }
    }
  }
}
.page-search {
  .el-select .el-input {
    width: 90px;
    padding: 0 15px;
    .el-input__suffix {
      right: 0;
      right: 25px;
    }
  }
  width: $max-width;
  & > .el-row {
    width: $default-width;
    max-width: $max-width;
    margin: 0 auto !important;
  }
  .header-links {
    padding: 0 10px;
    .el-link {
      line-height: 35px;
      margin-right: 10px;
    }
  }
  .search-box {
    padding: 20px 0;
    margin-bottom: 20px;
    background-color: #fff;
    width: 100%;
    & > .el-row {
      margin: 0 auto !important;
      width: $default-width;
      max-width: $max-width;
    }
    .el-cascader {
      width: 110px;
      height: 38px;
      line-height: 38px;
      .el-input__inner {
        height: 38px;
        line-height: 38px;
        border: 0;
      }
    }
    .el-input-group__append,
    .el-input-group__prepend {
      padding: 0 2px;
      background-color: #fff;
    }
    .search-input {
      margin-top: 5px;
    }
  }
  .scroll {
    overflow: auto;
    &::-webkit-scrollbar {
      width: 5px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: #ccc;
    }
    &::-webkit-scrollbar-thumb {
      border-radius: 3px;
    }
  }
  .search-right {
    a {
      display: inline-block;
      line-height: 30px;
      margin-right: 10px;
    }
  }
  .emptyblock {
    height: 1px;
  }
  .search-main {
    .el-card__header {
      font-weight: normal;
      font-size: 15px;
      line-height: 20px;
      padding: 10px 20px;
    }

    .el-card__body {
      padding-top: 0;
      padding-bottom: 10px;
      min-height: 540px;
    }
  }
  .search-tips {
    font-size: 14px;
    margin-top: 10px;
    color: #999;
    .el-link {
      position: relative;
      top: -2px;
    }
  }
  .search-filter {
    .el-dropdown {
      margin-right: 15px;
    }
    .el-button--text {
      color: #6b7a88;
      &:hover {
        color: #409eff;
      }
    }
    img {
      width: 14px;
      height: 14px;
      position: relative;
      top: 1px;
    }
  }
}

@media screen and (max-width: $mobile-width) {
  .page-search {
    .search-box {
      padding: 15px 0;
      margin-bottom: 15px;
      .search-form {
        width: 100% !important;
        padding-top: 55px;
      }
    }

    .search-left-col {
      padding-left: 0 !important;
      padding-right: 0 !important;
      width: 100%;
      a {
        display: inline-block;
        padding: 0 10px;
        line-height: 30px;
        font-size: 13px;
      }
    }
    .search-main {
      width: 100% !important;
      // margin-top: 15px;
      padding-left: 0 !important;
      padding-right: 0 !important;
      .el-card__body {
        min-height: unset;
      }
      .search-result li {
        padding-top: 0;
      }
      .el-card__header {
        font-size: 12px;
        .el-button--mini {
          font-size: 13px;
        }
      }
    }
    .search-filter {
      .el-dropdown {
        margin-right: 7px;
      }
    }
    .search-right {
      width: 100% !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
      margin-top: 15px;
    }
  }
}
</style>
