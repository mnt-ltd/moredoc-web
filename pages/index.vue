<template>
  <div v-loading="loading" style="min-height: 100vh">
    <HomeV1 v-if="settings.display.home_version === 'v1'" />
    <HomeV2 v-else-if="settings.display.home_version === 'v2'" />
  </div>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
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
