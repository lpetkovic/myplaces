export default class Storage {
	constructor() {
		this.localStorage = localStorage || {};
		if (!this.localStorage.getItem && !this.localStorage.setItem) {
			Reflect.defineProperty(this.localStorage, 'setItem', { value: this.missingLocalStorage });
			Reflect.defineProperty(this.localStorage, 'getItem', { value: this.missingLocalStorage });
		}
	}

	getStorageItem(item) {
		return JSON.parse(this.localStorage.getItem(item));
	}

	setStorageItem(item, set) {
		this.localStorage.setItem(item, JSON.stringify(Array.from(set)));
		return true;
	}

	missingLocalStorage() {
		throw new Error("Local Storage Unsuported. Please use different browser");
	}
}