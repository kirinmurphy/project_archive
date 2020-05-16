var gulp = require('gulp');
var markdown = require('gulp-markdown');
var cheerio = require('gulp-cheerio');
var prettify = require('gulp-html-prettify');
var injectfile = require("gulp-inject-file");
var filenames = require("gulp-filenames");

gulp.task('default', ['markdownTemplates']);

gulp.task('watch', ['markdownTemplates'], function () {
  gulp.watch('source_files/**/*.md', ['markdownTemplates']).on('change', logChanges);
});

gulp.task('markdownize', function () {
  return gulp.src('source_files/**/*.md')
    .pipe(injectfile({ pattern: '<!--\\s*inject:<filename>-->' }))
    .pipe(markdown())
    .pipe(cheerio(parseMarkup))
    .pipe(prettify({indent_char: ' ', indent_size: 2}))
    .pipe(gulp.dest('dist'));
});

gulp.task('getHtmlFileList', ['markdownize'], function () {
  return gulp.src('dist/*.html')
    .pipe(filenames("markdownz"))
});

gulp.task('markdownTemplates', ['getHtmlFileList'], function () {
  console.log(filenames.get("markdownz"))
});

function logChanges (event) {
  console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
}

function parseMarkup ($, file) {
  htmlize($, 'h3', 'section');
  htmlize($, 'h4', 'sub-section');
}

function htmlize ($, tag, wrapperClass) {
  $(tag).each(function () {
    var $title = $(this);
    var $nextStuff = $title.nextUntil(tag);
    var $wrapper = $('<div class="' + wrapperClass + '"></div>');
    var $header = $('<header></header>');
    $title.wrap($header);
    $header.wrap($wrapper);
    var $content = $('<div class="content"></div>');
    $content.append($nextStuff).appendTo($wrapper);
  });
}
