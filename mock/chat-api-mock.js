const Mock = require("mockjs");
import qs from 'qs';
import ApiPaths from "../src/api/api-paths";

let chatList = {
  requestResult: {success: true},
  content: [{
    topicId: 3,
    name: "git1",
    lastMsgContent: '@csentence',
    lastMsgTime: 1577366227
  },{
    topicId: 4,
    name: "git2",
    lastMsgContent: '@csentence',
    lastMsgTime: 1577366227
  }]
}

let msgs = {
  requestResult: {success: true},
  content: [{
    topicId: 3,
    msgId: 659867651148873700,
    content: "git 如何在版本库中抹去某个文件的所有痕迹",
    msgType: "TEXT",
    msgName: "文本",
    picUrl: null,
    srcUrl: null,
    createTime: 1577366307
  }]
}

let sendMsg = {
  requestResult: {success: true},
  content: {
    topicId: "3",
    "msgId|1-10000000": 1,
    content: '@csentence', //聊天内容
    "createTime|1543800000-1543851602": 1, //时间
    msgType: "TEXT",
    picUrl: "",
    srcUrl: ""
  }
}

Mock.mock(RegExp(ApiPaths.chat.getTopicList + ".*"), options => {
  let list = Mock.mock(chatList);
  return list;
});

Mock.mock(RegExp(ApiPaths.chat.getRecordsByTopicId + "/.*"), options => {
  let result = Mock.mock(msgs);
  return result;
});

Mock.mock(RegExp(ApiPaths.chat.send + ".*"), options => {
  //let body = qs.parse(options.body);
  let rs = Mock.mock(sendMsg);
  //rs.data.content = body.content;
  return rs;
})

function toBase64(file, cb) {
  let reader = new FileReader();
  // 最大限制在2M以内
  const MAX_SIZE = 2 << 20;
  if (file) {
    //将文件以Data URL形式读入页面
    reader.readAsDataURL(file);
    reader.onload = function(e) {
      if (MAX_SIZE < reader.result.length) {
        return;
      } else {
        cb(reader.result);
      }
    }
  }
}
