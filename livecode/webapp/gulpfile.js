var gulp = require('gulp'),
    rimraf = require('gulp-rimraf'),
    ignore = require('gulp-ignore'),
    rename = require('gulp-rename'),
    preprocess = require('gulp-preprocess'),
    runSequence = require('run-sequence'),
    gutil = require('gulp-util'), 
    uglify = require('gulp-uglify'), 
    watch = require('gulp-watch'), 
    concat = require('gulp-concat'), 
    path = require('path'),
    less = require('gulp-less'),
    ngmin = require('gulp-ngmin'),
    minifyCSS = require('gulp-minify-css'), 
    changed = require('gulp-changed'),
    imagemin = require('gulp-imagemin'),
    cleanhtml = require('gulp-cleanhtml'),
    notify = require('gulp-notify'), 
    ncp = require('ncp'),
    browserSync = require('browser-sync');


gulp.task('less', function () {    
    gulp.src('./css/style.less')
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(minifyCSS({keepSpecialComments:0}))
    .pipe(rename('min.css'))
    .pipe(gulp.dest('build2/css/'))
    .pipe(notify({
            message : "Les fichiers less ont été traités."
        }));

});

gulp.task('js', function() {
    var myjs = [
        './bower_components/jquery/dist/jquery.js',
        './js/main.js'
    ];
    gulp.src(myjs)
        .pipe(uglify())
        .pipe(concat('min.js'))
        .pipe(gulp.dest('build2/js/'))
        .pipe(notify({
            message : "Les js sont concaténés et minifiés."
        }));
});

// Copie et optimisation des images
gulp.task('imagemin', function() {
  var imgSrc = './img/**/*',
      imgDst = './build2/img/';

  gulp.src(imgSrc)
    .pipe(changed(imgDst))
    .pipe(imagemin())
    .pipe(gulp.dest(imgDst))
    .pipe(notify({
        message : "les images ont été traitées"
    }));
});

gulp.task('cleaner', function () {
    return gulp.src('./build2/*', {read: false})
        .pipe(ignore('.gitKeep'))
        .pipe(rimraf());
});

gulp.task('watcher', function() {
    // watch scss files
    gulp.watch("./css/**/*.less", function() {
        gulp.run('less');
    });

    gulp.watch("./js/**/*.js", function() {
        gulp.run('js');
    });

    gulp.watch("./img/**/*", function() {
        gulp.run('imagemin');
    });
});



// Tache generant tous les fichiers finaux destinés à la Flyport, plus
// demarage d'un serveur pour controle
gulp.task('default', function() {
  runSequence('cleaner',
            ['less','js', 'imagemin'],
            'watcher');
});

gulp.task('server-config', function() {
    browserSync.init(["./build2/**/*"], {
        server: {
            baseDir: "./"
        }
    });
});

gulp.task(
    'server', 
    ['default', 'server-config']
);

