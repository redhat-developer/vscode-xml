
import * as vscode from "vscode";
import { prepareExecutable } from './javaServerStarter';
import { LanguageClientOptions, RevealOutputChannelOn, LanguageClient } from 'vscode-languageclient';
import * as requirements from './requirements';
import { window, commands, ExtensionContext } from "vscode";

export function activate(context: ExtensionContext) {

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
      revealOutputChannelOn: RevealOutputChannelOn.Never
    }

    let serverOptions = prepareExecutable(requirements);
    let languageClient = new LanguageClient('xml', 'XML Support', serverOptions, clientOptions);
    languageClient.onReady().then(() => {
      //init
    });
    let disposable = languageClient.start();
    context.subscriptions.push(disposable);
  });

}
