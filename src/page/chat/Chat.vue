<template>
	<div class="content">
		<div class="msglist">
			<search></search>
			<chatlist></chatlist>
		</div>
		<div class="chatbox">
			<message></message>
			<v-text></v-text>
		</div>
	</div>
</template>

<script>
import search from '../../components/search/Search'
import chatlist from '../../components/chatlist/Chatlist'
import message from '../../components/message/Message'
import vText from '../../components/text/VText'
export default {
   components: {
   	 search,
   	 chatlist,
   	 message,
   	 vText
   }
}
</script>

<style lang="stylus" scoped>
.content
  display: flex
  width: 800px
  .msglist
    width: 250px
    background: rgb(230,230,230)
  .chatbox
    flex: 1
</style>
