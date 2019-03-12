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
import { LanguageClientOptions, RevealOutputChannelOn, LanguageClient, DidChangeConfigurationNotification, RequestType, TextDocumentPositionParams, RequestType0 } from 'vscode-languageclient';
import * as requirements from './requirements';
import { languages, IndentAction, workspace, window, commands, ExtensionContext, TextDocument, Position, LanguageConfiguration } from "vscode";
import * as path from 'path';
import * as os from 'os';
import { activateTagClosing, AutoCloseResult } from './tagClosing';

export interface ScopeInfo {
  scope : "default" | "global" | "workspace" | "folder";
  configurationTarget: boolean;
}

namespace TagCloseRequest {
  export const type: RequestType<TextDocumentPositionParams, AutoCloseResult, any, any> = new RequestType('xml/closeTag');
}

let ignoreAutoCloseTags = false;
let vmArgsCache;
let ignoreVMArgs = false;

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
      documentSelector: [
        { scheme: 'file', language: 'xml' },
        { scheme: 'file', language: 'xsl' }
      ],
      revealOutputChannelOn: RevealOutputChannelOn.Never,
      //wrap with key 'settings' so it can be handled same a DidChangeConfiguration
      initializationOptions: {"settings": getXMLSettings()}, 
      synchronize: {
        //preferences starting with these will trigger didChangeConfiguration
        configurationSection: ['xml', '[xml]']
      },
      middleware: {
        workspace: {
          didChangeConfiguration: () => {
            languageClient.sendNotification(DidChangeConfigurationNotification.type, { settings: getXMLSettings() });
            if(!ignoreAutoCloseTags) {
              verifyAutoClosing();
            }
            !ignoreVMArgs ? verifyVMArgs(): undefined;
          }

        }
      }
    }

    let serverOptions = prepareExecutable(requirements);
    let languageClient = new LanguageClient('xml', 'XML Support', serverOptions, clientOptions);
    let toDispose = context.subscriptions;
    let disposable = languageClient.start();
    toDispose.push(disposable);
    languageClient.onReady().then(() => {
      //Setup autoCloseTags
      let tagProvider = (document: TextDocument, position: Position) => {
        let param = languageClient.code2ProtocolConverter.asTextDocumentPositionParams(document, position);
        let text = languageClient.sendRequest(TagCloseRequest.type, param);
        return text;
      };

      disposable = activateTagClosing(tagProvider, { xml: true, xsl: true }, 'xml.completion.autoCloseTags');
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
  function getXMLSettings(): JSON {
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
    return xml;
  }
}

function verifyAutoClosing() {
  let configXML = workspace.getConfiguration();
  let closeTags = configXML.get("xml.completion.autoCloseTags");
  let closeBrackets = configXML.get("[xml]")["editor.autoClosingBrackets"];
  if (closeTags && closeBrackets != "never") {
    window.showWarningMessage(
      "The [xml].editor.autoClosingBrackets setting conflicts with xml.completion.autoCloseTags. It's recommended to disable it.",
      "Disable",
      "Ignore").then((selection) => {
        if (selection == "Disable") {
          let scopeInfo : ScopeInfo = getScopeLevel("", "[xml]");
          workspace.getConfiguration().update("[xml]", { "editor.autoClosingBrackets": "never" }, scopeInfo.configurationTarget).then(
            () => console.log('[xml].editor.autoClosingBrackets globally set to never'),
            (error) => console.log(error)
          );
        }
        else if(selection == "Ignore") {
          ignoreAutoCloseTags = true;
        }
      });
  }
}

function verifyVMArgs() {
  let currentVMArgs = workspace.getConfiguration("xml.server").get("vmargs");
  if(vmArgsCache != undefined) {
    if(vmArgsCache != currentVMArgs) {
      window.showWarningMessage(
        "XML Language Server configuration changed, please restart VS Code.",
        "Restart",
        "Ignore").then((selection) => {
          if (selection == "Restart") {
            commands.executeCommand("workbench.action.reloadWindow");
          }
          else if(selection == "Ignore") {
            ignoreVMArgs = true;
          }
        });
    }
  }
  else {
    vmArgsCache = currentVMArgs;
  }
}

function getScopeLevel(configurationKey : string, key : string) : ScopeInfo{
  let configXML = workspace.getConfiguration(configurationKey);
  let result = configXML.inspect(key);
  let scope, configurationTarget;
  if(result.workspaceFolderValue == undefined) {
    if(result.workspaceValue == undefined) {
      if(result.globalValue == undefined) {
        scope = "default"
        configurationTarget = true;
      }
      else {
        scope = "global";
        configurationTarget = true;
      }
    }
    else {
      scope = "workspace";
      configurationTarget = false;
    }
  }
  else {
    scope = "folder";
    configurationTarget = undefined;
  }
  let scopeInfo : ScopeInfo = {"scope": scope, "configurationTarget": configurationTarget};
  return scopeInfo;
  
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

