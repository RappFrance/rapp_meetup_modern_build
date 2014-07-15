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
        './bower_components/jquery/dist/jquery.min.js','js/min.js',
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

gulp.task('dev-watcher', function() {
    // watch scss files
    gulp.watch("./app/styles/**/*.less", function() {
        gulp.run('less-dev');
    });

    gulp.watch("./index-build.html", function() {
        gulp.run('index-dev');
    });
});

// POUR LA PROD //
///////////////////

 // Process des fichiers Less 
gulp.task('less', function () {
    var projectLess = [
        './app/bower_components/bootstrap/less/bootstrap.less',
        './app/styles/main.less'
    ];
    gulp.src(projectLess)
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(concat('y3b.css'))
    .pipe(minifyCSS({keepSpecialComments:0}))
    .pipe(gulp.dest('./build/css'))
    .pipe(notify({
            message : "Less files for production are processed."
    }));
});

// Concatenation et minification des js gérés par bower
gulp.task('vendor-js', function() {
    var vendorjs = [
        './app/bower_components/angular/angular.js',
        './app/bower_components/angular-route/angular-route.js',
        './app/bower_components/momentjs/moment.js',
        './app/bower_components/d3/d3.js'
    ];
    gulp.src(vendorjs)
        .pipe(uglify())
        .pipe(concat('y3b-vendor.js'))
        .pipe(gulp.dest('build/js/'))
        .pipe(notify({
            message : "vendors JS files are now processed!"
        }));
});

// Concatenation et minification des js angular
gulp.task('app-js', function(){
    gulp.src( './app/scripts/**/*.js', {base:'app/scripts/'})
        .pipe(ngmin())
        .pipe(uglify())
        .pipe(concat('y3b-app.js'))
        .pipe(gulp.dest('./build/js'))
        .pipe(notify({
            message:"app JS files are now processed!"
        }));
});

// Copie des view angular dans le repertoire de build
gulp.task('app-views', function(){
    ncp('./app/views', './build/views/', function(err){
        if(err) {
            throw err;
        } else {
            notify({
                message:"app views set for production"
            });
        }
    });
});

// Création de l'index
gulp.task('index-prod', function() {
  gulp.src('./index-build.html')
    .pipe(preprocess({context: { ENV: 'prod', DEBUG: false}}))
    .pipe(rename('index.html'))
    .pipe(cleanhtml())
    .pipe(gulp.dest('./build/'))
});

// Copie des json simulant l'API Flyport
gulp.task('api-prod', function(){
    ncp('./app/api', './build/api/', function(err){
        if(err) {
            throw err;
        } else {
            notify({
                message:"api files are on production"
            });
        }
    });
});

// Copie et optimisation des images
gulp.task('imagemin', function() {
  var imgSrc = './app/images/**/*',
      imgDst = './build/images';

  gulp.src(imgSrc)
    .pipe(changed(imgDst))
    .pipe(imagemin())
    .pipe(gulp.dest(imgDst))
    .pipe(notify({
        message : "Images are processed!"
    }));
});

// Cleanage du repertoire de build
gulp.task('clean-prod', function () {
    return gulp.src('./build/*', {read: false})
        .pipe(ignore('.gitKeep'))
        .pipe(rimraf());
});

/* **********************************
 **  DEFINITION DES SERVEURS B-S **
********************************** */

// Serveur pour le dev
gulp.task('server-dev', function() {
    browserSync.init(["./app/**/*"], {
        server: {
            baseDir: "./app/"
        }
    });
});

// Serveur pour contrôler le build de prod
gulp.task('server-prod', function() {
    browserSync.init(["./build/**/*"], {
        server: {
            port: '3001',
            baseDir: "./build/"  
        }
    });
});

/* ********************
 **  TACHES FINALES **
******************** */

// Tache par defaut lancant le process de fichier less, lancant un serveur de dev
// creant l'index de dev, et watchant toutes les modif dans app
gulp.task(
    'default', 
    ['index-dev', 'less-dev', 'server-dev', 'dev-watcher']
);

// Tache generant tous les fichiers finaux destinés à la Flyport, plus
// demarage d'un serveur pour controle
gulp.task('prod', function() {
  runSequence('clean-prod',
            'vendor-js',
            'app-js',
            'less',
            ['index-prod','app-views', 'imagemin', 'api-prod'],
            'server-prod');
});
