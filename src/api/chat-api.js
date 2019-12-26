import HttpUtil from '../utils/http-util';
import ApiPaths from './api-paths';
import CacheUtil from '../utils/cache-util';
const MSG_CACHE_KEY = "msgs:";
// 图片最大 32M
const IMAGE_MAX_SIZE = 1 << 26;

/**
 * 获取聊天好友列表
 */
function getTopicList() {
  return new Promise((res, rej) => {
    HttpUtil.get(ApiPaths.chat.getTopicList)
      .then((rs) => {
        if (rs.requestResult) {
          if (!rs.content.length) {
            res([]);
          } else {
            let sortedData = rs.content.sort((a, b) => {
              if (a.lastMsgTime == b.lastMsgTime) {
                return 0;
              } else if (a.lastMsgTime > b.lastMsgTime) {
                return -1;
              } else {
                return 1;
              }
            });
            res(sortedData);

          }
        } else {
          rej(rs.requestResult.errorMsg);
        }
      })
      .catch(e => rej(e.msg));
  });
}

/**
 * 根据 topic 获取聊天记录
 * @param {String} topicId 主题id
 * @param firstCreateTime
 */
function getRecordsByTopicId(topicId, firstCreateTime) {
  return new Promise((res, rej) => {
    let cache = CacheUtil.get(MSG_CACHE_KEY + topicId + firstCreateTime, 300);
    if (cache) {
      return res(cache);
    }
    HttpUtil.get(ApiPaths.chat.getRecordsByTopicId + "/" + topicId, {firstCreateTime: firstCreateTime})
      .then((rs) => {
        if (rs.requestResult) {
          let sortedData = rs.content.sort((a, b) => {
            if (a.createTime == b.createTime) {
              return 0;
            } else if (a.createTime < b.createTime) {
              return -1;
            } else {
              return 1;
            }
          });
          CacheUtil.setWithTime(MSG_CACHE_KEY + topicId, sortedData);
          res(sortedData);
        } else {
          rej(rs.requestResult.errorMsg)
        }
      })
      .catch(e => rej(e.msg));
  });
}

/**
 * 发送消息
 * @param {Object} msg 消息体
 */
function send(msg) {
  return new Promise((res, rej) => {
    if (!msg.content || !msg.content.trim()) {
      return rej("内容不能为空");
    }
    if (msg.content.length > 1024) {
      return rej("内容过长!");
    }
    HttpUtil.post(ApiPaths.chat.send, msg)
      .then((rs) => {
        if (rs.requestResult) {
          res(rs.content);
        } else {
          rej(rs.requestResult.errorMsg)
        }
      })
      .catch(e => rej(e.msg));
  });
}

/**
 * 发送图片消息
 * @param {Object} msg 消息体
 */
function sendImage(file) {
  return new Promise((res, rej) => {
    if (file.size > IMAGE_MAX_SIZE) {
      return rej("图片大小不能大于32M");
    }
    HttpUtil.upload(ApiPaths.chat.upload, file)
      .then((rs) => {
        if (rs.requestResult) {
          res(rs.content)
        } else {
          rej(rs.requestResult.errorMsg)
        }
      })
      .catch(e => rej(e.msg));
  });
}

/**
 * 清除某个用户的聊天记录缓存
 * @param {String} openId id
 */
function cleanCache(openId) {
  CacheUtil.del(MSG_CACHE_KEY + openId);
}

export default {
  getTopicList: getTopicList,
  getRecordsByTopicId: getRecordsByTopicId,
  cleanCache,
  sendImage,
  send
}
