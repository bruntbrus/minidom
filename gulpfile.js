/*
 * Gulp tasks
 */

/* jshint node: true */

const gulp = require('gulp')

// Configuration
const config = {
  srcDir: 'src',
  distDir: 'dist',
}

// Runs lint task by default
gulp.task('default', ['lint'])

// Runs all lint tasks
gulp.task('lint', ['lint:src', 'lint:node'])

// Lint checks scripts
gulp.task('lint:src', () => lint(config.srcDir + '/*.js'))

// Lint checks node scripts
gulp.task('lint:node', () => lint('*.js'))

// Runs all build tasks
gulp.task('build', ['build:dist'])

// Builds distributable file
gulp.task('build:dist', () => {
  const babel = require('gulp-babel')
  const sourcemaps = require('gulp-sourcemaps')

  const babelOptions = {
    sourceType: 'script',
    presets: [
      ['env', { modules: false }],
    ],
    shouldPrintComment: (comment) => (comment.charAt(0) === '!'),
  }

  return gulp.src(config.srcDir + '/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel(babelOptions))
    .pipe(sourcemaps.write(''))
    .pipe(gulp.dest(config.distDir))
})

// Lint checks files
function lint(globs) {
  const jshint = require('gulp-jshint')

  return gulp.src(globs)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
}
