import Note from './note.js';
import Util from './utils.js';
import Storage from './storage.js';
import SearchType from './search-type.js';
const Handlebars = require('handlebars');


var MyPlaces = function () {

	var domMap = new Map();
	domMap.set('formNewPlaces', document.getElementById('get-new-places'));
	domMap.set('results', document.getElementById('search-results'));
	domMap.set('formMyPlaces', document.getElementById('get-my-places'));
	domMap.set('searchType', document.getElementById('search-type'));
	domMap.set('nearbySearch', document.getElementById('nearby-search'));
	domMap.set('textSearch', document.getElementById('text-search'));
	domMap.set('body', document.body);

	var storage = new Storage();
	var savedPlaces = new Set(storage.getStorageItem('savedPlaces'));

	domMap.get('formNewPlaces').addEventListener('submit', getNewPlaces);
	domMap.get('formMyPlaces').addEventListener('submit', getSavedPlaces);
	domMap.get('searchType').addEventListener('change', switchSearchType);

	var searchType = new SearchType();
	showForm();

	function getNewPlaces(e) {
		e.preventDefault();
		domMap.get('results').innerHTML = '';
		let res = null;

		switch (searchType.getSearchType()) {
			case searchType.NEARBY:
				res = getNearbyPlaces();
				break;
			case searchType.TEXT:
				res = getTextPlaces();
				break;
		}

		res.then((response) => {
			Util.render({
				html: response.responseText,
				className: 'cards-holder',
				el: domMap.get('results')
			});
			markSavedPlaces();
		}).catch((reason) => {
			Util.notify(reason);
		});

	}

	function getTextPlaces() {
		let data = document.getElementById('text-query').value;
		if (!data) {
			domMap.get('results').innerHTML = "Error: No results."
			return;
		}
		let url = `/places-text/${data}`
		return Util.get(url);
	}

	function getNearbyPlaces() {
		let keyword = document.getElementById('nearby-query').value;
		let radius = document.getElementById('range-select').value;

		if (!keyword) {
			domMap.get('results').innerHTML = "Error: No results."
			return;
		}
		let url = `/places-nearby/${keyword}/${radius}`;
		return Util.get(url);
	}

	function getSavedPlaces(e) {
		e.preventDefault();
		domMap.get('results').innerHTML = '';
		Util.get('/views/partials/saved-places.html').then((template) => {
			Handlebars.registerHelper('json', (ctx) => JSON.stringify(ctx));
			let temp = Handlebars.compile(template.responseText);
			let html = temp({ results: Array.from(savedPlaces) });
			Util.render({
				html: html,
				className: 'cards-holder',
				el: domMap.get('results')
			});
		}).catch(() => Util.notify("Error: Could not load saved places"));
	}

	function switchSearchType() {
		searchType.setSearchType(this.checked);
		showForm();
	}

	function showForm() {
		switch (searchType.getSearchType()) {
			case searchType.NEARBY:
				domMap.get('nearbySearch').style.display = "block";
				domMap.get('textSearch').style.display = "none";
				break;
			case searchType.TEXT:
				domMap.get('nearbySearch').style.display = "none";
				domMap.get('textSearch').style.display = "block";
				break;
		}
	}

	function markSavedPlaces() {
		let elements = Array.from(document.querySelectorAll('[data-id]'));

		savedPlaces.forEach((place) => {
			let markAsSaved = elements.find((el) => {
				return el.dataset.id === place.id;
			});
			if (markAsSaved) {
				markAsSaved.innerHTML = 'favorite';
			}
		});
	}

	function save(event, place) {
		event.target.innerHTML = "favorite";
		let existing = findPlaceById(place.id);

		if (existing) {
			Util.notify('Error: Place already saved!');
			return;
		}
		savedPlaces.add(place);
		try {
			storage.setStorageItem('savedPlaces', savedPlaces);
			Util.notify("Place saved!");
		} catch (e) {
			Util.notify("Error: Saving failed");
		}
	}

	function loadMore(nextPage) {
		let url = '/places-next/' + nextPage;
		Util.get(url).then((response) => {
			document.querySelector('.cards-holder').removeChild(document.querySelector('.more-results'));
			Util.appendTo({
				html: response.responseText,
				el: document.querySelector('.cards-holder')
			});
			markSavedPlaces();
		}).catch((reason) => {
			console.log(reason);
		});
	}

	function openNote(event, id) {
		Util.get('/views/partials/note.html').then((template) => {

			let place = findPlaceById(id);
			let temp = Handlebars.compile(template.responseText);
			let html = temp({ place: place });

			Util.render({
				html: html,
				className: 'note-holder',
				el: domMap.get('body')
			});
			domMap.set('noteClose', document.getElementById('note-close'));
			domMap.get('noteClose').addEventListener('click', closeNote);

			let form = document.getElementById('createNewNote');
			if (form) {
				form.addEventListener('submit', createNote.bind(null, id, event.target));
			}
		});
	}

	function closeNote() {
		domMap.get('body').removeChild(document.querySelector('.note-holder'));
	}

	function createNote(id, el, e) {
		e.preventDefault();
		let props = {
			text: document.getElementById('note-text').value,
			title: document.getElementById('note-title').value,
			author: document.getElementById('note-author').value
		}

		let item = findPlaceById(id);
		item.note = new Note(props);
		try {
			storage.setStorageItem('savedPlaces', savedPlaces);
		} catch (e) {
			Util.notify("Error: Creating comment failed");
			return;
		}
		el.innerHTML = 'message';
		closeNote();
		Util.notify("Comment created!");
	}

	function findPlaceById(id) {
		// for of petlja
		for (let item of savedPlaces) {
			if (item.id === id) {
				return item;
			}
		}
		return null;
	}

	function deleteNote(id) {
		let place = findPlaceById(id);
		try {
			delete place.note;
			storage.setStorageItem('savedPlaces', savedPlaces);
		} catch (e) {
			Util.notify("Error: Deleting comment faied");
			return;
		}
		closeNote();
		let selector = `.note[data-note="${id}"]`;
		document.querySelector(selector).innerHTML = 'chat_bubble_outline';
		Util.notify("Comment deleted!");
	}

	return {
		save,
		openNote,
		createNote,
		deleteNote,
		loadMore
	};
}();

window.MyPlaces = MyPlaces;