'use strict';

import * as cp from 'child_process';
import { findRuntimes, getSources, IJavaRuntime } from 'jdk-utils';
import * as path from 'path';
import { ConfigurationTarget, env, ExtensionContext, Uri, window, workspace } from 'vscode';
import { getJavaagentFlag, getJavaConfiguration, getKey, getXMLConfiguration, IS_WORKSPACE_JDK_ALLOWED, IS_WORKSPACE_JDK_XML_ALLOWED, IS_WORKSPACE_VMARGS_XML_ALLOWED, xmlServerVmargs } from '../settings/settings';
import * as pathExists from 'path-exists';
import * as expandHomeDir from 'expand-home-dir';

const isWindows = process.platform.indexOf('win') === 0;
const JAVA_FILENAME = 'java' + (isWindows ? '.exe' : '');

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
export async function resolveRequirements(context: ExtensionContext): Promise<RequirementsData> {
  const javaHome = await checkJavaRuntime(context);
  const javaVersion = await checkJavaVersion(javaHome);
  return Promise.resolve({ 'java_home': javaHome, 'java_version': javaVersion });
}

async function checkJavaRuntime(context: ExtensionContext): Promise<string> {
  let source: string;
  let javaHome = await readXMLJavaHomeConfig(context);
  if (javaHome) {
    source = 'The xml.java.home variable defined in VS Code settings';
  } else {
    javaHome = await readJavaHomeConfig(context);
    if (javaHome) {
      source = 'The java.home variable defined in VS Code settings';
    }
  }
  if (javaHome) {
    javaHome = expandHomeDir(javaHome);
    if (!pathExists.sync(javaHome)) {
      throw openJDKDownload(source + ' points to a missing folder');
    } else if (!pathExists.sync(path.resolve(javaHome, 'bin', JAVA_FILENAME))) {
      throw openJDKDownload(source + ' does not point to a Java runtime.');
    }
    return javaHome;
  }
  //No settings, let's try to detect as last resort.
  const javaRuntimes = await findRuntimes({ withVersion: true, withTags: true });
  if (javaRuntimes.length) {
    sortJdksBySource(javaRuntimes);
    javaHome = javaRuntimes[0].homedir;
  } else {
    throw openJDKDownload("Java runtime could not be located. Please download and install Java or use the binary server.");
  }
  return javaHome;
}

export async function readXMLJavaHomeConfig(context: ExtensionContext) {
  const xmlJavaHome = 'xml.java.home';
  let javaHome = workspace.getConfiguration().inspect<string>(xmlJavaHome).workspaceValue;
  let isVerified = javaHome === undefined || javaHome === null;
  if (isVerified) {
    javaHome = getXMLConfiguration().get("java.home");
  }
  const allow = 'Allow';
  const disallow = 'Disallow';
  const key = getKey(IS_WORKSPACE_JDK_XML_ALLOWED, context.storagePath, javaHome);
  const globalState = context.globalState;
  if (!isVerified) {
    isVerified = globalState.get(key);
    if (isVerified === undefined) {
      await window.showErrorMessage(`Security Warning! Do you allow this workspace to set the ${xmlJavaHome} variable? \n ${xmlJavaHome}: ${javaHome}`, disallow, allow).then(async selection => {
        if (selection === allow) {
          globalState.update(key, true);
        } else if (selection === disallow) {
          globalState.update(key, false);
          await workspace.getConfiguration().update(xmlJavaHome, undefined, ConfigurationTarget.Workspace);
        }
      });
      isVerified = globalState.get(key);
    }
  }
  const vmargs = workspace.getConfiguration().inspect(xmlServerVmargs).workspaceValue;
  if (vmargs !== undefined) {
    const agentFlag = getJavaagentFlag(vmargs);
    if (agentFlag !== null) {
      const keyVmargs = getKey(IS_WORKSPACE_VMARGS_XML_ALLOWED, context.storagePath, vmargs);
      const vmargsVerified = globalState.get(keyVmargs);
      if (vmargsVerified === undefined || vmargsVerified === null) {
        await window.showErrorMessage(`Security Warning! The ${xmlServerVmargs} variable defined in ${env.appName} settings includes the (${agentFlag}) javagent preference. Do you allow it to be used?`, disallow, allow).then(async selection => {
          if (selection === allow) {
            globalState.update(keyVmargs, true);
          } else if (selection === disallow) {
            globalState.update(keyVmargs, false);
            await workspace.getConfiguration().update(xmlServerVmargs, undefined, ConfigurationTarget.Workspace);
          }
        });
      }
    }
  }
  if (isVerified) {
    return javaHome;
  } else {
    return workspace.getConfiguration().inspect<string>('xml.java.home').globalValue;
  }
}

function sortJdksBySource(jdks: IJavaRuntime[]) {
  const rankedJdks = jdks as Array<IJavaRuntime & { rank: number }>;
  const sources = ["JDK_HOME", "JAVA_HOME", "PATH"];
  for (const [index, source] of sources.entries()) {
    for (const jdk of rankedJdks) {
      if (jdk.rank === undefined && getSources(jdk).includes(source)) {
        jdk.rank = index;
      }
    }
  }
  rankedJdks.filter(jdk => jdk.rank === undefined).forEach(jdk => jdk.rank = sources.length);
  rankedJdks.filter(jdk => jdk.version.major >= 11);
  rankedJdks.sort((a, b) => a.rank - b.rank);
}

async function readJavaHomeConfig(context: ExtensionContext) {
  let javaHome = workspace.getConfiguration().inspect<string>('java.home').workspaceValue;
  let isVerified = javaHome === undefined || javaHome === null;
  if (isVerified) {
    javaHome = getJavaConfiguration().get('home');
  }
  const key = getKey(IS_WORKSPACE_JDK_ALLOWED, context.storagePath, javaHome);
  const globalState = context.globalState;
  isVerified = globalState.get(key);
  if (isVerified) {
    return javaHome;
  } else {
    return workspace.getConfiguration().inspect<string>('java.home').globalValue;
  }
}

function checkJavaVersion(java_home: string): Promise<number> {
  return new Promise((resolve, reject) => {
    cp.execFile(java_home + '/bin/java', ['-version'], {}, (error, stdout, stderr) => {
      const javaVersion = parseMajorVersion(stderr);
      if (javaVersion < 11) {
        reject(openJDKDownload('Java 11 or more recent is required to run. Please download and install a recent Java runtime.'));
      }
      else {
        resolve(javaVersion);
      }
    });
  });
}

export function parseMajorVersion(content: string): number {
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

function openJDKDownload(cause: string): ErrorData {
  return {
    message: cause,
    label: 'Get the Java runtime',
    openUrl: getOpenJDKDownloadLink(),
    replaceClose: false
  };
}

export function getOpenJDKDownloadLink(): Uri {
  let jdkUrl = 'https://developers.redhat.com/products/openjdk/download/?sc_cid=701f2000000RWTnAAO';
  if (process.platform === 'darwin') {
    jdkUrl = 'https://adoptium.net/temurin/releases';
  }
  return Uri.parse(jdkUrl);
}
