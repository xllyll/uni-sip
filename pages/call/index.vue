<template>
	<view class="call_mask" @tap="closeWindow">
		<view class="call_content" @tap.stop.prevent>
			
		</view>
	</view>
</template>

<script>

</script>

<style lang="less">
	page {
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.2);
	}

	.call_mask {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
	}

	.call_content {
		width: 600rpx;
		height: 820rpx;
		overflow: hidden;
		border-radius: 10rpx;
		background-color: white;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding-bottom: 20rpx;
	}
</style>