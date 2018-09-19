/**
 *  Copyright (c) 2018 Red Hat, Inc. and others.
 *  All rights reserved. This program and the accompanying materials
 *  are made available under the terms of the Eclipse Public License v1.0
 *  which accompanies this distribution, and is available at
 *  http://www.eclipse.org/legal/epl-v10.html
 *
 *  Contributors:
 *  Red Hat Inc. - initial API and implementation
 *  Microsoft Corporation - Auto Closing Tags
 */

import { prepareExecutable } from './javaServerStarter';
import { LanguageClientOptions, RevealOutputChannelOn, LanguageClient, DidChangeConfigurationNotification, RequestType, TextDocumentPositionParams } from 'vscode-languageclient';
import * as requirements from './requirements';
import { workspace, window, commands, ExtensionContext, TextDocument, Position } from "vscode";
import * as path from 'path';
import * as os from 'os';
import { activateTagClosing } from './tagClosing';

interface Settings {
  catalogs: String[],
  logs: {},
  format: {},
  fileAssociations: JSON[],
  completion: {}
}

namespace TagCloseRequest {
  export const type: RequestType<TextDocumentPositionParams, string, any, any> = new RequestType('xml/closeTag');
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
      initializationOptions: { settings: getSettings() },
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
    let toDispose = context.subscriptions;
    let disposable = languageClient.start();
    toDispose.push(disposable);
    languageClient.onReady().then(() => {
      //init
      let tagRequestor = (document: TextDocument, position: Position) => {
        let param = languageClient.code2ProtocolConverter.asTextDocumentPositionParams(document, position);
        return languageClient.sendRequest(TagCloseRequest.type, param);
      };

      disposable = activateTagClosing(tagRequestor, { xml: true}, 'xml.completion.autoCloseTags');
      toDispose.push(disposable);
    });
  });

  function getSettings(): Settings {

    let configXML = workspace.getConfiguration('xml');
    let configCatalogs = configXML.get('catalogs') as String[];
    let configFormats = configXML.get('format');

    let configLogs = configXML.get('logs');
    configLogs["file"] = logfile;

    let configFileAssociations = configXML.get('fileAssociations') as JSON[];

    let configCompletion = configXML.get('completion');

    let settings: Settings = {
      catalogs: configCatalogs,
      logs: configLogs,
      format: configFormats,
      fileAssociations: configFileAssociations,
      completion: configCompletion
    }

    return settings;
  }




}
