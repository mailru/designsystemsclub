var gulp = require('gulp'),
    argv = require('yargs').argv,
    pug = require('gulp-pug'),
    serve = require('gulp-serve'),
    livereload = require('gulp-livereload'),
    exec = require('child_process').exec;

var assets = ['style/**/*','fonts/**/*','img/**/*','js/**/*'];

var cards = require('./data/companies-cards.json')

var projectOptions = {
    public: {
        dist: 'public_html/',
        data: {
            public: true,
            publicPath: '/',
            cards_component: cards.filter((card) => card.type === 'component'),
            cards_simple: cards.filter((card) => card.type === 'simple')
        }
    },
};

function copyAssets(dest) {
    return gulp.src(assets, {
        base: '.'
    }).pipe(gulp.dest(dest));
}

function compileTemplates(dest) {
    return (
        gulp.src(['templates/**/*.pug'])
            .pipe(pug({
                data: getTemplatesOptions()
            }))
            .pipe(gulp.dest(dest))
    );
}

function watchChanges() {
    livereload.listen();

    gulp.watch(assets, ['copy-assets']);
    gulp.watch(['**/*.pug'], ['build-templates']);
}

function getBuildType() {
    return argv['build-type'] || 'public';
}

function getDistFolder() {
    return projectOptions[getBuildType()].dist;
}

function getTemplatesOptions() {
    return projectOptions[getBuildType()].data;
}

gulp.task('copy-assets', function() {
    return copyAssets(getDistFolder())
        .pipe(livereload());
});

gulp.task('build-templates', function() {
    return compileTemplates(getDistFolder())
        .pipe(livereload());
});

gulp.task('build-public', function(done) {
    exec('npm run build', function(err) {
        done(err);
    });
});

gulp.task('serve-public', ['build-public'], function(done) {
    watchChanges();

    serve({
        root: projectOptions.public.dist,
        port: 8008
    })(done);
});

gulp.task('default', [
    'copy-assets',
    'build-templates'
]);
