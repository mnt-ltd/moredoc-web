<template>
  <div>
    <user-article :user-id="user.id" />
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
}
</script>
