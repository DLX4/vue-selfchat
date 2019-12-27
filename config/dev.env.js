'use strict'
var merge = require('webpack-merge')
var prodEnv = require('./prod.env')
/**
 * 开发环境配置
 */
module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  CHAT_SERVER: '"http://106.54.113.128:8089"',
  MOCK: "false"
})
