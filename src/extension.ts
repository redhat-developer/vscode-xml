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
import { LanguageClientOptions, RevealOutputChannelOn, LanguageClient, DidChangeConfigurationNotification, RequestType, TextDocumentPositionParams, ReferencesRequest } from 'vscode-languageclient';
import * as requirements from './requirements';
import { languages, IndentAction, workspace, window, commands, ExtensionContext, TextDocument, Position, LanguageConfiguration, Uri, extensions } from "vscode";
import * as path from 'path';
import * as os from 'os';
import { activateTagClosing, AutoCloseResult } from './tagClosing';
import { Commands } from './commands';
import { onConfigurationChange, subscribeJDKChangeConfiguration } from './settings';
import { collectXmlJavaExtensions, onExtensionChange } from './plugin';

export interface ScopeInfo {
  scope : "default" | "global" | "workspace" | "folder";
  configurationTarget: boolean;
}

namespace TagCloseRequest {
  export const type: RequestType<TextDocumentPositionParams, AutoCloseResult, any, any> = new RequestType('xml/closeTag');
}



export function activate(context: ExtensionContext) {
  let storagePath = context.storagePath;
  if (!storagePath) {
    storagePath = os.homedir() + "/.lsp4xml";
  }
  let logfile = path.resolve(storagePath + '/lsp4xml.log');

  return requirements.resolveRequirements(context).catch(error => {
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
      documentSelector: [
        { scheme: 'file', language: 'xml' },
        { scheme: 'file', language: 'xsl' },
        { scheme: 'untitled', language: 'xml' },
        { scheme: 'untitled', language: 'xsl' }
      ],
      revealOutputChannelOn: RevealOutputChannelOn.Never,
      //wrap with key 'settings' so it can be handled same a DidChangeConfiguration
      initializationOptions: {
        settings: getXMLSettings(requirements.java_home),
        extendedClientCapabilities: {
          codeLens: {
            codeLensKind: {
              valueSet: [
                'references'
              ]
            }
          }
        }
      }, 
      synchronize: {
        //preferences starting with these will trigger didChangeConfiguration
        configurationSection: ['xml', '[xml]']
      },
      middleware: {
        workspace: {
          didChangeConfiguration: () => {
            languageClient.sendNotification(DidChangeConfigurationNotification.type, { settings: getXMLSettings(requirements.java_home) });
            onConfigurationChange();
          }
        }
      }
    }

    let serverOptions = prepareExecutable(requirements, collectXmlJavaExtensions(extensions.all), context);
    let languageClient = new LanguageClient('xml', 'XML Support', serverOptions, clientOptions);
    let toDispose = context.subscriptions;
    let disposable = languageClient.start();
    toDispose.push(disposable);
    languageClient.onReady().then(() => {
      //Detect JDK configuration changes
      disposable = subscribeJDKChangeConfiguration();
      toDispose.push(disposable);

      // Code Lens actions
      context.subscriptions.push(commands.registerCommand(Commands.SHOW_REFERENCES, (uriString: string, position: Position) => {
        const uri = Uri.parse(uriString);
        workspace.openTextDocument(uri).then(document => {
          // Consume references service from the XML Language Server
          let param = languageClient.code2ProtocolConverter.asTextDocumentPositionParams(document, position);
          languageClient.sendRequest(ReferencesRequest.type, param).then(locations => {
            commands.executeCommand(Commands.EDITOR_SHOW_REFERENCES, uri, languageClient.protocol2CodeConverter.asPosition(position), locations.map(languageClient.protocol2CodeConverter.asLocation));
          })
        })
      }));

      //Setup autoCloseTags
      let tagProvider = (document: TextDocument, position: Position) => {
        let param = languageClient.code2ProtocolConverter.asTextDocumentPositionParams(document, position);
        let text = languageClient.sendRequest(TagCloseRequest.type, param);
        return text;
      };

      if (extensions.onDidChange) {// Theia doesn't support this API yet
        extensions.onDidChange(() => {
          onExtensionChange(extensions.all);
        });
      }

      disposable = activateTagClosing(tagProvider, { xml: true, xsl: true }, Commands.AUTO_CLOSE_TAGS);
      toDispose.push(disposable);
    });
    languages.setLanguageConfiguration('xml', getIndentationRules());
    languages.setLanguageConfiguration('xsl', getIndentationRules());
  });

  /**
   * Returns a json object with key 'xml' and a json object value that
   * holds all xml. settings.
   * 
   * Returns: {
   *            'xml': {...}
   *          }
   */
  function getXMLSettings(javaHome: string): JSON {
    let configXML = workspace.getConfiguration().get('xml');
    let xml;
    if (!configXML) { //Set default preferences if not provided
      const defaultValue = 
      {
        xml: {
          trace: {
            server: 'verbose'
          },
          logs: {
            client: true
          },
          format: {
            enabled: true,
            splitAttributes: false
          },
          completion: {
            autoCloseTags: false
          }
        }
      }
      xml = defaultValue;
    } else {
      let x = JSON.stringify(configXML); //configXML is not a JSON type
      xml = { "xml" : JSON.parse(x)};
    }
    xml['xml']['logs']['file'] = logfile;
    xml['xml']['useCache'] = true;
    xml['xml']['java']['home'] = javaHome;
    return xml;
  }
}

function getIndentationRules(): LanguageConfiguration {
  return {
    
    // indentationRules referenced from:
    // https://github.com/microsoft/vscode/blob/d00558037359acceea329e718036c19625f91a1a/extensions/html-language-features/client/src/htmlMain.ts#L114-L115
    indentationRules: {
      increaseIndentPattern: /<(?!\?|[^>]*\/>)([-_\.A-Za-z0-9]+)(?=\s|>)\b[^>]*>(?!.*<\/\1>)|<!--(?!.*-->)|\{[^}"']*$/,
      decreaseIndentPattern: /^\s*(<\/[-_\.A-Za-z0-9]+\b[^>]*>|-->|\})/
    },
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
    ]
  };
}

