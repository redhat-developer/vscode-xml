import * as path from 'path';
import { commands, ExtensionContext, OpenDialogOptions, Position, QuickPickItem, Uri, window, workspace, WorkspaceEdit, Disposable } from "vscode";
import { CancellationToken, ExecuteCommandParams, ExecuteCommandRequest, ReferencesRequest, TextDocumentIdentifier, TextDocumentEdit } from "vscode-languageclient";
import { LanguageClient } from 'vscode-languageclient/node';
import { markdownPreviewProvider } from "../markdownPreviewProvider";
import { ClientCommandConstants, ServerCommandConstants } from "./commandConstants";

/**
 * Register the commands for vscode-xml that don't require communication with the language server
 *
 * @param context the extension context
 */
export function registerClientOnlyCommands(context: ExtensionContext) {
  registerDocsCommands(context);
  registerOpenSettingsCommand(context);
  registerOpenUriCommand(context);
}

/**
 * Register the commands for vscode-xml that require communication with the language server
 *
 * @param context the extension context
 * @param languageClient the language client
 */
export async function registerClientServerCommands(context: ExtensionContext, languageClient: LanguageClient) {

  registerCodeLensReferencesCommands(context, languageClient);
  registerValidationCommands(context);
  registerAssociationCommands(context, languageClient);

  // Register client command to execute custom XML Language Server command
  context.subscriptions.push(commands.registerCommand(ClientCommandConstants.EXECUTE_WORKSPACE_COMMAND, (command, ...rest) => {
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
    }
    else {
      return languageClient.sendRequest(ExecuteCommandRequest.type, params);
    }
  }));

}

/**
 * Register commands used for the built-in documentation
 *
 * @param context the extension context
 */
function registerDocsCommands(context: ExtensionContext) {
  context.subscriptions.push(markdownPreviewProvider);
  context.subscriptions.push(commands.registerCommand(ClientCommandConstants.OPEN_DOCS_HOME, async () => {
    const uri = 'README.md';
    const title = 'XML Documentation';
    const sectionId = '';
    markdownPreviewProvider.show(context.asAbsolutePath(path.join('docs', uri)), title, sectionId, context);
  }));
  context.subscriptions.push(commands.registerCommand(ClientCommandConstants.OPEN_DOCS, async (params: { page: string, section: string }) => {
    const page = params.page.endsWith('.md') ? params.page.substr(0, params.page.length - 3) : params.page;
    const uri = page + '.md';
    const sectionId = params.section || '';
    const title = 'XML ' + page;
    markdownPreviewProvider.show(context.asAbsolutePath(path.join('docs', uri)), title, sectionId, context);
  }));
}

/**
 * Registers a command that opens the settings page to a given setting
 *
 * @param context the extension context
 */
function registerOpenSettingsCommand(context: ExtensionContext) {
  context.subscriptions.push(commands.registerCommand(ClientCommandConstants.OPEN_SETTINGS, async (settingId?: string) => {
    commands.executeCommand('workbench.action.openSettings', settingId);
  }));
}

/**
 * Registers a command that opens the settings page to a given setting
 *
 * @param context the extension context
 */
function registerOpenUriCommand(context: ExtensionContext) {
  context.subscriptions.push(commands.registerCommand(ClientCommandConstants.OPEN_URI, async (uri?: string) => {
    commands.executeCommand('vscode.open', Uri.parse(uri));
  }));
}

/**
 * Register commands used for code lens "references"
 *
 * @param context the extension context
 * @param languageClient the language server client
 */
function registerCodeLensReferencesCommands(context: ExtensionContext, languageClient: LanguageClient) {
  context.subscriptions.push(commands.registerCommand(ClientCommandConstants.SHOW_REFERENCES, (uriString: string, position: Position) => {
    const uri = Uri.parse(uriString);
    workspace.openTextDocument(uri).then(document => {
      // Consume references service from the XML Language Server
      let param = languageClient.code2ProtocolConverter.asTextDocumentPositionParams(document, position);
      languageClient.sendRequest(ReferencesRequest.type, param).then(locations => {
        commands.executeCommand(ClientCommandConstants.EDITOR_SHOW_REFERENCES, uri, languageClient.protocol2CodeConverter.asPosition(position), locations.map(languageClient.protocol2CodeConverter.asLocation));
      })
    })
  }));
}

/**
 * Register commands used for revalidating XML files
 *
 * @param context the extension context
 */
function registerValidationCommands(context: ExtensionContext) {
  // Revalidate current file
  context.subscriptions.push(commands.registerCommand(ClientCommandConstants.VALIDATE_CURRENT_FILE, async (params) => {
    const uri = window.activeTextEditor.document.uri;
    const identifier = TextDocumentIdentifier.create(uri.toString());
    commands.executeCommand(ClientCommandConstants.EXECUTE_WORKSPACE_COMMAND, ServerCommandConstants.VALIDATE_CURRENT_FILE, identifier).
      then(() => {
        window.showInformationMessage('The current XML file was successfully validated.');
      }, error => {
        window.showErrorMessage('Error during XML validation ' + error.message);
      });
  }));
  // Revalidate all open files
  context.subscriptions.push(commands.registerCommand(ClientCommandConstants.VALIDATE_ALL_FILES, async () => {
    commands.executeCommand(ClientCommandConstants.EXECUTE_WORKSPACE_COMMAND, ServerCommandConstants.VALIDATE_ALL_FILES).
      then(() => {
        window.showInformationMessage('All open XML files were successfully validated.');
      }, error => {
        window.showErrorMessage('Error during XML validation: ' + error.message);
      });
  }));
}

export const bindingTypes = new Map<string, string>([
  ["Standard (xsi, DOCTYPE)", "standard"],
  ["XML Model association", "xml-model"]
]);

const bindingTypeOptions: QuickPickItem[] = [];
for (const label of bindingTypes.keys()) {
  bindingTypeOptions.push({ "label": label });
}

/**
 * The function passed to context subscriptions for grammar association
 *
 * @param uri the uri of the XML file path
 * @param languageClient the language server client
 */
async function grammarAssociationCommand(documentURI: Uri, languageClient: LanguageClient) {
  // A click on Bind to grammar/schema... has been processed in the XML document which is not bound to a grammar

  // Step 1 : open a combo to select the binding type ("standard", "xml-model")
  const pickedBindingTypeOption = await window.showQuickPick(bindingTypeOptions, { placeHolder: "Binding type" });
  if (!pickedBindingTypeOption) {
    return;
  }
  const bindingType = bindingTypes.get(pickedBindingTypeOption.label);

  // Open a dialog to select the XSD, DTD to bind.
  const options: OpenDialogOptions = {
    canSelectMany: false,
    openLabel: 'Select XSD or DTD file',
    filters: {
      'Grammar files': ['xsd', 'dtd']
    }
  };

  const fileUri = await window.showOpenDialog(options);
  if (fileUri && fileUri[0]) {
    // The XSD, DTD has been selected, get the proper syntax for binding this grammar file in the XML document.
    const identifier = TextDocumentIdentifier.create(documentURI.toString());
    const grammarURI = fileUri[0];
    try {
      const result = await commands.executeCommand(ServerCommandConstants.ASSOCIATE_GRAMMAR_INSERT, identifier, grammarURI.toString(), bindingType);
      // Insert the proper syntax for binding
      const lspTextDocumentEdit = <TextDocumentEdit>result;
      const workEdits = new WorkspaceEdit();
      for (const edit of lspTextDocumentEdit.edits) {
        workEdits.replace(documentURI, languageClient.protocol2CodeConverter.asRange(edit.range), edit.newText);
      }
      workspace.applyEdit(workEdits); // apply the edits

    } catch (error) {
      window.showErrorMessage('Error during grammar binding: ' + error.message);
    };
  }
}

/**
 * Register commands used for associating grammar file (XSD,DTD) to a given XML file for command menu and CodeLens
 *
 * @param context the extension context
 * @param languageClient the language server client
 */
function registerAssociationCommands(context: ExtensionContext, languageClient: LanguageClient) {
  // For CodeLens
  context.subscriptions.push(commands.registerCommand(ClientCommandConstants.OPEN_BINDING_WIZARD, async (uriString: string) => {
    const uri = Uri.parse(uriString);
    grammarAssociationCommand(uri, languageClient)
  }));
  // For command menu
  context.subscriptions.push(commands.registerCommand(ClientCommandConstants.COMMAND_PALETTE_BINDING_WIZARD, async () => {
    const uri = window.activeTextEditor.document.uri;
    // Run check to ensure available grammar binding command should be executed, or if error is thrown
    const canBind = await checkCanBindGrammar(uri);
    if (canBind) {
      grammarAssociationCommand(uri, languageClient)
    } else {
      window.showErrorMessage(`The document ${uri.toString()} is already bound with a grammar`);
    }
  }));

}

/**
 * Change value of 'canBindGrammar' to determine if grammar/schema can be bound
 *
 * @param document the text document
 * @returns the `hasGrammar` check result from server
 */
async function checkCanBindGrammar(documentURI: Uri) {
  // Retrieve the document uri and identifier
  const identifier = TextDocumentIdentifier.create(documentURI.toString());

  // Set the custom condition to watch if file already has bound grammar
  var result = false;
  try {
    result = await commands.executeCommand(ServerCommandConstants.CHECK_BOUND_GRAMMAR, identifier);
  } catch (error) {
    console.log(`Error while checking bound grammar : ${error}`);
  }

  return result
}