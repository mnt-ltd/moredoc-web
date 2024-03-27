import { advertisementPositions } from '~/utils/enum'
import { getAdvertisementByPosition } from '~/api/advertisement'
export default {
  data() {
    return {
      isMobile: false,
      isPad: false,
      isPC: true,
      advertisementPositions,
      advertisements: [], // 广告
      footerTop: 0, // footer距离顶部的高度
    }
  },
  mounted() {
    this.handleScreenResize()
    this.setFooterTop()
    window.addEventListener('resize', this.handleScreenResize)
    window.addEventListener('scroll', this.setFooterTop)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleScreenResize)
    window.removeEventListener('scroll', this.setFooterTop)
  },
  methods: {
    handleScreenResize() {
      const width = document.body.clientWidth
      if (width < 768) {
        this.isMobile = true
        this.isPad = false
        this.isPC = false
      } else if (width < 992) {
        this.isMobile = false
        this.isPad = true
        this.isPC = false
      } else {
        this.isMobile = false
        this.isPad = false
        this.isPC = true
      }
    },
    async getAdvertisements(page) {
      // 如果用户是VIP用户，则不获取广告
      try {
        if (this.$store.state.user.user.is_vip) {
          this.advertisements = []
          return
        }
      } catch (error) {

      }
      const positions = []
      this.advertisementPositions.map((item) => {
        if (item.value === page) {
          ;(item.children || []).map((child) => {
            positions.push(child.value)
          })
        }
      })
      const res = await getAdvertisementByPosition({
        position: positions,
      })
      if (res.status === 200) {
        this.advertisements = res.data.advertisement || []
      }
    },
    setFooterTop() {
      try {
        this.footerTop = document
          .querySelector('footer')
          .getBoundingClientRect().top
      } catch (error) {
        // console.log(error)
      }
    },
  },
}
