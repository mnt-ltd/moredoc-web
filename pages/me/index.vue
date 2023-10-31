<template>
  <div>
    <user-dynamic :user-id="user.id" />
  </div>
</template>
<script>
export default {
  props: {
    user: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {}
  },
}
</script>
