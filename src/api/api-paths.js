let chat_server = process.env.CHAT_SERVER;
let apiPaths = {
  websocket: {
    endpoint: chat_server + "/ws",
    path: {
      subMsg: "/user/topic/subNewMsg",
      reachableChange: "/user/topic/reachableChange"
    }
  },
  chat: {
    getTopicList: chat_server + "/topic",
    // getChatItemByOpenId: chat_server + "/chat/getChatItemByOpenId",
    getRecordsByTopicId: chat_server + "/message",
    setRead: chat_server + '/chat/setRead',
    send: chat_server + "/message",
    // 发送图片消息
    sendImage: chat_server + "/chat/sendImage",
  }
}
export default apiPaths
