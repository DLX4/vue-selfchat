import Vue from 'vue'
import Vuex from 'vuex'
import CacheUtil from '@/utils/cache-util';
Vue.use(Vuex)
import ChatApi from '@/api/chat-api';

const state = {
  // 输入的搜索值
  searchText: '',
  reachable: true,
  // 对话好友列表
  chatlist: [],
  // 得知当前选择的是哪个对话
  selectTopicId: 1,
  // 与当前选中好友的聊天记录
  selectedMsgs: [],
  online: true,
  // onlineState: "离线",
  // 输入内容的草稿
  drafts: {},
  inputContent: ""
}

const mutations = {
  // 初始化聊天话题列表
  initData(state, chatlistData) {
    state.chatlist = chatlistData;
  },
  // 消息显示在左边还是右边
  setMsgOnRight(state) {
    // 初始化消息是左边显示还是右边显示
    let today = new Date();

    for (let i = state.selectedMsgs.length - 1; i >= 0; i--) {
      let m = state.selectedMsgs[i];

      // 跳过已经处理过的消息
      if (m.onRight !== undefined) {
        continue;
      }

      if (i === state.selectedMsgs.length - 1) {
        // 第一条消息如果是当天的 在右边显示  否则在左边显示
        if (new Date(m.createTime * 1000).toDateString() === today.toDateString()) {
          m.onRight = true;
        }
      } else {
        // 第2~N的消息显示在左边还是右边由当前消息时间和前一条消息时间是否在同一天决定
        let lastM = state.selectedMsgs[i+1];
        let lastMCreateDate = new Date(lastM.createTime * 1000);

        if (new Date(m.createTime * 1000).toDateString() === lastMCreateDate.toDateString()) {
          m.onRight = lastM.onRight;
        } else {
          m.onRight = !lastM.onRight;
        }
      }
    }
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
    state.selectTopicId = value;
  },

  // 给当前会话添加新消息
  addNewMsg(state, msg) {
    if (state.selectTopicId !== msg.topicId) {
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
    // 新消息一律显示在右边
    msg.onRight = true;
    state.selectedMsgs.push(msg);
    CacheUtil.setWithTime("msgs:" + state.selectTopicId, state.selectedMsgs);
  },

  // 加载更多消息
  loadMoreNewMsg(state, msgs) {
    // 将新加载的消息加到消息的头部
    state.selectedMsgs.unshift(...msgs);
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
      (item.name && item.name.includes(state.searchText))
      || (item.lastMsgContent && item.lastMsgContent.includes(state.searchText)));
  },
  // 通过当前选择是哪个对话匹配相应的对话
  selectedChat(state) {
    return state.chatlist.find(item => item.topicId === state.selectTopicId);
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
  },
  send: ({
    commit
  }) => commit('send'),

  initData: ({
    commit,
    dispatch
  }) =>   {
    ChatApi.getTopicList().then(list => {
      commit("initData", list);
    })
  },

  initChatHistory({
    commit,
  }, id) {
    if (!id) {
      return;
    }
    ChatApi.getRecordsByTopicId(id).then(msgs => {
      commit("setSelectedMsgs", msgs);
      commit("setMsgOnRight");
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
  (state) => state.selectTopicId,
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
