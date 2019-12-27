<template>
  <div class="image-msg pointer">
    <!--<p>图片消息(点击预览)</p>-->
    <img style="max-width: 300px; max-height: 300px; border-radius: 3px"
         @click="visible = true"
         preview="0"
         :src="msg.picUrl || msg.srcUrl"></img>

  </div>
</template>

<script>

/**
 * 图片类型消息显示
 */
export default {
  name: "ImageMsg",

  props: {
    msg: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      visible: false
    };
  },
  methods: {}
};
</script>

<style scoped>
.audio-msg .el-icon-service {
  font-size: 18px;
  cursor: pointer;
}
</style>
