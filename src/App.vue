<template>
  <div id="app">

    <DeepseekChat />
  </div>
</template>

<script>
import DeepseekChat from './components/DeepseekChat.vue'

export default {
  name: 'App',
  components: {
    DeepseekChat
  },
  created() {
    document.title = '微微小助手'
  }
}
</script>

<style>
#app {
  height: 100vh;
  padding: 20px;
}
</style> 