<template>
	<view class="call-root">
		<view class="header">

		</view>
		<input type="text" v-model="username" placeholder="username" />
		<input type="text" v-model="password" placeholder="password" />
		<button @click="login">LOGIN</button>
		<view class="phone-num">
			<view>{{callPhoneNum}}</view>
			<view @click="onPhoneNumDelete"><<</view>
		</view>
		<view class="phone-box">
			<view class="phone-item" @click="onPhoneNumCheck('1')">1</view>
			<view class="phone-item" @click="onPhoneNumCheck('2')">2</view>
			<view class="phone-item" @click="onPhoneNumCheck('3')">3</view>
			<view class="phone-item" @click="onPhoneNumCheck('4')">4</view>
			<view class="phone-item" @click="onPhoneNumCheck('5')">5</view>
			<view class="phone-item" @click="onPhoneNumCheck('6')">6</view>
			<view class="phone-item" @click="onPhoneNumCheck('7')">7</view>
			<view class="phone-item" @click="onPhoneNumCheck('8')">8</view>
			<view class="phone-item" @click="onPhoneNumCheck('9')">9</view>
			<view class="phone-item" @click="onPhoneNumCheck('*')">*</view>
			<view class="phone-item" @click="onPhoneNumCheck('0')">0</view>
			<view class="phone-item" @click="onPhoneNumCheck('#')">#</view>
		</view>
		<button @click="call">CALL</button>
	</view>
</template>

<script lang="ts" setup>
	import { SIP } from "jssip/lib/Constants";
import SipCore from "../../common/sip_core";
	import {
		ref
	} from "vue";
	const username = ref('1001')
	const password = ref('1234')
	const callPhoneNum = ref('')
	const login = ()=>{
		SipCore.login(username.value, password.value)
	}
	const onPhoneNumCheck = (v)=>{
		var phoneNum = callPhoneNum.value;
		phoneNum = phoneNum + v
		callPhoneNum.value = phoneNum
	}
	const onPhoneNumDelete = ()=>{
		var phoneNum = callPhoneNum.value;
		if(phoneNum.length>0){
			//删除最后一个字符
			phoneNum = phoneNum.substring(0,phoneNum.length-1)
		}
		callPhoneNum.value = phoneNum
	}
	
	const call = ()=>{
		SipCore.call(callPhoneNum.value)
	}
	
</script>

<style lang="less">
	page {
		width: 100%;
		height: 100%;
		background: #f8f8f8;
	}
	.phone-box{
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: repeat(4, 1fr);
	}
	.phone-item{
		height: 80rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #fff;
		margin: 10rpx;
	}
	.phone-num{
		height: 50rpx;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx;
	}
</style>