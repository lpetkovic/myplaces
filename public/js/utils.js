export default class Util {
	static get(url) {
		return new Promise(function (res, rej) {
			let req = new XMLHttpRequest();
			req.open('GET', url, true);
			req.onload = () => {
				let { responseText, status, statusText } = req;
				if (req.status >= 200 && req.status < 300) {
					res({
						responseText
					})
				} else {
					rej({
						status,
						statusText
					})
				}
			}
			req.send(null);
		})
	}

	static render(props) {
		let div = document.createElement('div');
		div.className = props.className;
		div.innerHTML = props.html;
		props.el.append(div);
	}

	static appendTo(props) {
		props.el.insertAdjacentHTML('beforeend', props.html);
	}

	static notify(text) {
		if (Notification.permission === "granted") {
			var notification = new Notification(text);
		}

		else if (Notification.permission !== 'denied') {
			Notification.requestPermission(function (permission) {
				if (permission === "granted") {
					var notification = new Notification(text);
				}
			});
		}
	}
}