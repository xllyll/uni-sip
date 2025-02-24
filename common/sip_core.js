import JsSIP from "jssip";

var username = ""
var password = ""
/** 登录成功回调 */
var loginCallbackSuccess = null;
/** 登录失败回调 */
var loginCallbackError = null;

var SipCore = {
	version: '1.0.1',
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
		console.log(
			`%c SipCore %c v${this.version} `,
			'background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff',
			'background:#007aff ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff; font-weight: bold;'
		)
		this.config = {
			sipIP: config.sipIP || "192.168.1.218",
			sipPort: config.sipPort || 5066,
			username: config.username,
			password: config.password,
			callType: config.callType || 'audio'
		};
	},
	/**
	 * 用户登陆
	 * @param {String} user 用户名称
	 * @param {String} pass 用户密码
	 */
	login(user, pass) {
		return new Promise((resolve, reject) => {
			loginCallbackSuccess = resolve;
			loginCallbackError = reject;
			username = user;
			password = pass;
			const wsUrl = `ws://${this.config.sipIP}:${this.config.sipPort}`
			const socket = new JsSIP.WebSocketInterface(wsUrl);
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
		})
	},
	isConnected(){
		return this.userAgent.isConnected();
	},
	isRegistered(){
		return this.userAgent.isRegistered();
	},
	getCurrentSession() {
		return this.currentSession;
	},
	getStatus(){
		return this.userAgent.status();
	},
	registerListen(ua) {
		ua.on("connected", () => {
			console.log("连线中");
		});
		ua.on("connecting", () => {
			console.log("connecting 接线中")
		});
		ua.on("disconnected", () => {
			console.error("disconnected 取消连线")
		});
		ua.on("registered", (e) => {
			console.log(`registered --${username}注册成功--`,e);
			if(loginCallbackSuccess!=null){
				loginCallbackSuccess();
			}
		});
		ua.on("registrationExpiring", () => {
			console.log("registrationExpiring 注册即将到期,重新注册")
		});
		ua.on("registrationFailed", (err) => {
			console.log("registrationFailed 注册失败",err)
			if(loginCallbackError!=null){
				loginCallbackError(err);
			}
		});
		ua.on("unregistered", () => {
			console.log("unregistered 取消注册")
		});
		ua.on("sipEvent", (e) => {
			console.log("sipEvent:", e)
		});
		ua.on('newRTCSession', this.handleNewRTCSession.bind(this));
		ua.on("newMessage", this.handleNewMessageSession.bind(this));
	},
	handleNewMessageSession(data) {
		console.log('newMessage:', data);
		const message = data.request.body;
		console.log(message);
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