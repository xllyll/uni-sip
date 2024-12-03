<template>
	<view class="login-root">
		<view class="input-bg">
			<input type="text" v-model="username" placeholder="username"/>
		</view>
		<view class="input-bg">
			<input type="text" v-model="password" placeholder="password"/>
		</view>
		<button class="login-bt" @click="onLogin">登陆</button>
	</view>
</template>

<script setup lang="ts">
	import JsSIP from "jssip";
	import { onLoad, onShow } from '@dcloudio/uni-app';
	import SipCore from "../../common/sip_core";
	import { ref } from "vue";

	const username = ref('1002')
	const password = ref('1234')

	onLoad(e => {

	})

	const onLogin = () => {
		uni.navigateTo({
			url:'/pages/call/index'
		})
		// SipCore.login(username.value, password.value)
	}
</script>

<style lang="less">
	.input-bg {
		margin: 0 auto;
		width: calc(100% - 80rpx);
		height: 88rpx;
		background-color: #f9f9f9;
		margin-top: 60rpx;
		border-radius: 20rpx;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		input{
			margin: 10rpx;
		}
	}
	.login-bt{
		margin-top: 80rpx;
		width: calc(100% - 80rpx);
		background-color: #2f98fc;
		color: #fff;
	}
</style>