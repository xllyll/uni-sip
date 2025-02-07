import JsSIP from "jssip";

var username = ""
var password = ""


var SipCore = {
	config: {
		sipIP: "192.168.1.218",
		sipPort: 5066,
		callType: 'audio'
	},
	userAgent: null,
	currentSession: null,
	init(config) {
		this.config = {
			sipIP: config.sipIP || "192.168.1.218",
			sipPort: config.sipPort || 5066,
			username: config.username,
			password: config.password,
			callType: config.callType || 'audio'
		};
	},
	login(user, pass) {
		username = user;
		password = pass;
		const socket = new JsSIP.WebSocketInterface(`ws://${this.config.sipIP}:${this.config.sipPort}`);
		const configuration = {
			sockets: [socket],
			uri: `sip:${user}@${this.config.sipIP}:${this.config.sipPort};transport=ws`, // loginPhone为11位以1开头的数字
			password: pass, // 密码
			register: true, // 自动注册
			session_timers: false,
		};

		var ua = new JsSIP.UA(configuration);
		ua.start()
		this.userAgent = ua;
		this.registerListen(ua)
	},
	registerListen(ua) {
		ua.on("connected", () => {
			console.log("连线中");
		});
		ua.on("connecting", () => {
			console.log("接线中")
		});
		ua.on("disconnected", () => {
			console.error("取消连线")
		});
		ua.on("registered", () => {
			console.log(`--${username}注册成功--`);
		});
		ua.on("registrationExpiring", () => {
			console.log("注册即将到期,重新注册")
		});
		ua.on("registrationFailed", () => {
			console.error("注册失败")
		});
		ua.on("unregistered", () => {
			console.log("取消注册")
		});
		ua.on("sipEvent", (e) => {
			console.log("sipEvent:", e)
		});
		ua.on('newRTCSession', this.handleNewRTCSession.bind(this));
		// ua.on("newRTCSession", function(data) {
		// 	const {
		// 		session,
		// 		request,
		// 		originator
		// 	} = data;
		// 	currentSession = session;
		// 	if (originator === "remote") {
		// 		console.log("对方打电话过来了~~~");
		// 		const that = this
		// 		uni.showModal({
		// 			title: '新通话',
		// 			content: `来自${request.from.display}的电话`,
		// 			complete: () => {
		// 				that.answerCall()
		// 			}
		// 		})
		// 	} else {
		// 		console.log("拨打电话中~~~");
		// 	}
		// 	// 连接中
		// 	session.on("connecting", () => {
		// 		console.log("通话连线时候触发")
		// 	});
		// 	// 连接已接受
		// 	session.on("accepted", () => {
		// 		console.log("通话接受时候触发")
		// 	});
		// 	session.on("sdp", () => {
		// 		console.log("交换sdp信令事件触发")
		// 	});
		// 	session.on("failed", () => {
		// 		// window.open("https://192.168.30.236:16376","验证")
		// 		console.log("通话失败事件触发")
		// 	});
		// 	session.on("reinvite", () => {
		// 		// msg_log.log("重新协商事件触发");
		// 		audioElement.srcObject = null;
		// 		// 自己的视频流
		// 		// if (session._connection.getLocalStreams().length > 0) {
		// 		//   selfVideo.srcObject = session?._connection.getLocalStreams()[0];
		// 		//   selfVideo.play();
		// 		// }
		// 		// 接入的视频流
		// 		// if (session?._connection.getRemoteStreams().length > 0) {
		// 		//   remoteVideo.srcObject = session?._connection.getRemoteStreams()[0];
		// 		//   remoteVideo.play();
		// 		// }
		// 	});
		// 	session.on("progress", () => {
		// 		if (originator === "remote") {
		// 			// msg_log.log("电话过来拉~~~~~~~~~··");
		// 			session.answer({
		// 				mediaConstraints: {
		// 					audio: true,
		// 					video: callType === 'video' ? true : false
		// 				},
		// 				// mediaStream: localStream,
		// 			});
		// 			// msg_log.log("我接听了");
		// 		}
		// 		// msg_log.log("接听事件在progress中触发");
		// 	});
		// 	session.on("confirmed", () => {
		// 		console.log("呼叫确认--设置媒体流到音视频中");
		// 		// 播放视频
		// 		if (callType === "video") {
		// 			const remoteVideo = document.querySelector("#remoteVideo");
		// 			console.log(remoteVideo, "remoteVideoremoteVideo");
		// 			selfVideo.srcObject = null;
		// 			remoteVideo.srcObject = null;

		// 			// 自己的视频流
		// 			// if (session._connection.getLocalStreams().length > 0) {
		// 			//   // 接听后，判断localStream
		// 			//   selfVideo.srcObject = session?._connection.getLocalStreams()[0];
		// 			//   selfVideo.play();
		// 			// }
		// 			// 接入的视频流
		// 			if (session?._connection.getRemoteStreams().length > 0) {
		// 				remoteVideo.srcObject = session?._connection.getRemoteStreams()[0];
		// 				remoteVideo.play();
		// 			}
		// 		} else if (callType === "audio") {
		// 			// 语音播放
		// 			const stream = new MediaStream();
		// 			const receivers = currentSession.connection?.getReceivers();
		// 			if (receivers)
		// 				receivers.forEach((receiver) => stream.addTrack(receiver.track));
		// 			audioElement.srcObject = stream;
		// 			// 最后都要播放
		// 			audioElement.oncanplay = () => {
		// 				audioElement.play();
		// 			};

		// 		}
		// 	});
		// 	session.on("peerconnection", (data) => {
		// 		console.log("对等连接事件触发");
		// 	});
		// 	session.on("connecting", (data) => {
		// 		peer = session._connection;
		// 		console.log("对等连接建立，connecting");
		// 	});
		// 	session.on("ended", () => {
		// 		console.log("通话结束")
		// 	});
		// });
	},
	handleNewRTCSession(data) {
		console.log(data);
		const session = data.session;
		const request = data.request;
		this.currentSession = session;
		
		if (data.originator === "remote") {
			console.log("对方打电话过来了~~~");
			// 在这里可以弹出一个UI来让用户选择接听或拒绝
			const that = this
			uni.showModal({
				title: '新通话',
				content: `来自${request.from._display_name}的电话`,
				complete: () => {
					that.answerCall()
				}
			})
		}
		session.on('accepted', () => console.log("通话接受时候触发"));
		session.on('failed', (e) => {
		    console.error("通话失败事件触发", e); // 查看失败的具体原因
		});
		session.on('confirmed', () => this.setupMediaStreams(session));
		session.on('ended', () => console.log("通话结束"));
	},
	
	setupMediaStreams(session) {
		if (this.config.callType === "video") {
			this.setupVideoStream(session);
		} else {
			this.setupAudioStream(session);
		}
	},

	setupAudioStream(session) {
		const stream = new MediaStream();
		session.connection.getReceivers().forEach(receiver => stream.addTrack(receiver.track));
		const audioElement = document.querySelector("#audioElement");
		audioElement.srcObject = stream;
		audioElement.play();
	},

	setupVideoStream(session) {
		const remoteVideo = document.querySelector("#remoteVideo");
		if (session.connection.getRemoteStreams().length > 0) {
			remoteVideo.srcObject = session.connection.getRemoteStreams()[0];
			remoteVideo.play();
		}
	},
	/**
	 * 接听通话
	 */
	answerCall() {
		console.log('用户[接听通话]');
		if (this.currentSession && this.currentSession.isInProgress()) {
			this.currentSession.answer({
				mediaConstraints: {
					audio: true,
					video: this.config.callType === 'video'
				}
			});
			console.log("已接听电话");
		} else {
			console.error("当前没有可接听的通话");
		}
	},
	/**
	 * 拒绝通话
	 */
	rejectCall() {
		console.log('用户[拒绝通话]');
		if (this.currentSession && this.currentSession.isInProgress()) {
			this.currentSession.terminate();
			console.log("已拒绝/终止通话");
			this.currentSession = null;
		} else {
			console.error("当前没有可拒绝的通话");
		}
	},
	call(callPhone, isVideo = false) {
		const eventHandlers = {
			progress: function(e) {
				console.log("call is in progress");
			},
			failed: function(e) {
				// _this.titleText = "对方已挂断！";
				// _this.$message.error("无人应答！")
				// _this.VoiceVisible = false;
				// _this.ViewsVisible = false;
				console.log("call failed: ", e);
			},
			ended: function(e) {
				// _this.$message.error("通话结束")
				console.log("call ended : ", e);
			},
			confirmed: function(e) {
				console.log("call confirmed");
			},
		}
		const opt = {
			mediaConstraints: {
				audio: true,
				video: isVideo
			},
			eventHandlers,
		};
		// callPhone 要拨打的电话号码
		this.userAgent.call(`sip:${callPhone}@${sipIP}:${sipPort}`, opt);
	}
}

export default SipCore