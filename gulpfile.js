'use strict';
const gulp = require('gulp');
const cp = require('child_process');
const fse = require('fs-extra');
const glob = require('glob');

const server_dir = '../lemminx';

gulp.task('build_server', function (done) {
  cp.execSync(mvnw() + " clean verify -DskipTests", { cwd: server_dir, stdio: [0, 1, 2] });
  gulp.src(server_dir + '/org.eclipse.lemminx/target/org.eclipse.lemminx-uber.jar')
    .pipe(gulp.dest('./server'));
  done();
});

gulp.task('build_server_with_binary', function (done) {
  cp.execSync(mvnw() + " clean verify -DskipTests -Dnative", { cwd: server_dir, stdio: [0, 1, 2] });
  gulp.src([server_dir + '/org.eclipse.lemminx/target/org.eclipse.lemminx-uber.jar', server_dir + '/org.eclipse.lemminx/target/lemminx-*'])
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

gulp.task('prepare_pre_release', function (done) {
  const json = JSON.parse(fse.readFileSync("./package.json").toString());
  const stableVersion = json.version.match(/(\d+)\.(\d+)\.(\d+)/);
  const major = stableVersion[1];
  const minor = stableVersion[2];
  const date = new Date();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const patch = `${date.getFullYear()}${prependZero(month)}${prependZero(day)}${prependZero(hours)}`;
  const insiderPackageJson = Object.assign(json, {
    version: `${major}.${minor}.${patch}`,
  });
  fse.writeFileSync("./package.json", JSON.stringify(insiderPackageJson, null, 2));
  done();
});

function isWin() {
  return /^win/.test(process.platform);
}

function isMac() {
  return /^darwin/.test(process.platform);
}

function mvnw() {
  return isWin() ? "mvnw.cmd" : server_dir + "/mvnw";
}

function prependZero(number) {
  if (number > 99) {
    throw "Unexpected value to prepend with zero";
  }
  return `${number < 10 ? "0" : ""}${number}`;
}
