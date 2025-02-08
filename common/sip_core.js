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
	peer: null,
	audio: null,
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
			uri: `sip:${user}@${this.config.sipIP}:${this.config.sipPort}`,
			password: pass,
			register: true,
			session_timers: false,
			register_expires: 3600,
		};
		var ua = new JsSIP.UA(configuration);
		this.userAgent = ua;
		this.registerListen(ua)
		ua.start()
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

	},
	handleNewRTCSession(data) {
		console.log(data);
		const session = data.session;
		const direction = session.direction;
		const request = data.request;
		this.currentSession = session;
		if (direction == "incoming") {
			session.on('progress', () => {
				console.log("progress...");
				if (data.originator === "remote") {
					console.log("等待用户接听...");
					const that = this
					uni.showModal({
						title: '新通话',
						content: `来自${request.from._display_name}的电话`,
						complete: () => {
							that.answerCall()
						}
					})
				}
			});

			session.on("peerconnection", function(e) {
				console.log("peerconnection");
				e.peerconnection.addEventListener("addstream", function(e) {
					const audioElement = document.getElementById("audioElement");
					document.body.appendChild(audioElement);
					console.log("Stream added");
					audioElement.srcObject = e.stream;
					audioElement.play();
				});
			});

		}
	},
	eventHandlers: {
		progress: function(e) {
			console.log("***********************call is in progress");
		},
		failed: function(e) {
			console.log("***************************call failed with cause: ", e);
		},
		ended: function(e) {
			console.log("********************call ended with cause: ", e);
		},
		confirmed: function(e) {
			console.log("***************************call confirmed", e);
		},
		peerconnection: function(e) {
			console.log("peerconnection***************************", e);
			e.peerconnection.onaddstream = function(event) {
				console.log(" ***************** addstream", event);
				const audioElement = document.getElementById("audioElement");
				document.body.appendChild(audioElement);
				audioElement.srcObject = e.stream;
				audioElement.play();
			};
		},
	},
	/**
	 * 接听通话
	 */
	answerCall() {
		console.log('answerCall 用户[接听通话] ');
		if (this.currentSession && this.currentSession.isInProgress()) {
			var callOptions = {
				eventHandlers: this.eventHandlers,
				mediaConstraints: {
					audio: true,
					video: false,
				},
				sessionTimersExpires: 3600,
				pcConfig: {
					iceServers: [{
						urls: [
							"stun:stun.l.google.com:19302",
							"stun:stun1.l.google.com:19302",
						],
					}, ],
				},
			};
			console.log("已接听电话");
			try {
				this.currentSession.answer(callOptions);
			} catch (error) {
				console.error(' 接听失败：', error);
			}
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
		console.log('call phone');
		const eventHandlers = {
			progress: function(e) {
				console.log("call is in progress");
			},
			failed: function(e) {
				console.log("call failed with cause: ", e);
			},
			ended: function(e) {
				console.log("call ended with cause: ", e);
			},
			confirmed: function(e) {
				console.log("call confirmed", e);
			},
			peerconnection: function(e) {
				console.log("peerconnection", e);
				e.peerconnection.onaddstream = function(event) {
					console.log(" *** addstream", event);
					const audioElement = document.getElementById("audioElement");
					document.body.appendChild(audioElement);
					audioElement.srcObject = event.stream;
					audioElement.play();
				};
			}
		}
		var options = {
			eventHandlers: eventHandlers,
			mediaConstraints: {
				audio: true,
				video: isVideo
			},
			sessionTimersExpires: 3600,
			pcConfig: {
				iceServers: [{
					urls: [
						"stun:stun.l.google.com:19302",
						"stun:stun1.l.google.com:19302",
					],
				}, ],
			},
		};
		// callPhone 要拨打的电话号码
		this.userAgent.call(`sip:${callPhone}@${this.config.sipIP}:${this.config.sipPort}`, options);
	}
}

export default SipCore