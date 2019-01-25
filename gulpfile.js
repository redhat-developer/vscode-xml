'use strict';
const gulp = require('gulp');
const gulp_tslint = require('gulp-tslint');
const cp = require('child_process');
const server_dir = '../lsp4xml';

gulp.task('tslint', () => {
    return gulp.src(['**/*.ts', '!**/*.d.ts', '!node_modules/**'])
      .pipe(gulp_tslint())
      .pipe(gulp_tslint.report());
});

gulp.task('build_server', function(done) {
	cp.execSync(mvnw()+ " -o clean verify -DskipTests -pl \"!extensions,!extensions/org.eclipse.lsp4xml.extensions.emmet,!extensions/org.eclipse.lsp4xml.extensions.web\"", {cwd:server_dir, stdio:[0,1,2]} );
  gulp.src(server_dir +'/org.eclipse.lsp4xml/target/org.eclipse.lsp4xml-uber.jar')
		.pipe(gulp.dest('./server'));
	done();
});


function isWin() {
	return /^win/.test(process.platform);
}

function isMac() {
	return /^darwin/.test(process.platform);
}

function isLinux() {
	return /^linux/.test(process.platform);
}

function mvnw() {
	return isWin()? "mvnw.cmd": server_dir+"/mvnw";
}