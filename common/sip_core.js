import JsSIP from "jssip";

var username = ""
var password = ""

let currentSession;
let userAgent;
let peer;

var SipCore = {
	login(user, pass) {
		username = user;
		password = pass;
		const socket = new JsSIP.WebSocketInterface(`ws://192.168.1.218:5066`);
		const configuration = {
			sockets: [socket],
			uri: `sip:${user}@192.168.1.218:5066;transport=ws`, // loginPhone为11位以1开头的数字
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
			// msg_log.log("连线中")
			console.log("连线中");
		});
		ua.on("connecting", () => {
			// msg_log.log("接线中")
			console.log("接线中")
		});
		ua.on("disconnected", () => {
			// msg_log.error("取消连线")
			console.error("取消连线")
		});
		ua.on("registered", () => {
			// msg_log.log(`--${name === "offer" ? 2001 : 2002}注册成功`);
		});
		ua.on("registrationExpiring", () => {
			// msg_log.log("注册即将到期,重新注册")
			console.log("注册即将到期,重新注册")
		});
		ua.on("registrationFailed", () => {
			// msg_log.error("注册失败")
			console.error("注册失败")
		});
		ua.on("unregistered", () => {
			// msg_log.log("取消注册")
			console.log("取消注册")
		});
		ua.on("sipEvent", (e) => {
			// msg_log.log("sipEvent")
			console.log("sipEvent:",e)
		});
	}
}

export default SipCore