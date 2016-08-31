var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');
var packageJson = require('./package.json');

// Static Server + watching scss/html files
gulp.task('serve', ['sass'], function() {
    browserSync.init({ server: './src' });

    gulp.watch([
        'src/*.html',
        'src/js/*.js',
        'src/img/*.jpg'
    ], ['generate-service-worker']);
    gulp.watch('src/scss/*.scss', ['sass']);
    gulp.watch('src/service-worker.js').on('change', browserSync.reload);
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
    return gulp.src('src/scss/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('src/css'))
        .pipe(browserSync.stream());
});

// create service worker file
gulp.task('generate-service-worker', function(callback) {
    var path = require('path');
    var swPrecache = require('sw-precache');
    var rootDir = 'src';

    swPrecache.write(path.join(rootDir, 'service-worker.js'), {
        staticFileGlobs: [rootDir + '/**/*.{js,html,css,jpg}'],
        stripPrefix: rootDir,
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

gulp.task('default', ['sass', 'generate-service-worker', 'serve']);