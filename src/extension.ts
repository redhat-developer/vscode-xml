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

import * as os from 'os';
import * as path from 'path';
import { Command, commands, ExtensionContext, extensions, IndentAction, LanguageConfiguration, languages, Position, TextDocument, TextEditor, Uri, window, workspace } from "vscode";
import { CancellationToken, ConfigurationParams, ConfigurationRequest, DidChangeConfigurationNotification, ExecuteCommandParams, ExecuteCommandRequest, LanguageClient, LanguageClientOptions, MessageType, NotificationType, ReferencesRequest, RequestType, RevealOutputChannelOn, TextDocumentIdentifier, TextDocumentPositionParams } from 'vscode-languageclient';
import { Commands } from './commands';
import { prepareExecutable } from './javaServerStarter';
import { markdownPreviewProvider } from "./markdownPreviewProvider";
import { collectXmlJavaExtensions, onExtensionChange } from './plugin';
import * as requirements from './requirements';
import { getXMLConfiguration, onConfigurationChange, subscribeJDKChangeConfiguration } from './settings';
import { activateTagClosing, AutoCloseResult } from './tagClosing';
import { containsVariableReferenceToCurrentFile, getVariableSubstitutedAssociations } from './variableSubstitution';

export interface ScopeInfo {
  scope: "default" | "global" | "workspace" | "folder";
  configurationTarget: boolean;
}

/**
 * Interface for the FileAssociation shape.
 * @param systemId - The path to a valid XSD.
 * @param pattern - The file pattern associated with the XSD.
 *
 * @returns None
 */
export interface XMLFileAssociation {
  systemId: string,
  pattern: string;
}

/**
 * Interface for APIs exposed from the extension.
 *
 * @remarks
 * A sample code to use these APIs are as following:
 * const ext = await vscode.extensions.getExtension('redhat.vscode-xml').activate();
 * ext.addXMLCatalogs(...);
 * ext.removeXMLCatalogs(...);
 * ext.addXMLFileAssociations(...);
 * ext.removeXMLFileAssociations(...);
 */
export interface XMLExtensionApi {
  /**
   * Adds XML Catalogs in addition to the catalogs defined in the settings.json file.
   *
   * @remarks
   * An example is to call this API:
   * ```ts
   * addXMLCatalogs(['path/to/catalog.xml', 'path/to/anotherCatalog.xml'])
   * ```
   * @param catalogs - A list of path to XML catalogs
   * @returns None
   */
  addXMLCatalogs(catalogs: string[]): void;
  /**
   * Removes XML Catalogs from the extension.
   *
   * @remarks
   * An example is to call this API:
   * ```ts
   * removeXMLCatalogs(['path/to/catalog.xml', 'path/to/anotherCatalog.xml'])
   * ```
   * @param catalogs - A list of path to XML catalogs
   * @returns None
   */
  removeXMLCatalogs(catalogs: string[]): void;
  /**
   * Adds XML File Associations in addition to the catalogs defined in the settings.json file.
   *
   * @remarks
   * An example is to call this API:
   * ```ts
   * addXMLFileAssociations([{
   *    "systemId": "path/to/file.xsd",
   *    "pattern": "file1.xml"
   *  },{
   *    "systemId": "http://www.w3.org/2001/XMLSchema.xsd",
   *    "pattern": "file2.xml"
   *  }])
   * ```
   * @param fileAssociations - A list of file association
   * @returns None
   */
  addXMLFileAssociations(fileAssociations: XMLFileAssociation[]): void;
  /**
   * Removes XML File Associations from the extension.
   *
   * @remarks
   * An example is to call this API:
   * ```ts
   * removeXMLFileAssociations([{
   *    "systemId": "path/to/file.xsd",
   *    "pattern": "file1.xml"
   *  },{
   *    "systemId": "http://www.w3.org/2001/XMLSchema.xsd",
   *    "pattern": "file2.xml"
   *  }])
   * ```
   * @param fileAssociations - A list of file association
   * @returns None
   */
  removeXMLFileAssociations(fileAssociations: XMLFileAssociation[]): void;

}

namespace ExecuteClientCommandRequest {
  export const type: RequestType<ExecuteCommandParams, any, void, void> = new RequestType('xml/executeClientCommand')
}

namespace TagCloseRequest {
  export const type: RequestType<TextDocumentPositionParams, AutoCloseResult, any, any> = new RequestType('xml/closeTag');
}

namespace SymbolsLimitExceededNotification {
  export const type: NotificationType<{ commandId: string, message: string }, any> = new NotificationType('xml/symbolsLimitExceeded');
}

interface ActionableMessage {
  severity: MessageType;
  message: string;
  data?: any;
  commands?: Command[];
}

namespace ActionableNotification {
  export const type = new NotificationType<ActionableMessage, void>('xml/actionableNotification');
}

let languageClient: LanguageClient;

export function activate(context: ExtensionContext) {
  // Register commands for XML documentation
  context.subscriptions.push(markdownPreviewProvider);
  context.subscriptions.push(commands.registerCommand(Commands.OPEN_DOCS_HOME, async () => {
    const uri = 'README.md';
    const title = 'XML Documentation';
    const sectionId = '';
    markdownPreviewProvider.show(context.asAbsolutePath(path.join('docs', uri)), title, sectionId, context);
  }));
  context.subscriptions.push(commands.registerCommand(Commands.OPEN_DOCS, async (params: { page: string, section: string }) => {
    const page = params.page.endsWith('.md') ? params.page.substr(0, params.page.length - 3) : params.page;
    const uri = page + '.md';
    const sectionId = params.section || '';
    const title = 'XML ' + page;
    markdownPreviewProvider.show(context.asAbsolutePath(path.join('docs', uri)), title, sectionId, context);
  }));

  let storagePath = context.storagePath;
  const externalXmlSettings = {
    "xmlCatalogs": [],
    "xmlFileAssociations": []
  };

  if (!storagePath) {
    storagePath = os.homedir() + "/.lemminx";
  }
  let logfile = path.resolve(storagePath + '/lemminx.log');

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
          },
          actionableNotificationSupport: true,
          openSettingsCommandSupport: true
        }
      },
      synchronize: {
        //preferences starting with these will trigger didChangeConfiguration
        configurationSection: ['xml', '[xml]', 'files.trimFinalNewlines', 'files.trimTrailingWhitespace', 'files.insertFinalNewline']
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

    let serverOptions = prepareExecutable(requirements, collectXmlJavaExtensions(extensions.all, getXMLConfiguration().get("extension.jars", [])), context);
    languageClient = new LanguageClient('xml', 'XML Support', serverOptions, clientOptions);
    let toDispose = context.subscriptions;
    let disposable = languageClient.start();
    toDispose.push(disposable);

    languages.setLanguageConfiguration('xml', getIndentationRules());
    languages.setLanguageConfiguration('xsl', getIndentationRules());

    return languageClient.onReady().then(() => {
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

      setupActionableNotificationListener(languageClient);

      // Handler for 'xml/executeClientCommand` request message that executes a command on the client
      languageClient.onRequest(ExecuteClientCommandRequest.type, async (params: ExecuteCommandParams) => {
        return await commands.executeCommand(params.command, ...params.arguments);
      });

      // Register custom XML commands
      context.subscriptions.push(commands.registerCommand(Commands.VALIDATE_CURRENT_FILE, async (params) => {
        const uri = window.activeTextEditor.document.uri;
        const identifier = TextDocumentIdentifier.create(uri.toString());
        commands.executeCommand(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.VALIDATE_CURRENT_FILE, identifier).
          then(() => {
            window.showInformationMessage('The current XML file was successfully validated.');
          }, error => {
            window.showErrorMessage('Error during XML validation ' + error.message);
          });
      }));
      context.subscriptions.push(commands.registerCommand(Commands.VALIDATE_ALL_FILES, async () => {
        commands.executeCommand(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.VALIDATE_ALL_FILES).
          then(() => {
            window.showInformationMessage('All open XML files were successfully validated.');
          }, error => {
            window.showErrorMessage('Error during XML validation: ' + error.message);
          });
      }));

      // Register client command to execute custom XML Language Server command
      context.subscriptions.push(commands.registerCommand(Commands.EXECUTE_WORKSPACE_COMMAND, (command, ...rest) => {
        let token: CancellationToken;
        let commandArgs: any[] = rest;
        if (rest && rest.length && CancellationToken.is(rest[rest.length - 1])) {
          token = rest[rest.length - 1];
          commandArgs = rest.slice(0, rest.length - 1);
        }
        const params: ExecuteCommandParams = {
          command,
          arguments: commandArgs
        };
        if (token) {
          return languageClient.sendRequest(ExecuteCommandRequest.type, params, token);
        } else {
          return languageClient.sendRequest(ExecuteCommandRequest.type, params);
        }
      }));

      context.subscriptions.push(commands.registerCommand(Commands.OPEN_SETTINGS, async (settingId?: string) => {
        commands.executeCommand('workbench.action.openSettings', settingId);
      }));


      // Setup autoCloseTags
      const tagProvider = (document: TextDocument, position: Position) => {
        let param = languageClient.code2ProtocolConverter.asTextDocumentPositionParams(document, position);
        let text = languageClient.sendRequest(TagCloseRequest.type, param);
        return text;
      };
      context.subscriptions.push(activateTagClosing(tagProvider, { xml: true, xsl: true }, Commands.AUTO_CLOSE_TAGS));

      if (extensions.onDidChange) {// Theia doesn't support this API yet
        context.subscriptions.push(extensions.onDidChange(() => {
          onExtensionChange(extensions.all, getXMLConfiguration().get("extension.jars", []));
        }));
      }

      // Copied from:
      // https://github.com/redhat-developer/vscode-java/pull/1081/files
      languageClient.onRequest(ConfigurationRequest.type, (params: ConfigurationParams) => {
        const result: any[] = [];
        const activeEditor: TextEditor | undefined = window.activeTextEditor;
        for (const item of params.items) {
          if (activeEditor && activeEditor.document.uri.toString() === Uri.parse(item.scopeUri).toString()) {
            if (item.section === "xml.format.insertSpaces") {
              result.push(activeEditor.options.insertSpaces);
            } else if (item.section === "xml.format.tabSize") {
              result.push(activeEditor.options.tabSize);
            }
          } else {
            result.push(workspace.getConfiguration(null, Uri.parse(item.scopeUri)).get(item.section));
          }
        }
        return result;
      });
      // When the current document changes, update variable values that refer to the current file if these variables are referenced,
      // and send the updated settings to the server
      context.subscriptions.push(window.onDidChangeActiveTextEditor(() => {
        if (containsVariableReferenceToCurrentFile(getXMLConfiguration().get('fileAssociations') as XMLFileAssociation[])) {
          languageClient.sendNotification(DidChangeConfigurationNotification.type, { settings: getXMLSettings(requirements.java_home) });
          onConfigurationChange();
        }
      }));

      const api: XMLExtensionApi = {
        // add API set catalogs to internal memory
        addXMLCatalogs: (catalogs: string[]) => {
          const externalXmlCatalogs = externalXmlSettings.xmlCatalogs;
          catalogs.forEach(element => {
            if (!externalXmlCatalogs.includes(element)) {
              externalXmlCatalogs.push(element);
            }
          });
          languageClient.sendNotification(DidChangeConfigurationNotification.type, { settings: getXMLSettings(requirements.java_home) });
          onConfigurationChange();
        },
        // remove API set catalogs to internal memory
        removeXMLCatalogs: (catalogs: string[]) => {
          catalogs.forEach(element => {
            const externalXmlCatalogs = externalXmlSettings.xmlCatalogs;
            if (externalXmlCatalogs.includes(element)) {
              const itemIndex = externalXmlCatalogs.indexOf(element);
              externalXmlCatalogs.splice(itemIndex, 1);
            }
          });
          languageClient.sendNotification(DidChangeConfigurationNotification.type, { settings: getXMLSettings(requirements.java_home) });
          onConfigurationChange();
        },
        // add API set fileAssociations to internal memory
        addXMLFileAssociations: (fileAssociations: XMLFileAssociation[]) => {
          const externalfileAssociations = externalXmlSettings.xmlFileAssociations;
          fileAssociations.forEach(element => {
            if (!externalfileAssociations.some(fileAssociation => fileAssociation.systemId === element.systemId)) {
              externalfileAssociations.push(element);
            }
          });
          languageClient.sendNotification(DidChangeConfigurationNotification.type, { settings: getXMLSettings(requirements.java_home) });
          onConfigurationChange();
        },
        // remove API set fileAssociations to internal memory
        removeXMLFileAssociations: (fileAssociations: XMLFileAssociation[]) => {
          const externalfileAssociations = externalXmlSettings.xmlFileAssociations;
          fileAssociations.forEach(element => {
            const itemIndex = externalfileAssociations.findIndex(fileAssociation => fileAssociation.systemId === element.systemId) //returns -1 if item not found
            if (itemIndex > -1) {
              externalfileAssociations.splice(itemIndex, 1);
            }
          });
          languageClient.sendNotification(DidChangeConfigurationNotification.type, { settings: getXMLSettings(requirements.java_home) });
          onConfigurationChange();
        }
      };
      return api;
    });
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
      xml = { "xml": JSON.parse(x) };
    }
    xml['xml']['logs']['file'] = logfile;
    xml['xml']['useCache'] = true;
    xml['xml']['java']['home'] = javaHome;
    xml['xml']['format']['trimFinalNewlines'] = workspace.getConfiguration('files').get('trimFinalNewlines', true);
    xml['xml']['format']['trimTrailingWhitespace'] = workspace.getConfiguration('files').get('trimTrailingWhitespace', false);
    xml['xml']['format']['insertFinalNewline'] = workspace.getConfiguration('files').get('insertFinalNewline', false);

    //applying externalXmlSettings to the xmlSettings
    externalXmlSettings.xmlCatalogs.forEach(catalog => {
      if (!xml['xml']['catalogs'].includes(catalog)) {
        xml['xml']['catalogs'].push(catalog);
      }
    })
    // Apply variable substitutions for file associations
    xml['xml']['fileAssociations'] = [...getVariableSubstitutedAssociations(xml['xml']['fileAssociations'])];

    return xml;
  }
}

export function deactivate(): void {
  languageClient.stop();
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

function setupActionableNotificationListener(languageClient: LanguageClient): void {
  languageClient.onNotification(ActionableNotification.type, (notification: ActionableMessage) => {
    let show = null;
    switch (notification.severity) {
      case MessageType.Info:
        show = window.showInformationMessage;
        break;
      case MessageType.Warning:
        show = window.showWarningMessage;
        break;
      case MessageType.Error:
        show = window.showErrorMessage;
        break;
    }
    if (!show) {
      return;
    }
    const titles: string[] = notification.commands.map(a => a.title);
    show(notification.message, ...titles).then((selection) => {
      for (const action of notification.commands) {
        if (action.title === selection) {
          const args: any[] = (action.arguments) ? action.arguments : [];
          commands.executeCommand(action.command, ...args);
          break;
        }
      }
    });
  });
}