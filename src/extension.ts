
import { prepareExecutable } from './javaServerStarter';
import { LanguageClientOptions, RevealOutputChannelOn, LanguageClient, DidChangeConfigurationNotification } from 'vscode-languageclient';
import * as requirements from './requirements';
import { workspace, window, commands, ExtensionContext } from "vscode";
import * as path from 'path';
import * as os from 'os';

interface Settings {
  catalogs: String[],
  logs: {},
  format: {}
}

export function activate(context: ExtensionContext) {
  let storagePath = context.storagePath;
  if (!storagePath) {
    storagePath = os.homedir() + "/.lsp4xml";
  }
  let logfile = path.resolve(storagePath + '/lsp4xml.log');

  return requirements.resolveRequirements().catch(error => {
    //show error
    window.showErrorMessage(error.message, error.label).then((selection) => {
      if (error.label && error.label === selection && error.openUrl) {
        commands.executeCommand('vscode.open', error.openUrl);
      }
    });
    // rethrow to disrupt the chain.
    throw error;
  }).then(requirements => {
    let clientOptions: LanguageClientOptions = {
      // Register the server for java
      documentSelector: ['xml'],
      revealOutputChannelOn: RevealOutputChannelOn.Never,
      initializationOptions: {settings: getSettings() },
      synchronize: {
        configurationSection: ['xml']
      },
      middleware: {
        workspace: {
          didChangeConfiguration: () => languageClient.sendNotification(DidChangeConfigurationNotification.type, { settings: getSettings() })
        }
      }

    }

    let serverOptions = prepareExecutable(requirements);
    let languageClient = new LanguageClient('xml', 'XML Support', serverOptions, clientOptions);
    languageClient.onReady().then(() => {
      //init
    });
    let disposable = languageClient.start();
    context.subscriptions.push(disposable);

  });

  function getSettings(): Settings {

    let configXML = workspace.getConfiguration('xml');
    let configCatalogs = configXML.get('catalogs') as String[];
    let configFormats = configXML.get('format');

    let configLogs = configXML.get('logs');
    configLogs["file"] = logfile;

    let settings: Settings = {
      catalogs: configCatalogs,
      logs: configLogs,
      format: configFormats
    }

    return settings;
  }




}
