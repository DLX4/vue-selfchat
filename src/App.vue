<template>
  <div id="app">
    <div class="sidebar">
      <mycard></mycard>
    </div>
    <div class="main">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
const mycard = () => import("./components/mycard/Mycard");
import { mapActions, mapGetters } from "vuex";

export default {
  components: {
    mycard
  },
  data() {
    return {};
  },
  created() {
    this.$store.dispatch("initData");
  },
  computed: {
    ...mapGetters(["selectedChat"])
  }
};
</script>

<style lang="stylus" scoped>
  #app {
    display: flex;
    border-radius: 50px;
    margin: 0px;
    padding: 3% 15%;
    height: 600px;

    .sidebar {
      width: 60px;
      height: 600px;
      background: #2b2c2f;
    }

    .main {
      flex: 1;
      height: 600px;
      background: #f2f2f2;
    }
  }
</style>
