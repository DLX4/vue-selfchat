<!-- 聊天列表 -->
<template>
  <div class="msglist">
    <ul>
      <li v-for="item in searchedChatlist"
          class="sessionlist"
          :class="{ active: item.topicId === selectTopicId }"
          @click="selectSession(item.topicId)">
        <div class="list-left">
          <el-badge :value="item.unreadNum"
                    :hidden="!item.unreadNum"
                    :max="99"
                    class="item">
            <avatar class="avatar" :username="item.name"
                    :size="42"
                    :rounded="false"
                    color="#fff"
            ></avatar>

          </el-badge>
        </div>
        <div class="list-right">
          <p class="name"
             :title="item.name">{{item.name}}</p>
          <span class="time">{{item.lastMsgTime | time}}</span>
          <p class="lastmsg"
             v-html="content(item)"></p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
import Avatar from "vue-avatar";
import FormatUtil from "../../utils/format-util.js";
export default {
  name: "ChatList",
  components: {
    Avatar
  },
  computed: {
    ...mapState(["selectTopicId", "searchText", "drafts"]),
    ...mapGetters(["searchedChatlist"])
  },
  methods: {
    ...mapActions(["selectSession"]),
    content(item) {
      let draft = this.drafts[item.id];
      if (draft) {
        return `<span><span style='color: red' title=${draft}>[草稿]</span>
            ${draft}</span>`;
      } else {
        let c = item.lastMsgContent;
        return `<span title=${c}>${c}</span>`;
      }
    }
  },
  filters: {
    // 将日期过滤为 hour:minutes
    time(date) {
      return FormatUtil.displayTime(date);
    },
    fixLeng(txt) {
      return FormatUtil.fixLength(txt, 5);
    }
  }
};
</script>

<style lang="stylus" scoped>
.msglist {
  height: 540px;
  overflow-y: auto;

  .sessionlist {
    display: flex;
    padding: 12px;
    transition: background-color 0.1s;
    font-size: 0;

    &:hover {
      background-color: rgb(220, 220, 220);
    }

    &.active {
      background-color: #c4c4c4;
    }

    .avatar {
      border-radius: 2px;
    }

    .el-badge__content.is-fixed {
      top: 4px;
      right: 15px;
    }

    .list-right {
      position: relative;
      flex: 1;
      margin-top: 4px;
      margin-left: 12px;
    }

    .name {
      display: inline-block;
      vertical-align: top;
      font-size: 14px;
      width: 60%;
      text-overflow: ellipsis;
      white-space: nowrap;
      position: absolute;
    }

    .time {
      float: right;
      color: #999;
      font-size: 10px;
      vertical-align: top;
    }

    .lastmsg {
      position: absolute;
      font-size: 12px;
      height: 15px;
      line-height: 15px;
      color: #999;
      bottom: 4px;
      white-space: nowrap;
      width: 100%;
      text-overflow: ellipsis;
    }
  }
}
</style>

