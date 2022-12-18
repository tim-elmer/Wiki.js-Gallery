import { deleteSync } from 'del';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import gulp from 'gulp';
import ts from 'gulp-typescript';
import GulpUglify from 'gulp-uglify';
const { series, parallel, src, dest, task } = gulp;
const sass = gulpSass(dartSass);

function Clean(callback) {
    deleteSync("build/*");
    callback();
}

function TranspileTs(callback) {
    var project = ts.createProject("tsconfig.json");
    src("src/**/*.ts")
        .pipe(project()
            .on("error", () => { })
        )
        .js
        .pipe(dest("build/debug"))
        .pipe(GulpUglify())
        .pipe(dest("build/ship"));
    callback();
}

function TranspileSass(callback) {
    src(["src/**/*.scss", "src/**/*.sass"])
        .pipe(sass().on('error', sass.logError))
        .pipe(dest("build/debug"))
        .pipe(dest("build/ship"));
    callback();
}

function CopyHtml(callback) {
    src("src/**/*.html")
        .pipe(dest("build/debug"));
    callback();
}

task(Clean);
task("Build", function (callback) {
    series(
        Clean,
        parallel(
            TranspileSass,
            CopyHtml,
            TranspileTs
        )
    ).call();
    callback();
});