var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var gulpIf = require('gulp-if');
var imagemin = require('gulp-imagemin');
var del = require('del');
var cache = require('gulp-cache');
var runSequence = require('run-sequence');

// Compiles sass files to css and reloads browser
gulp.task('sassy', function() {
	return gulp.src('app/scss/**/*.scss')
		.pipe(sass())
		.pipe(gulp.dest('app/css'))
		.pipe(browserSync.reload({
			stream: true
		}));
});
// Reloads browser when sass/html/js files are changed
gulp.task('watch', function() {
	gulp.watch('app/scss/**/*.scss', ['sassy']);
	gulp.watch('app/**/*.html', browserSync.reload);
	gulp.watch('app/js/**/*.js', browserSync.reload);
});
// Spins up browser
gulp.task('browserSync', function() {
	browserSync({
		server: {
			baseDir: 'app'
		}
	});
});
// Moves all html files, concatenates and minifies js and css files to dist
gulp.task('useref', function() {
	var assets = useref.assets();

	return gulp.src('app/*.html')
			.pipe(assets)
			// Minifies only if it's a CSS file
			.pipe(gulpIf('*.css', minifyCSS()))
			// Uglifies only if it's a Javascript file
			.pipe(gulpIf('*.js', uglify()))
			.pipe(assets.restore())
			.pipe(useref())
			.pipe(gulp.dest('dist'));
});
// Minifies images
gulp.task('images', function() {
	return gulp.src('app/images/**/*.+(JPG|PNG|GIF|SVG|jpg|png|svg|gif)')
			.pipe(cache(imagemin({
		    	// Setting interlaced to true
		    	interlaced: true
		    })))
			.pipe(gulp.dest('dist/images'));
});
// Moves fonts to dist
gulp.task('fonts', function() {
	return gulp.src('app/fonts/**/*')
			.pipe(gulp.dest('dist/fonts'));
});
// Clean ALL dist files
gulp.task('clean', function() {
	cache.clearAll();
	return del('dist');	
});
// Clean dist files except images
gulp.task('clean:dist', function(){
	return del(['dist/**/*', '!dist/images', '!dist/images/**/*']);
});
// Build dist files
gulp.task('build', function(callback) {
	runSequence('clean:dist', ['sassy', 'useref', 'images', 'fonts'], callback);
});
// Run app
gulp.task('default', function(callback) {
	runSequence(['sassy', 'browserSync', 'watch'], callback);
});
