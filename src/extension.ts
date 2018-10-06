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
import { languages, IndentAction, workspace, window, commands, ExtensionContext, TextDocument, Position, WorkspaceConfiguration, LanguageConfiguration } from "vscode";
import * as path from 'path';
import * as os from 'os';
import { activateTagClosing } from './tagClosing';

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
      // Register the server for xml and xsl
      documentSelector: ['xml', 'xsl'],
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

      disposable = activateTagClosing(tagRequestor, { xml: true, xsl: true }, 'xml.completion.autoCloseTags');
      toDispose.push(disposable);
    });
    languages.setLanguageConfiguration('xml', getIndentationRules());
    languages.setLanguageConfiguration('xsl', getIndentationRules());
  });

  function getSettings(): JSON {
    let configXML = workspace.getConfiguration();
    configXML = configXML.get('xml');
    let settings: JSON;
    if (!configXML) {
      const defaultValue = {
        logs: {

        },
        xml: {
          trace: {
            server: 'verbose'
          },
          logs: {
            client: true,
          },
          format: {
            enabled : true,
            splitAttributes: false
          },
          completion: {
            autoCloseTags: false
          }
        }
      }
      const x = JSON.stringify(defaultValue);
      settings = JSON.parse(x);
    } else {
      const x = JSON.stringify(configXML);
      settings = JSON.parse(x);
    }
    settings['logs']['file'] = logfile;

    return settings;
  }




}
function getIndentationRules(): LanguageConfiguration {
  return {
    onEnterRules: [
      {
        beforeText: new RegExp(`<([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)[^<]*$`, 'i'),
        afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>/i,
        action: { indentAction: IndentAction.IndentOutdent }
      },
      {
        beforeText: new RegExp(`<(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$`, 'i'),
        action: { indentAction: IndentAction.Indent }
      }
    ],
  };
}

