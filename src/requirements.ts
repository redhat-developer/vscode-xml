'use strict';

import { workspace, Uri } from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';

const pathExists = require('path-exists');
const expandHomeDir = require('expand-home-dir');
const findJavaHome = require('find-java-home');
const isWindows = process.platform.indexOf('win') === 0;
const JAVAC_FILENAME = 'javac' + (isWindows?'.exe':'');

export interface RequirementsData {
    java_home: string;
    java_version: number;
}

interface ErrorData {
    message: string;
    label: string;
    openUrl: Uri;
    replaceClose: boolean;
}
/**
 * Resolves the requirements needed to run the extension.
 * Returns a promise that will resolve to a RequirementsData if
 * all requirements are resolved, it will reject with ErrorData if
 * if any of the requirements fails to resolve.
 *
 */
export async function resolveRequirements(): Promise<RequirementsData> {
    const javaHome = await checkJavaRuntime();
    const javaVersion = await checkJavaVersion(javaHome);
    return Promise.resolve({ 'java_home': javaHome, 'java_version': javaVersion});
}

function checkJavaRuntime(): Promise<string> {
    return new Promise((resolve, reject) => {
        
        checkXMLJavaHome(resolve, reject);
        checkJavaHome(resolve, reject);
        checkEnvVariable('JDK_HOME', resolve, reject);
        checkEnvVariable('JAVA_HOME', resolve, reject);

        //No settings, let's try to detect as last resort.
        findJavaHome(function (err, home) {
            if (err){
                openJDKDownload(reject, 'Java runtime could not be located.');
            }
            else {
                resolve(home);
            }
        });
    });
}

function checkXMLJavaHome(resolve, reject) {
    const javaHome = readXMLJavaHomeConfig();
    if (!javaHome) {
        return;
    }
    const source = 'The xml.java.home variable defined in VS Code settings';
    handleJavaPath(javaHome, source, resolve, reject);
}

function checkJavaHome(resolve, reject) {
    const javaHome = readJavaHomeConfig();
    if (!javaHome) {
        return;
    }
    const source = 'The java.home variable defined in VS Code settings';
    handleJavaPath(javaHome, source, resolve, reject);
}

function checkEnvVariable(name : string, resolve, reject) {
    if (!process.env[name]) {
        return;
    } 
    const source = `The ${name} environment variable`;
    handleJavaPath(process.env[name], source, resolve, reject);
}

function readXMLJavaHomeConfig() : string {
    return workspace.getConfiguration('xml').java.home;
}

function readJavaHomeConfig() : string {
    const config = workspace.getConfiguration();
    return config.get<string>('java.home',null);
}

function handleJavaPath(javaHome : string, source : string, resolve, reject) {
    const javaHomeExpanded = expandHomeDir(javaHome);

    if (!pathExists.sync(javaHomeExpanded)) {
        openJDKDownload(reject, source + ' points to a missing folder.');
    }
    if (!pathExists.sync(path.resolve(javaHomeExpanded, 'bin', JAVAC_FILENAME))) {
        openJDKDownload(reject, source + ' does not point to a JDK.');
    }
    return resolve(javaHomeExpanded);
}
 
function checkJavaVersion(java_home: string): Promise<number> {
    return new Promise((resolve, reject) => {
        cp.execFile(java_home + '/bin/java', ['-version'], {}, (error, stdout, stderr) => {
            let javaVersion = parseMajorVersion(stderr);
            if (javaVersion < 8) {
                openJDKDownload(reject, 'Java 8 or more recent is required to run. Please download and install a recent JDK.');
            }
            else {
                resolve(javaVersion);
            }
        });
    });
}

export function parseMajorVersion(content:string):number {
    let regexp = /version "(.*)"/g;
    let match = regexp.exec(content);
    if (!match) {
        return 0;
    }
    let version = match[1];
    //Ignore '1.' prefix for legacy Java versions
    if (version.startsWith('1.')) {
        version = version.substring(2);
    }

    //look into the interesting bits now
    regexp = /\d+/g;
    match = regexp.exec(version);
    let javaVersion = 0;
    if (match) {
        javaVersion = parseInt(match[0]);
    }
    return javaVersion;
}

function openJDKDownload(reject, cause : string) {
    let jdkUrl = 'https://developers.redhat.com/products/openjdk/download/?sc_cid=701f2000000RWTnAAO';
    if (process.platform === 'darwin') {
        jdkUrl = 'http://www.oracle.com/technetwork/java/javase/downloads/index.html';
    }
    reject({
        message: cause,
        label: 'Get the Java Development Kit',
        openUrl: Uri.parse(jdkUrl),
        replaceClose: false
    });
}
