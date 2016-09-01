var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');
var packageJson = require('./package.json');
var del = require('del');
var sequence = require('run-sequence');

var SRC_DIR = 'src';
var BUILD_DIR = 'build';

gulp.task('clean', function() {
    return del(BUILD_DIR);
});

gulp.task('copy-html', function() {
    return gulp.src(SRC_DIR + '/*.html')
                .pipe(gulp.dest(BUILD_DIR));
});

gulp.task('copy-api', function() {
    return gulp.src(SRC_DIR + '/api/**/*')
                .pipe(gulp.dest(BUILD_DIR + '/api'));
});

gulp.task('copy-js', function() {
    return gulp.src(SRC_DIR + '/js/*.js')
                .pipe(gulp.dest(BUILD_DIR + '/js'));
});

gulp.task('copy-img', function() {
    return gulp.src(SRC_DIR + '/img/*.jpg')
                .pipe(gulp.dest(BUILD_DIR + '/img'));
});

gulp.task('copy', ['copy-html', 'copy-api', 'copy-js', 'copy-img']);

// Static Server + watching scss/html files
gulp.task('serve', ['build'], function() {
    browserSync.init({ server: './' + BUILD_DIR });

    gulp.watch(SRC_DIR + '/*.html', ['copy-html']);
    gulp.watch(SRC_DIR + '/js/*.js', ['copy-js']);
    gulp.watch(SRC_DIR + '/img/*.jpg', ['copy-img']);
    gulp.watch(SRC_DIR + '/api/**/*', ['copy-api']);

    gulp.watch(SRC_DIR + '/scss/*.scss', ['sass']);

    gulp.watch([
        BUILD_DIR + '/*.html',
        BUILD_DIR + '/js/*.js',
        BUILD_DIR + '/img/*.jpg'
    ], ['generate-service-worker']);

    gulp.watch(BUILD_DIR + '/service-worker.js')
        .on('change', browserSync.reload);
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
    return gulp.src(SRC_DIR + '/scss/*.scss')
        .pipe(sass())
        .pipe(gulp.dest(BUILD_DIR + '/css'))
        .pipe(browserSync.stream());
});

// create service worker file
gulp.task('generate-service-worker', function(callback) {
    var path = require('path');
    var swPrecache = require('sw-precache');

    swPrecache.write(path.join(BUILD_DIR, 'service-worker.js'), {
        staticFileGlobs: [BUILD_DIR + '/**/*.{js,html,css,jpg}'],
        stripPrefix: BUILD_DIR,
        cacheId: packageJson.name,
        runtimeCaching: [{
            urlPattern: /\/api\//,
            handler: 'cacheFirst'
        }, {
            urlPattern: /img/,
            handler: 'cacheFirst',
            options: {
                cache: {
                    name: 'image-cache',
                    // Use sw-toolbox's LRU expiration.
                    maxEntries: 50
                }
            }
        }, {
            // Use a network first strategy for everything else.
            default: 'networkFirst'
        }]
    }, callback);
});

gulp.task('build', function(callback) {
    sequence(
        'clean',
        ['copy', 'sass'],
        'generate-service-worker',
        callback
    );
});
gulp.task('default', ['serve']);