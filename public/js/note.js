export default class Note {
	constructor(props = {
		title: "Title not set",
		text: 'Text not set',
		author: 'Author not set'
	}) {
		const options = {
			year: 'numeric', month: 'numeric', day: 'numeric',
			hour: 'numeric', minute: 'numeric', second: 'numeric',
			hour12: false
		};
		this.title = props.title;
		this.text = props.text;
		this.author = props.author;
		this.date = Intl.DateTimeFormat('en-GB', options).format(Date.now());
	}
}