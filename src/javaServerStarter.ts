import { workspace, ExtensionContext } from 'vscode'
import { Executable, ExecutableOptions } from 'vscode-languageclient';
import { RequirementsData } from './requirements';
import * as os from 'os';
import * as path from 'path';
import { xmlServerVmargs, getJavaagentFlag, getKey, IS_WORKSPACE_VMARGS_XML_ALLOWED, getXMLConfiguration } from './settings';
const glob = require('glob');

declare var v8debug;

const DEBUG = (typeof v8debug === 'object') || startedInDebugMode();

export function prepareExecutable(requirements: RequirementsData, xmlJavaExtensions: string[], context: ExtensionContext): Executable {
  let executable: Executable = Object.create(null);
  let options: ExecutableOptions = Object.create(null);
  options.env = process.env;
  options.stdio = 'pipe';
  executable.options = options;
  executable.command = path.resolve(requirements.java_home + '/bin/java');
  executable.args = prepareParams(requirements, xmlJavaExtensions, context);
  return executable;
}

function prepareParams(requirements: RequirementsData, xmlJavaExtensions: string[], context: ExtensionContext): string[] {
  let params: string[] = [];
  if (DEBUG) {
    params.push('-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=1054,quiet=y');
    // suspend=y is the default. Use this form if you need to debug the server startup code:
    //params.push('-agentlib:jdwp=transport=dt_socket,server=y,address=1054');
  }
  let vmargsCheck = workspace.getConfiguration().inspect(xmlServerVmargs).workspaceValue;
  if (vmargsCheck !== undefined) {
    const agentFlag = getJavaagentFlag(vmargsCheck);
    if (agentFlag !== null) {
      const keyVmargs = getKey(IS_WORKSPACE_VMARGS_XML_ALLOWED, context.storagePath, vmargsCheck);
      const key = context.globalState.get(keyVmargs);
      if (key !== true) {
        vmargsCheck = workspace.getConfiguration().inspect(xmlServerVmargs).globalValue;
      }
    }
  } else {
    vmargsCheck = getXMLConfiguration().get('')
  }
  let vmargs;
  if (vmargsCheck !== undefined) {
    vmargs = vmargsCheck + '';
  } else {
    vmargs = '';
  }
  if (os.platform() == 'win32') {
    const watchParentProcess = '-DwatchParentProcess=';
    if (vmargs.indexOf(watchParentProcess) < 0) {
      params.push(watchParentProcess + 'false');
    }
  }
  parseVMargs(params, vmargs);
  let server_home: string = path.resolve(__dirname, '../server');
  let launchersFound: Array<string> = glob.sync('**/org.eclipse.lsp4xml-uber.jar', { cwd: server_home });
  if (launchersFound.length) {
    let xmlJavaExtensionsClasspath = '';
    if (xmlJavaExtensions.length > 0) {
      const pathSeparator = os.platform() == 'win32' ? ';' : ':';
      xmlJavaExtensionsClasspath = pathSeparator + xmlJavaExtensions.join(pathSeparator);
    }    
    params.push('-cp'); params.push(path.resolve(server_home, launchersFound[0]) + xmlJavaExtensionsClasspath);
    params.push('org.eclipse.lsp4xml.XMLServerLauncher');
  } else {
    return null;
  }
  return params;
}

function startedInDebugMode(): boolean {
  let args = (process as any).execArgv;
  if (args) {
    return args.some((arg) => /^--debug=?/.test(arg) || /^--debug-brk=?/.test(arg) || /^--inspect-brk=?/.test(arg));
  };
  return false;
}

//exported for tests
export function parseVMargs(params: any[], vmargsLine: string) {
	if (!vmargsLine) {
		return;
	}
	let vmargs = vmargsLine.match(/(?:[^\s"]+|"[^"]*")+/g);
	if (vmargs === null) {
		return;
	}
	vmargs.forEach(arg => {
		//remove all standalone double quotes
		arg = arg.replace(/(\\)?"/g, function ($0, $1) { return ($1 ? $0 : ''); });
		//unescape all escaped double quotes
		arg = arg.replace(/(\\)"/g, '"');
		if (params.indexOf(arg) < 0) {
			params.push(arg);
		}
	});
}
