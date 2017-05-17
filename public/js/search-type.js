export default class SearchType {
	constructor() {
		this.NEARBY = Symbol('NEARBY');
		this.TEXT = Symbol('TEXT');
		this.searchType = this.TEXT;
	}

	getSearchType() {
		return this.searchType;
	}

	setSearchType(flag) {
		if (flag) {
			this.searchType = this.NEARBY;
		} else {
			this.searchType = this.TEXT;
		}
	}
}