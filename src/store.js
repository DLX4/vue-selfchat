import Vue from 'vue'
import Vuex from 'vuex'
import CacheUtil from '@/utils/cache-util';
Vue.use(Vuex)
import ChatApi from '@/api/chat-api';
import WsApi from './api/ws-api';
// 一个独立的Vue实例，可用于调用ElementUI的某些方法
let elVue = new Vue();

const state = {
  // 输入的搜索值
  searchText: '',
  // 当前登录用户
  user: {
    name: '客服',
    avatar: 'static/images/UserAvatar.jpg'
  },
  reachable: true,
  // 对话好友列表
  chatlist: [],
  // 得知当前选择的是哪个对话
  selectId: 1,
  // 与当前选中好友的聊天记录
  selectedMsgs: [],
  online: true,
  // onlineState: "离线",
  // 输入内容的草稿
  drafts: {},
  inputContent: ""
}

const mutations = {
  // 从localStorage 中获取数据
  initData(state, chatlistData) {
    state.chatlist = chatlistData;
  },
  // 当前选中的联系人对应的聊天记录
  setSelectedMsgs(state, msg) {
    state.selectedMsgs = msg;
  },
  // 获取搜索值
  search(state, value) {
    state.searchText = value
  },
  // 得知用户当前选择的是哪个对话。便于匹配对应的对话框
  selectSession(state, value) {
    state.selectId = value;
  },
  // setReachable(state, v) {
  //   state.reachable = v;
  // },
  // reachableChange(state, msg) {
  //   console.log("收到用户可达性变更事件", msg);
  //   let chatItem = state.chatlist.find(c => c.openId === msg.openId);
  //   if (chatItem) {
  //     chatItem.reachable = msg.reachable;
  //   }
  // },
  addNewChatItem(state, item) {
    if (!state.chatlist.find(c => c.openId === item.openId)) {
      state.chatlist.unshift(item);
    }
  },
  // 给当前会话添加新消息
  addNewMsg(state, msg) {
    if (state.selectId !== msg.openId) {
      return;
    }
    if (msg.createTime && !(msg.createTime instanceof Date)) {
      if (typeof msg.createTime === "string") {
        msg.createTime = new Date(msg.createTime);
      } else if (typeof msg.createTime === "number") {
        // 微信回调的时间戳是以秒为单位的
        msg.createTime = new Date(msg.createTime * 1000);
      }
    }
    state.selectedMsgs.push(msg);
    CacheUtil.setWithTime("msgs:" + state.selectId, state.selectedMsgs);
  },
  loadMoreNewMsg(state, msgs) {
    // 将新加载的消息加到消息的头部
    state.selectedMsgs.unshift(...msgs);
  },
  updateChatItem(state, msg) {
    // 有新消息时更新列表
    let index = -1;
    let item;
    for (let i = 0; i < state.chatlist.length; i++) {
      let tmp = state.chatlist[i];
      if (tmp.openId === msg.openId) {
        index = i;
        item = tmp;
        break;
      }
    }
    if (!item) {
      return;
    }
    item.lastMsgContent = msg.content;
    if (msg.msgType !== "text") {
      item.lastMsgContent = msg.msgName;;
    }
    item.lastMsgDate = msg.createTime;
    // 如果不是当前选中的人，则未读数量加一
    if (msg.sendType === "REC" && state.selectId !== msg.openId) {
      item.unreadNum++;
    }
    state.chatlist.splice(index, 1);
    state.chatlist.unshift(item);
  },
  setInputContent(state, c) {
    state.inputContent = c;
  },
  addDraft(state, draft) {
    state.drafts[draft.openId] = draft.content;
  }
}
const getters = {
  // 筛选出含有搜索值的聊天列表
  searchedChatlist(state) {
    return state.chatlist.filter(item =>
      item.displayName &&
      // item.reachable == state.reachable &&
      item.displayName.includes(state.searchText));
  },
  // 通过当前选择是哪个对话匹配相应的对话
  selectedChat(state) {
    return state.chatlist.find(item => item.openId === state.selectId);
  }
}

const actions = {
  search: ({
    commit
  }, value) => {
    setTimeout(() => {
      commit('search', value)
    }, 100)
  },
  selectSession: ({
    commit
  }, value) => {
    commit('selectSession', value);
    if (value) {
      ChatApi.setRead(value).then(() => {
        let item = state.chatlist.find(item => item.openId === value);
        item && (item.unreadNum = 0);
      }).catch(e => elVue.$alert(e || "置为已读出错"));
    }
  },
  send: ({
    commit
  }) => commit('send'),

  setDefaultSelect({
    state,
    dispatch,
    commit
  }) {
    // 设置默认选中第一个
    let item = state.chatlist[0];
    if (item) {
      dispatch('selectSession', item.openId)
    } else {
      commit("setSelectedMsgs", []);
      dispatch('selectSession', "");
    }
  },
  initData: ({
    commit,
    dispatch
  }) =>   {
    console.log("-------------")
    ChatApi.getTopicList().then(rsp => {
      console.log(rsp)
      commit("initData", rsp.content);
    })
  },

  initChatHistory({
    commit,
  }, id) {
    if (!id) {
      return;
    }
    ChatApi.getRecordsByOpenId(id).then(msgs => {
      commit("setSelectedMsgs", msgs);
    }).catch(e => {
      console.log(e);
    });
  }
}
const store = new Vuex.Store({
  state,
  mutations,
  getters,
  actions
})

store.watch(
  (state) => state.selectId,
  (val, old) => {
    store.commit("addDraft", {
      openId: old,
      content: store.state.inputContent
    });
    let draft = store.state.drafts[val];
    store.commit("setInputContent", draft);
    store.dispatch("initChatHistory", val);
  }, {
    deep: true
  }
)
export default store;
