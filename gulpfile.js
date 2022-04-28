'use strict';
const gulp = require('gulp');
const gulp_tslint = require('gulp-tslint');
const cp = require('child_process');
const server_dir = '../lemminx';
const fse = require('fs-extra');
const glob = require('glob');

gulp.task('tslint', () => {
    return gulp.src(['**/*.ts', '!**/*.d.ts', '!node_modules/**'])
      .pipe(gulp_tslint())
      .pipe(gulp_tslint.report());
});

gulp.task('build_server', function(done) {
	cp.execSync(mvnw()+ " clean verify -DskipTests", {cwd:server_dir, stdio:[0,1,2]} );
  gulp.src(server_dir +'/org.eclipse.lemminx/target/org.eclipse.lemminx-uber.jar')
		.pipe(gulp.dest('./server'));
	done();
});

gulp.task('build_server_with_binary', function(done) {
	cp.execSync(mvnw()+ " clean verify -DskipTests -Dnative", {cwd:server_dir, stdio:[0,1,2]} );
	gulp.src([server_dir +'/org.eclipse.lemminx/target/org.eclipse.lemminx-uber.jar', server_dir +'/org.eclipse.lemminx/target/lemminx-*'])
		.pipe(gulp.dest('./server'))
		.on('end', function () {
			glob.Glob('./server/lemminx-*.txt', (_er, txtfiles) => {
				fse.removeSync(txtfiles[0]);
				glob.Glob('./server/lemminx-*-*', (_err, binfiles) => {
					fse.moveSync(binfiles[0], './server/lemminx-' + (isWin() ? 'win32.exe' : (isMac() ? 'osx-x86_64' : 'linux')), { overwrite: true });
				});
			});
		});
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
