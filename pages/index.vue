<template>
  <div v-loading="loading" style="min-height: 100vh">
    <HomeV1 v-if="settings.display.home_version === 'v1'" />
    <HomeV2 v-else-if="settings.display.home_version === 'v2'" />
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import HomeV1 from '~/components/home/v1.vue'
import HomeV2 from '~/components/home/v2.vue'

export default {
  components: {
    HomeV1,
    HomeV2,
  },
  computed: {
    ...mapGetters('setting', ['settings']),
    loading() {
      return !(
        this.settings.display.home_version === 'v1' ||
        this.settings.display.home_version === 'v2'
      )
    },
  },
}
</script>
