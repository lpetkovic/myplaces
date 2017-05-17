// Using const
const koa = require('koa');
const route = require('koa-route');
const app = koa();
const GooglePlaces = require('node-googleplaces');
const googlePlaces = new GooglePlaces("AIzaSyD6YCB2Lr703uK3NeJWbmV3lVtBxGKJVYM");
const static = require('koa-static');
const hbs = require('koa-hbs');
const fs = require('fs');
const geoip = require('geoip-lite');

// Handlebars template engine
app.use(hbs.middleware({
	viewPath: __dirname + '/public/views',
	extname: '.html',
	partialsPath: __dirname + '/public/views/partials/'
}));

hbs.registerHelper('json', (ctx) => JSON.stringify(ctx));

// Serving static files - CSS and JS
app.use(static(__dirname + '/public'));
app.use(route.get('/places-text/:query', getPlacesTextSearch));
app.use(route.get('/places-next/:pagetoken', getMorePlaces));
app.use(route.get('/places-nearby/:keyword/:radius', getPlacesNearbySearch));
app.use(route.get('/photo/:photoreference', photo));
app.use(route.get('/', main));

function main() {
	return this.render('index', {});
}

function* getPlacesTextSearch(query) {
	let params = { query };

	let res = yield googlePlaces.textSearch(params);
	let results = prepareResults(res);
	let status = res.body.status;
	yield response.bind(this, results, status)();
}

function* getMorePlaces(pagetoken) {
	let params = { pagetoken };

	let res = yield googlePlaces.textSearch(params);
	let results = prepareResults(res);
	let status = res.body.status;
	yield response.bind(this, results, status)();
}

function* getPlacesNearbySearch(keyword, radius) {

	let geo = geoip.lookup(this.request.ip);
	if (!geo) {
		// Mock address for local usage - address in Belgrade
		geo = geoip.lookup("93.87.198.101");
	}

	let params = {
		keyword: keyword,
		radius: radius,
		location: geo.ll[0] + ',' + geo.ll[1]
	}

	let res = yield googlePlaces.nearbySearch(params);
	let results = prepareResults(res);
	let status = res.body.status;
	yield response.bind(this, results, status)();
}

function* photo(photoreference) {
	let query = Object.assign({ photoreference }, { maxwidth: 500 });
	let res = yield googlePlaces.photo(query);

	this.status = 200;
	this.body = res.body;
}

function prepareResults(res) {
	let { results, next_page_token } = res.body;

	results.nextPage = next_page_token;
	results.map((el) => {
		if (el && el.photos && el.photos[0]) {
			return el.photoId = el.photos[0].photo_reference;
		}
	});
	return results;
}

function response(results, status) {
	if (!results || status != "OK") {
		// Using template strings
		return this.throw(404, `Error: No results, status: ${status}`);
	} else {
		this.status = 200;
		return this.render('partials/places', { results: results });
	}
}

// Using arrow functions
app.listen(9000, () => {
	console.log("Server listening on port 9000");
});