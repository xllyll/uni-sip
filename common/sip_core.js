import JsSIP from "jssip";

var username = ""
var password = ""

let currentSession;
let userAgent;
let peer;
var callType = 'audio'

let sipIP = "192.168.1.218"
let sipPort = 5066

var SipCore = {
	login(user, pass) {
		username = user;
		password = pass;
		const socket = new JsSIP.WebSocketInterface(`ws://${sipIP}:${sipPort}`);
		const configuration = {
			sockets: [socket],
			uri: `sip:${user}@${sipIP}:${sipPort};transport=ws`, // loginPhone为11位以1开头的数字
			password: pass, // 密码
			register: true, // 自动注册
			session_timers: false,
		};
		var ua = new JsSIP.UA(configuration);
		ua.start()
		userAgent = ua;
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
		ua.on("newRTCSession", function(data) {
			const {
				session,
				request,
				originator
			} = data;
			if (originator === "remote") {
				console.log("对方打电话过来了~~~");
			} else {
				console.log("拨打电话中~~~");
			}
			currentSession = session;
			// 连接中
			session.on("connecting", () => {
				console.log("通话连线时候触发")
			});
			// 连接已接受
			session.on("accepted", () => {
				console.log("通话接受时候触发")
			});
			session.on("sdp", () => {
				console.log("交换sdp信令事件触发")
			});
			session.on("failed", () => {
				// window.open("https://192.168.30.236:16376","验证")
				console.log("通话失败事件触发")
			});
			session.on("reinvite", () => {
				// msg_log.log("重新协商事件触发");
				audioElement.srcObject = null;
				// 自己的视频流
				// if (session._connection.getLocalStreams().length > 0) {
				//   selfVideo.srcObject = session?._connection.getLocalStreams()[0];
				//   selfVideo.play();
				// }
				// 接入的视频流
				// if (session?._connection.getRemoteStreams().length > 0) {
				//   remoteVideo.srcObject = session?._connection.getRemoteStreams()[0];
				//   remoteVideo.play();
				// }
			});
			session.on("progress", () => {
				if (originator === "remote") {
					// msg_log.log("电话过来拉~~~~~~~~~··");
					session.answer({
						mediaConstraints: {
							audio: true,
							video: callType === 'video' ? true : false
						},
						// mediaStream: localStream,
					});
					// msg_log.log("我接听了");
				}
				// msg_log.log("接听事件在progress中触发");
			});
			session.on("confirmed", () => {
				console.log("呼叫确认--设置媒体流到音视频中");
				// 播放视频
				if (callType === "video") {
					const remoteVideo = document.querySelector("#remoteVideo");
					console.log(remoteVideo, "remoteVideoremoteVideo");
					selfVideo.srcObject = null;
					remoteVideo.srcObject = null;

					// 自己的视频流
					// if (session._connection.getLocalStreams().length > 0) {
					//   // 接听后，判断localStream
					//   selfVideo.srcObject = session?._connection.getLocalStreams()[0];
					//   selfVideo.play();
					// }
					// 接入的视频流
					if (session?._connection.getRemoteStreams().length > 0) {
						remoteVideo.srcObject = session?._connection.getRemoteStreams()[0];
						remoteVideo.play();
					}
				} else if (callType === "audio") {
					// 语音播放
					const stream = new MediaStream();
					const receivers = currentSession.connection?.getReceivers();
					if (receivers)
						receivers.forEach((receiver) => stream.addTrack(receiver.track));
					audioElement.srcObject = stream;
					// 最后都要播放
					audioElement.oncanplay = () => {
						audioElement.play();
					};

				}
			});
			session.on("peerconnection", (data) => {
				console.log("对等连接事件触发");
			});
			session.on("connecting", (data) => {
				peer = session._connection;
				console.log("对等连接建立，connecting");
			});
			session.on("ended", () => {
				console.log("通话结束")
			});
		});
	},
	call(callPhone,isVideo=false) {
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
		userAgent.call(`sip:${callPhone}@${sipIP}:${sipPort}`, opt);
	}
}

export default SipCore