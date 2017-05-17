var gulp = require('gulp');
var browserify = require('browserify');
var fs = require("fs");

gulp.watch('public/js/*.js', ['default']);

gulp.task('default', function () {
	browserify('public/js/index.js')
		.transform('babelify', { presets: ['es2015'] })
		.bundle()
		.pipe(fs.createWriteStream("public/build/bundle.js"));
});