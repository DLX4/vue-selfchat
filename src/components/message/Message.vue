<!-- 消息框 -->
<template>
  <div class="message">
    <header class="header">
      <el-row :gutter="20">
        <el-col :span="18">
          <div class="friendname">{{selectedChat && selectedChat.name || "_"}}</div>
        </el-col>
        <el-col :span="6"
                style="text-align: right">
          <el-row :gutter="0">
            <!--<el-col :span="1"-->
                    <!--:offset="2">-->
              <!--<breathing-lamp :color="online?'green':'gray'"></breathing-lamp>-->
            <!--</el-col>-->
            <el-col :span="16"
                    :offset="5">
              <div class="friendname"
                   style="text-align:left">{{onlineState}}</div>
            </el-col>
          </el-row>
        </el-col>
      </el-row>

    </header>
    <div class="message-wrapper"
         ref="list">
      <ul class="message-ul"
          v-if="selectedChat">
        <li v-for="item in selectedMsgs"
            :key="item.msgId"
            class="message-item">
          <div class="time"><span>{{item | time}}</span></div>
          <div class="main"
               v-if="!item.isEvent"
               :class="{ self: item.onRight }">

            <avatar class="avatar" :username="item.content"
                    :size="36"
                    :rounded="false"
                    color="#fff"
            ></avatar>
            <div v-if="item.msgType === 'TEXT'" class="content">
              <div class="text"
                   v-html="format(item)"></div>
            </div>

            <image-msg v-if="item.msgType === 'IMAGE'"
                       :msg="item"></image-msg>
            <voice-msg :msg="item"
                       v-if="item.msgType === 'VOICE'"></voice-msg>
            <video-msg :msg="item"
                       v-if="item.msgType === 'VIDEO' || item.msgType === 'SHORTVIDEO'"></video-msg>
            <link-msg :msg="item"
                      v-if="item.msgType === 'LINK'"></link-msg>
            <location-msg :msg="item"
                          v-if="item.msgType === 'LOCATION'"></location-msg>
            <news-msg :msg="item"
                      v-if="item.msgType === 'NEWS'"></news-msg>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState, mapMutations } from "vuex";
import Avatar from "vue-avatar";
import { replaceEmoji } from "../../utils/emoji-util.js";
// const BreathingLamp = () => import("../common/BreathingLamp");
const VoiceMsg = () => import("./VoiceMsg");
const VideoMsg = () => import("./VideoMsg");
const ImageMsg = () => import("./ImageMsg");
const LinkMsg = () => import("./LinkMsg");
const LocationMsg = () => import("./LocationMsg");
const NewsMsg = () => import("./NewsMsg");
import FormatUtil from "../../utils/format-util.js";
const REACHABLE_SEC = 48 * 60 * 60;
import ChatApi from "@/api/chat-api";
export default {
  name: "Message",
  components: {
    VoiceMsg,
    VideoMsg,
    ImageMsg,
    LinkMsg,
    LocationMsg,
    NewsMsg,
    Avatar
  },
  data() {
    return { loading: false };
  },
  mounted() {
    this.scrollUp();
    // 通过$refs获取dom元素
    let box = this.$refs.list; // 监听这个dom的scroll事件
    box.addEventListener(
      "scroll",
      () => {
        //可滚动容器超出当前窗口显示范围的高度
        if (box.scrollTop < 10) {
          //加载更多操作
          if (!this.loading) {
            this.loadMore(box);
          }
        }
      },
      false
    );
  },
  methods: {
    ...mapMutations(["loadMoreNewMsg", "setMsgOnRight"]),
    loadMore(box) {
      let first = this.selectedMsgs[0];
      let firstCreateTime = first && first.createTime;
      this.loading = true;
      ChatApi.getRecordsByTopicId(this.selectTopicId, firstCreateTime)
        .then(rs => {
          if (rs && rs.length) {
            // 保存加载前的高度
            let scrollHeight = box.scrollHeight;
            this.loadMoreNewMsg(rs);
            this.setMsgOnRight();
            this.$nextTick(() => {
              // 加载完回到之前滚去的位置上
              box.scrollTop = box.scrollHeight - scrollHeight;
            });
          }
        })
        .catch(e => {
          console.log("加载更多聊天记录失败", e);
          this.$alert("加载更多聊天记录失败");
        })
        .finally(() => (this.loading = false));
    },
    isSelf(sendType) {
      return (
        sendType &&
        (sendType.toUpperCase() === "SEND" ||
          sendType.toUpperCase() === "AUTO_REPLY")
      );
    },
    format(msg) {
      msg.content = msg.content.replace(/\n/g, "<br>");
      msg.content = msg.content.replace(/ /g, "&nbsp;");
      return replaceEmoji(msg.content);
    },
    scrollUp() {
      let vue = this;
      setTimeout(() => {
        vue.$refs.list.scrollTop = vue.$refs.list.scrollHeight;
      }, 500);
    }
  },
  computed: {
    ...mapGetters(["selectedChat", "allReachable"]),
    ...mapState(["user", "selectedMsgs", "online", "onlineState", "selectTopicId"])
  },
  watch: {
    // 发送信息后,让信息滚动到最下面
    selectedMsgs: {
      handler() {
        if (!this.loading) {
          this.scrollUp();
        }
      },
      deep: true
    }
  },
  filters: {
    time(item) {
      if (!item) {
        return "";
      }
      let date;
      if (item.createTime instanceof Date) {
        date = item.createTime;
      } else if (typeof item.createTime === "number") {
        // 微信回调的时间戳是以秒为单位的
        date = new Date(item.createTime * 1000);
      } else if (typeof item.createTime === "string") {
        date = new Date(item.createTime);
      }
      // 当天的只显示小时分钟
      if (date.toDateString() === new Date().toDateString()) {
        if(date.getMinutes() <10 ){
          return date.getHours() + ':0' +date.getMinutes();
        } else {
          return date.getHours() + ':' + date.getMinutes();
        }
      }
      // 非当天的显示年月日小时分钟
      else {
        return FormatUtil.format(date);
      }

    }
  }
};
</script>

<style lang="stylus" scoped>
.message {
  width: 100%;
  height: 450px;

  .header {
    height: 60px;
    padding: 28px 0 0 30px;
    box-sizing: border-box;
    border-bottom: 1px solid #e7e7e7;

    .friendname {
      font-size: 18px;
    }
  }

  .message-wrapper {
    min-height: 390px;
    max-height: 390px;
    padding: 10px 15px;
    box-sizing: border-box;
    overflow-y: auto;
    border-bottom: 1px solid #e7e7e7;

    .message-ul {
      margin-bottom: 15px;
    }

    .time {
      width: 100%;
      font-size: 12px;
      margin: 7px auto;
      text-align: center;

      span {
        display: inline-block;
        padding: 4px 6px;
        color: #fff;
        border-radius: 3px;
        background-color: #dcdcdc;
      }
    }

    .main {
      .avatar {
        float: left;
        margin: 0 15px;
        border-radius: 3px;
      }

      .content {
        display: inline-block;
        position: relative;
        padding: 6px 10px;
        max-width: 330px;
        min-height: 36px;
        line-height: 24px;
        box-sizing: border-box;
        font-size: 14px;
        text-align: left;
        word-break: break-all;
        background-color: #fafafa;
        border-radius: 4px;

        &:before {
          content: ' ';
          position: absolute;
          top: 12px;
          right: 100%;
          border: 6px solid transparent;
          border-right-color: #fafafa;
        }
      }
    }

    .self {
      text-align: right;

      .avatar {
        float: right;
        margin: 0 15px;
      }

      .content {
        background-color: #b2e281;

        &:before {
          right: -12px;
          vertical-align: middle;
          border-right-color: transparent;
          border-left-color: #b2e281;
        }
      }
    }
  }
}
</style>
