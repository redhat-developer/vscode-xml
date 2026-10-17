import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { commands, ConfigurationTarget, env, ExtensionContext, languages, OpenDialogOptions, Position, QuickPickItem, SnippetString, TextDocument, Uri, window, workspace, WorkspaceEdit, Selection } from "vscode";
import { CancellationToken, ExecuteCommandParams, ExecuteCommandRequest, ReferencesRequest, TextDocumentEdit, TextDocumentIdentifier, TextEdit } from "vscode-languageclient";
import { LanguageClient } from 'vscode-languageclient/node';
import { registerConfigurationUpdateCommand } from '../lsp-commands';
import { markdownPreviewProvider } from "../markdownPreviewProvider";
import { DEBUG } from '../server/java/javaServerStarter';
import { getDirectoryPath, getFileName, getRelativePath, getWorkspaceUri } from '../utils/fileUtils';
import * as ClientCommandConstants from "./clientCommandConstants";
import * as ServerCommandConstants from "./serverCommandConstants";

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
  registerRefactorCommands(context, languageClient);
  registerMinifyCommand(context, languageClient);
  registerAssociationCommands(context, languageClient);
  registerGenerateXMLCommands(context, languageClient);
  registerGenerateGrammarFromXMLCommands(context, languageClient);
  registerRestartLanguageServerCommand(context, languageClient);
  registerConfigurationUpdateCommand();

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
      const param = languageClient.code2ProtocolConverter.asReferenceParams(document, position, { includeDeclaration: true });
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
  context.subscriptions.push(commands.registerCommand(ClientCommandConstants.VALIDATE_CURRENT_FILE, async (identifierParam, validationArgs) => {
    if (identifierParam) {
      return await commands.executeCommand(ClientCommandConstants.EXECUTE_WORKSPACE_COMMAND, ServerCommandConstants.VALIDATE_CURRENT_FILE, identifierParam, validationArgs);
    }
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

const bindingTypes = new Map<string, string>([
  ["Standard (xsi, DOCTYPE)", "standard"],
  ["XML Model association", "xml-model"],
  ["File association", "fileAssociation"]
]);

const bindingTypeOptions: QuickPickItem[] = [];
for (const label of bindingTypes.keys()) {
  bindingTypeOptions.push({ "label": label });
}

const bindingTypeOptionsForRelaxNG: QuickPickItem[] = [];
for (const entry of bindingTypes.entries()) {
  if (entry[1] !== 'standard') {
    bindingTypeOptionsForRelaxNG.push({ "label": entry[0] });
  }
}
/**
 * The function passed to context subscriptions for grammar association
 *
 * @param documentURI the uri of the XML file path
 * @param languageClient the language server client
 */
async function grammarAssociationCommand(documentURI: Uri, languageClient: LanguageClient) {
  // A click on Bind to grammar/schema... has been processed in the XML document which is not bound to a grammar

  // step 1: select local / remote Uri type
  let grammarURI;
  const uriType = await window.showQuickPick([{ "label": "local" }, { "label": "remote" }], { placeHolder: "Binding type" });
  if (!uriType) {
    return;
  }
  if (uriType.label === 'remote') {
    let predefinedUrl = await env.clipboard.readText();
    if (!predefinedUrl || !predefinedUrl.startsWith('http')) {
      predefinedUrl = '';
    }
    grammarURI = await window.showInputBox({ title: 'Fill with schema / grammar URL', value: predefinedUrl });
  } else {
    // step 2.1: Open a dialog to select the XSD, DTD, RelaxNG file to bind.
    const options: OpenDialogOptions = {
      canSelectMany: false,
      openLabel: 'Select XSD, DTD, RNG or RNC file',
      filters: {
        'Grammar files': ['xsd', 'dtd', 'rng', 'rnc']
      }
    };
    const fileUri = await window.showOpenDialog(options);
    grammarURI = fileUri && fileUri[0];
  }

  if (!grammarURI) {
    return;
  }

  const grammarPath = grammarURI.fsPath ? grammarURI.fsPath : grammarURI;
  const isRelaxNG = grammarPath.endsWith('.rng') || grammarPath.endsWith('.rnc');
  // Step 3 : open a combo to select the binding type ("standard", "xml-model", "fileAssociation")
  const bindingTypesQuickPick = isRelaxNG ? bindingTypeOptionsForRelaxNG : bindingTypeOptions;
  const pickedBindingTypeOption = await window.showQuickPick(bindingTypesQuickPick, { placeHolder: "Binding type" });
  if (!pickedBindingTypeOption) {
    return;
  }
  const bindingType = bindingTypes.get(pickedBindingTypeOption.label);

  // The XSD, DTD has been selected, get the proper syntax for binding this grammar file in the XML document.
  try {
    const currentFile = (window.activeTextEditor && window.activeTextEditor.document && window.activeTextEditor.document.languageId === 'xml') ? window.activeTextEditor.document : undefined;
    if (bindingType === 'fileAssociation') {
      // Bind grammar using file association
      await bindWithFileAssociation(documentURI, grammarURI, currentFile);
    } else {
      // Bind grammar using standard binding
      await bindWithStandard(documentURI, grammarURI, bindingType, languageClient);
    }
  } catch (error) {
    window.showErrorMessage('Error during grammar binding: ' + error.message);
  }
}

/**
 * Perform grammar binding using file association through settings.json
 *
 * @param documentURI the URI of the current XML document
 * @param grammarURI the URI of the user selected grammar file
 * @param document the opened TextDocument
 */
async function bindWithFileAssociation(documentURI: Uri, grammarURI: Uri, document: TextDocument) {
  const absoluteGrammarFilePath = grammarURI.toString();
  const currentFilename = getFileName(documentURI.toString());
  const currentWorkspaceUri = getWorkspaceUri(document);
  // If the grammar file is in the same workspace, use the relative path, otherwise use the absolute path
  const grammarFilePath = getDirectoryPath(absoluteGrammarFilePath).includes(currentWorkspaceUri.toString()) ? getRelativePath(currentWorkspaceUri.toString(), absoluteGrammarFilePath) : absoluteGrammarFilePath;

  const defaultPattern = `**/${currentFilename}`;
  const inputBoxOptions = {
    title: "File Association Pattern",
    value: defaultPattern,
    placeHolder: defaultPattern,
    prompt: "Enter the pattern of the XML document(s) to be bound.",
    validateInput: async (pattern: string) => {
      let hasMatch = false;
      try {
        hasMatch = await commands.executeCommand(ClientCommandConstants.EXECUTE_WORKSPACE_COMMAND, ServerCommandConstants.CHECK_FILE_PATTERN, pattern, documentURI.toString());
      } catch (error) {
        console.log(`Error while validating file pattern : ${error}`);
      }
      return !hasMatch ? "The pattern will not match any file." : null
    }
  }
  const inputPattern = (await window.showInputBox(inputBoxOptions));
  if (!inputPattern) {
    // User closed the input box with Esc
    return;
  }
  const fileAssociation = {
    "pattern": inputPattern,
    "systemId": grammarFilePath
  }
  addToValueToSettingArray("xml.fileAssociations", fileAssociation);
}

/**
 * Bind grammar file using standard XML document grammar
 *
 * @param documentURI the URI of the XML file path
 * @param grammarURI the URI of the user selected grammar file
 * @param bindingType the selected grammar binding type
 * @param languageClient the language server client
 */
async function bindWithStandard(documentURI: Uri, grammarURI: Uri, bindingType: string, languageClient: LanguageClient) {
  const identifier = TextDocumentIdentifier.create(documentURI.toString());
  const result = await commands.executeCommand(ServerCommandConstants.ASSOCIATE_GRAMMAR_INSERT, identifier, grammarURI.toString(), bindingType);
  // Insert the proper syntax for binding
  const lspTextDocumentEdit = <TextDocumentEdit>result;
  const workEdits = new WorkspaceEdit();
  for (const edit of lspTextDocumentEdit.edits) {
    if ('newText' in edit) {
      workEdits.replace(documentURI, languageClient.protocol2CodeConverter.asRange(edit.range), edit.newText);
    }
  }
  workspace.applyEdit(workEdits); // apply the edits
}

/**
 * Add an entry, value, to the setting.json field, key
 *
 * @param key the filename/path of the xml document
 * @param value the object to add to the config
 */
function addToValueToSettingArray<T>(key: string, value: T): void {
  const settingArray: T[] = workspace.getConfiguration().get<T[]>(key, []);
  if (settingArray.includes(value)) {
    return;
  }
  settingArray.push(value);
  workspace.getConfiguration().update(key, settingArray, ConfigurationTarget.Workspace);
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
 * @param documentURI the text document
 * @returns the `hasGrammar` check result from server
 */
async function checkCanBindGrammar(documentURI: Uri) {
  // Retrieve the document uri and identifier
  const identifier = TextDocumentIdentifier.create(documentURI.toString());

  // Set the custom condition to watch if file already has bound grammar
  let result = false;
  try {
    result = await commands.executeCommand(ServerCommandConstants.CHECK_BOUND_GRAMMAR, identifier);
  } catch (error) {
    console.log(`Error while checking bound grammar : ${error}`);
  }

  return result
}

/**
 * Register command to restart the connection to the language server
 *
 * @param context the extension context
 * @param languageClient the language client
 */
function registerRestartLanguageServerCommand(context: ExtensionContext, languageClient: LanguageClient) {
  context.subscriptions.push(commands.registerCommand(ClientCommandConstants.RESTART_LANGUAGE_SERVER, async () => {
    // Can be replaced with `await languageClient.restart()` with vscode-languageclient ^8.0.1,
    await languageClient.stop();
    if (DEBUG) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    languageClient.start();

  }));
}

interface SurroundWithResponse {
  start: TextEdit;
  end: TextEdit;
}

class SurroundWithKind {

  static readonly tags = 'tags';
  static readonly comments = 'comments';
  static readonly cdata = 'cdata';
  static readonly ignoreFormatting = 'ignoreFormatting';

}

/**
 * Register commands used for refactoring XML files
 *
 * @param context the extension context
 */
function registerRefactorCommands(context: ExtensionContext, languageClient: LanguageClient) {

  // Surround with Tags (Wrap)
  context.subscriptions.push(commands.registerCommand(ClientCommandConstants.REFACTOR_SURROUND_WITH_TAGS, async () => {
    await surroundWith(SurroundWithKind.tags, languageClient);
  }));

  // Surround with Comments
  context.subscriptions.push(commands.registerCommand(ClientCommandConstants.REFACTOR_SURROUND_WITH_COMMENTS, async () => {
    await surroundWith(SurroundWithKind.comments, languageClient);
  }));


  // Surround with CDATA
  context.subscriptions.push(commands.registerCommand(ClientCommandConstants.REFACTOR_SURROUND_WITH_CDATA, async () => {
    await surroundWith(SurroundWithKind.cdata, languageClient);
  }));

  // Ignore Formatting
  context.subscriptions.push(commands.registerCommand(ClientCommandConstants.REFACTOR_SURROUND_WITH_IGNORE_FORMATTING, async () => {
    await surroundWith(SurroundWithKind.ignoreFormatting, languageClient);
  }));
}

async function surroundWith(surroundWithType: SurroundWithKind, languageClient: LanguageClient) {
  const activeEditor = window.activeTextEditor;
  if (!activeEditor) {
    return;
  }
  const selection = activeEditor.selections[0];
  if (!selection) {
    return;
  }

  const uri = window.activeTextEditor.document.uri;
  const identifier = TextDocumentIdentifier.create(uri.toString());
  const range = languageClient.code2ProtocolConverter.asRange(selection);
  const supportedSnippet: boolean = vscode.SnippetTextEdit ? true : false;

  let result: SurroundWithResponse;
  try {
    result = await commands.executeCommand(ServerCommandConstants.REFACTOR_SURROUND_WITH, identifier, range, surroundWithType, supportedSnippet);
  } catch (error) {
    console.log(`Error while surround with : ${error}`);
  }

  if (!result) {
    return;
  }

  const startTag = result.start.newText;
  const endTag = result.end.newText;

  if (supportedSnippet) {
    // SnippetTextEdit is supported, uses snippet (with choice) to manage cursor.
    const startRange = languageClient.protocol2CodeConverter.asRange(result.start.range);
    const endRange = languageClient.protocol2CodeConverter.asRange(result.end.range);
    const snippetEdits = [new vscode.SnippetTextEdit(startRange, new SnippetString(startTag)), new vscode.SnippetTextEdit(endRange, new SnippetString(endTag))];
    const edit = new WorkspaceEdit();
    edit.set(activeEditor.document.uri, snippetEdits);
    await workspace.applyEdit(edit);
  } else {
    // SnippetTextEdit is not supported, update start / end tag
    const startPos = languageClient.protocol2CodeConverter.asPosition(result.start.range.start);
    const endPos = languageClient.protocol2CodeConverter.asPosition(result.end.range.start);
    activeEditor.edit((selectedText) => {
      selectedText.insert(startPos, startTag);
      selectedText.insert(endPos, endTag);
    })

    if (surroundWithType === SurroundWithKind.tags) {
      // Force the show of completion
      const pos = languageClient.protocol2CodeConverter.asPosition(result.start.range.start);
      const posAfterStartBracket = new Position(pos.line, pos.character + 1);
      activeEditor.selections = [new Selection(posAfterStartBracket, posAfterStartBracket)];
      commands.executeCommand("editor.action.triggerSuggest");
    }
  }

}

/**
 * Register command to minify XML document
 *
 * @param context the extension context
 * @param languageClient the language client
 */
function registerMinifyCommand(context: ExtensionContext, languageClient: LanguageClient) {
  context.subscriptions.push(commands.registerCommand(ClientCommandConstants.MINIFY_DOCUMENT, async () => {
    const activeEditor = window.activeTextEditor;
    if (!activeEditor || activeEditor.document.languageId !== 'xml') {
      return;
    }

    const uri = activeEditor.document.uri;
    const identifier = TextDocumentIdentifier.create(uri.toString());

    try {
      // Call the server command to get the minified text edits
      const edits: TextEdit[] = await commands.executeCommand(
        ClientCommandConstants.EXECUTE_WORKSPACE_COMMAND,
        ServerCommandConstants.MINIFY_DOCUMENT,
        identifier
      );

      if (!edits || edits.length === 0) {
        return;
      }

      // Apply the text edits
      const workEdits = new WorkspaceEdit();
      for (const edit of edits) {
        if ('newText' in edit) {
          workEdits.replace(uri, languageClient.protocol2CodeConverter.asRange(edit.range), edit.newText);
        }
      }
      await workspace.applyEdit(workEdits);
    } catch (error) {
      window.showErrorMessage('Error during XML minification: ' + error.message);
    }
  }));
}

interface RootElementInfo {
  name: string;
  namespace: string;
}

/**
 * Register commands for generating XML from grammar files
 *
 * @param context the extension context
 * @param languageClient the language server client
 */
function registerGenerateXMLCommands(context: ExtensionContext, languageClient: LanguageClient) {
  context.subscriptions.push(commands.registerCommand(ClientCommandConstants.GENERATE_XML_FROM_GRAMMAR, async (grammarFileUri?: Uri) => {
    await generateXMLFromGrammarCommand(grammarFileUri, context);
  }));
}

/**
 * Multi-step wizard to generate an XML document from a grammar (XSD, DTD, RelaxNG, RNC).
 *
 * When invoked from explorer context menu, the grammar URI is passed directly (skips step 1).
 * When invoked from command palette, step 1 asks user to select a grammar file.
 *
 * @param grammarFileUri optional grammar file URI (from context menu)
 */
async function generateXMLFromGrammarCommand(grammarFileUri: Uri | undefined, context: ExtensionContext) {
  let grammarURI: string;

  if (grammarFileUri) {
    // Invoked from context menu on a grammar file — skip step 1
    grammarURI = grammarFileUri.toString();
  } else {
    // Invoked from command palette — step 1: select grammar file
    const grammarType = await window.showQuickPick(
      [{ label: "local" }, { label: "remote" }],
      { placeHolder: "Select grammar source" }
    );
    if (!grammarType) return;

    if (grammarType.label === 'remote') {
      let predefinedUrl = await env.clipboard.readText();
      if (!predefinedUrl || !predefinedUrl.startsWith('http')) {
        predefinedUrl = '';
      }
      const inputUrl = await window.showInputBox({
        title: 'Enter grammar URL (XSD, DTD, RNG, RNC)',
        value: predefinedUrl
      });
      if (!inputUrl) return;
      grammarURI = inputUrl;
    } else {
      const options: OpenDialogOptions = {
        canSelectMany: false,
        openLabel: 'Select grammar file',
        filters: {
          'Grammar files': ['xsd', 'dtd', 'rng', 'rnc']
        }
      };
      const fileUri = await window.showOpenDialog(options);
      if (!fileUri || !fileUri[0]) return;
      grammarURI = fileUri[0].toString();
    }
  }

  if (!grammarURI) return;

  // Step 2: List root elements from the grammar
  let rootElements: RootElementInfo[];
  try {
    rootElements = await commands.executeCommand(
      ClientCommandConstants.EXECUTE_WORKSPACE_COMMAND,
      ServerCommandConstants.LIST_ROOT_ELEMENTS,
      grammarURI
    );
  } catch (error) {
    window.showErrorMessage('Error listing root elements: ' + error.message);
    return;
  }

  if (!rootElements || rootElements.length === 0) {
    window.showWarningMessage('No root elements found in the selected grammar.');
    return;
  }

  // If only one root element, skip the selection step
  let selectedRootElement: string;
  if (rootElements.length === 1) {
    selectedRootElement = rootElements[0].name;
  } else {
    const items: QuickPickItem[] = rootElements.map(e => ({
      label: e.name,
      description: e.namespace || ''
    }));
    const picked = await window.showQuickPick(items, { placeHolder: 'Select root element' });
    if (!picked) return;
    selectedRootElement = picked.label;
  }

  // Step 3: Generate XML content (server resolves settings from configuration)
  let xmlContent: string;
  try {
    xmlContent = await commands.executeCommand(
      ClientCommandConstants.EXECUTE_WORKSPACE_COMMAND,
      ServerCommandConstants.GENERATE_XML,
      grammarURI,
      selectedRootElement
    );
  } catch (error) {
    window.showErrorMessage('Error generating XML: ' + error.message);
    return;
  }

  if (!xmlContent) {
    window.showWarningMessage('Failed to generate XML content.');
    return;
  }

  // Open the generated XML in a new untitled document named after the root element.
  // Build a full path so the Save dialog suggests the right directory.
  let baseDir: string;
  if (grammarURI.startsWith('file:')) {
    baseDir = path.dirname(Uri.parse(grammarURI).fsPath);
  } else if (workspace.workspaceFolders && workspace.workspaceFolders.length > 0) {
    baseDir = workspace.workspaceFolders[0].uri.fsPath;
  } else {
    baseDir = '';
  }
  let suggestedName = selectedRootElement + '.xml';
  let suggestedPath = baseDir ? path.join(baseDir, suggestedName) : suggestedName;
  let untitledUri = Uri.file(suggestedPath).with({ scheme: 'untitled' });
  let counter = 0;
  while (workspace.textDocuments.some(d => d.uri.toString() === untitledUri.toString()) ||
         (baseDir && fs.existsSync(path.join(baseDir, suggestedName)))) {
    counter++;
    suggestedName = selectedRootElement + '-' + counter + '.xml';
    suggestedPath = baseDir ? path.join(baseDir, suggestedName) : suggestedName;
    untitledUri = Uri.file(suggestedPath).with({ scheme: 'untitled' });
  }
  const doc = await workspace.openTextDocument(untitledUri);
  const editor = await window.showTextDocument(doc);
  await editor.edit(editBuilder => {
    editBuilder.insert(new Position(0, 0), xmlContent);
  });

  // After saving an untitled document, replace absolute grammar file URI with relative path
  if (grammarURI.startsWith('file:') && doc.isUntitled) {
    const untitledUri = doc.uri.toString();
    const grammarFsPath = Uri.parse(grammarURI).fsPath;
    const saveDisposable = workspace.onDidSaveTextDocument(async (savedDoc) => {
      const content = savedDoc.getText();
      if (!content.includes(grammarURI)) {
        return;
      }
      saveDisposable.dispose();
      closeDisposable.dispose();
      const savedDir = path.dirname(savedDoc.uri.fsPath);
      const relativePath = path.relative(savedDir, grammarFsPath).replace(/\\/g, '/');
      const edit = new WorkspaceEdit();
      let startIndex = 0;
      while (true) {
        const idx = content.indexOf(grammarURI, startIndex);
        if (idx === -1) break;
        const startPos = savedDoc.positionAt(idx);
        const endPos = savedDoc.positionAt(idx + grammarURI.length);
        edit.replace(savedDoc.uri, new vscode.Range(startPos, endPos), relativePath);
        startIndex = idx + grammarURI.length;
      }
      await workspace.applyEdit(edit);
      await savedDoc.save();
    });
    // Clean up if the untitled document is closed without saving
    const closeDisposable = workspace.onDidCloseTextDocument((closedDoc) => {
      if (closedDoc.uri.toString() === untitledUri) {
        saveDisposable.dispose();
        closeDisposable.dispose();
      }
    });
    context.subscriptions.push(saveDisposable, closeDisposable);
  }
}

const grammarTypeExtensionMap: Map<string, string> = new Map([
  ['XSD', 'xsd'],
  ['DTD', 'dtd'],
  ['RelaxNG', 'rng'],
  ['RelaxNG Compact', 'rnc']
]);

interface GenerateGrammarResult {
  grammarContent: string;
  bindingEdit?: TextDocumentEdit;
}

/**
 * Register commands for generating grammar from XML files
 */
function registerGenerateGrammarFromXMLCommands(context: ExtensionContext, languageClient: LanguageClient) {
  context.subscriptions.push(commands.registerCommand(ClientCommandConstants.GENERATE_GRAMMAR_FROM_XML, async (xmlFileUri?: Uri) => {
    await generateGrammarFromXMLCommand(xmlFileUri, languageClient, context);
  }));

  const updateGrammarContext = async () => {
    const editor = window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'xml') {
      commands.executeCommand('setContext', 'xml.activeDocumentHasNoGrammar', false);
      return;
    }
    try {
      const canBind = await checkCanBindGrammar(editor.document.uri);
      commands.executeCommand('setContext', 'xml.activeDocumentHasNoGrammar', canBind);
    } catch {
      commands.executeCommand('setContext', 'xml.activeDocumentHasNoGrammar', false);
    }
  };

  context.subscriptions.push(window.onDidChangeActiveTextEditor(() => updateGrammarContext()));
  context.subscriptions.push(languages.onDidChangeDiagnostics((e) => {
    const activeUri = window.activeTextEditor?.document.uri;
    if (activeUri && e.uris.some(u => u.toString() === activeUri.toString())) {
      updateGrammarContext();
    }
  }));
  updateGrammarContext();
}

/**
 * Multi-step wizard to generate a grammar (XSD, DTD, RelaxNG) from an XML document.
 *
 * Flow:
 *  1. Select grammar type (XSD, DTD, RelaxNG)
 *  2. Select binding type (filtered by grammar type)
 *  3. Enter grammar file name
 *  4. Call server to generate grammar + apply binding
 */
async function generateGrammarFromXMLCommand(xmlFileUri: Uri | undefined, languageClient: LanguageClient, context: ExtensionContext) {
  // Determine the XML document URI
  let documentURI: Uri;
  if (xmlFileUri) {
    documentURI = xmlFileUri;
  } else if (window.activeTextEditor?.document?.languageId === 'xml') {
    documentURI = window.activeTextEditor.document.uri;
  } else {
    window.showErrorMessage('No XML document selected.');
    return;
  }

  if (documentURI.scheme !== 'file') {
    window.showErrorMessage('Save the XML document to disk before generating a grammar.');
    return;
  }

  // Ensure the document is open so the language server knows about it
  await workspace.openTextDocument(documentURI);

  // Check if the XML already has a bound grammar
  const canBind = await checkCanBindGrammar(documentURI);
  if (!canBind) {
    window.showErrorMessage('The document is already bound to a grammar.');
    return;
  }

  // Step 1: Choose grammar type
  const grammarTypeItems: QuickPickItem[] = [
    { label: 'XSD', description: 'XML Schema Definition' },
    { label: 'DTD', description: 'Document Type Definition' },
    { label: 'RelaxNG', description: 'RelaxNG XML Syntax (.rng)' },
    { label: 'RelaxNG Compact', description: 'RelaxNG Compact Syntax (.rnc)' }
  ];
  const pickedGrammarType = await window.showQuickPick(grammarTypeItems, {
    placeHolder: 'Select grammar type to generate'
  });
  if (!pickedGrammarType) return;

  const grammarExt = grammarTypeExtensionMap.get(pickedGrammarType.label);

  // Step 2: Choose binding type (filtered by grammar type)
  const xmlModelOption: QuickPickItem = { label: 'xml-model', description: 'Adds <?xml-model href="..."?> processing instruction before root element' };
  const fileAssociationOption: QuickPickItem = { label: 'File association', description: 'Configures xml.fileAssociations setting in VS Code (no XML modification)' };
  let bindingOptions: QuickPickItem[];
  switch (pickedGrammarType.label) {
    case 'XSD':
      bindingOptions = [
        { label: 'xsi:schemaLocation', description: 'Adds xsi:noNamespaceSchemaLocation or xsi:schemaLocation attribute depending on namespace' },
        xmlModelOption,
        fileAssociationOption
      ];
      break;
    case 'DTD':
      bindingOptions = [
        { label: 'DOCTYPE', description: 'Adds <!DOCTYPE root SYSTEM "..."> declaration before root element' },
        xmlModelOption,
        fileAssociationOption
      ];
      break;
    case 'RelaxNG':
    case 'RelaxNG Compact':
      bindingOptions = [
        xmlModelOption,
        fileAssociationOption
      ];
      break;
    default:
      return;
  }
  const pickedBindingType = await window.showQuickPick(bindingOptions, {
    placeHolder: 'Select binding type'
  });
  if (!pickedBindingType) return;

  // Step 3: Grammar filename
  const xmlBaseName = path.basename(documentURI.fsPath, path.extname(documentURI.fsPath));
  const defaultGrammarName = `${xmlBaseName}.${grammarExt}`;
  const grammarFileName = await window.showInputBox({
    title: 'Grammar file name',
    value: defaultGrammarName,
    prompt: 'Enter the name of the grammar file to generate',
    validateInput: (value) => {
      if (!value || value.trim().length === 0) {
        return 'File name cannot be empty';
      }
      return null;
    }
  });
  if (!grammarFileName) return;

  // Build full grammar path (same directory as XML)
  const xmlDir = path.dirname(documentURI.fsPath);
  const grammarFilePath = path.resolve(xmlDir, grammarFileName);

  if (path.dirname(grammarFilePath) !== path.resolve(xmlDir)) {
    window.showErrorMessage('The grammar file name must not contain path segments.');
    return;
  }
  if (grammarFilePath === path.resolve(documentURI.fsPath)) {
    window.showErrorMessage('The grammar output cannot overwrite the source XML document.');
    return;
  }

  // Check if grammar file already exists
  let bindOnly = false;
  if (fs.existsSync(grammarFilePath)) {
    const choice = await window.showWarningMessage(
      `The file "${grammarFileName}" already exists.`,
      'Overwrite', 'Bind to existing file'
    );
    if (choice === 'Bind to existing file') {
      bindOnly = true;
    } else if (choice !== 'Overwrite') {
      return;
    }
  }

  // Step 4: Generate grammar via server command
  const identifier = TextDocumentIdentifier.create(documentURI.toString());
  const grammarFileUri = Uri.file(grammarFilePath);
  const isFileAssociation = pickedBindingType.label === 'File association';
  const bindingType = isFileAssociation ? undefined : pickedBindingType.label;

  // Pass editor formatting options so the server can format the generated grammar
  const editor = window.activeTextEditor;
  const formattingOptions = {
    tabSize: editor?.options.tabSize as number ?? 2,
    insertSpaces: editor?.options.insertSpaces as boolean ?? true
  };

  try {
    const result: GenerateGrammarResult = await commands.executeCommand(
      ClientCommandConstants.EXECUTE_WORKSPACE_COMMAND,
      ServerCommandConstants.GENERATE_GRAMMAR_FROM_XML,
      identifier,
      grammarExt,
      grammarFileUri.toString(),
      bindingType,
      formattingOptions
    );

    if (!bindOnly) {
      if (!result || !result.grammarContent) {
        window.showErrorMessage('Failed to generate grammar.');
        return;
      }
      // Write the grammar file
      fs.writeFileSync(grammarFilePath, result.grammarContent, 'utf8');
    }

    // Open the grammar file (generated or existing)
    const grammarDoc = await workspace.openTextDocument(grammarFileUri);
    await window.showTextDocument(grammarDoc, { preview: false });

    // Apply binding
    if (isFileAssociation) {
      const xmlDoc = workspace.textDocuments.find(d => d.uri.toString() === documentURI.toString());
      await bindWithFileAssociation(documentURI, grammarFileUri, xmlDoc);
    } else if (result.bindingEdit) {
      const workEdits = new WorkspaceEdit();
      for (const edit of result.bindingEdit.edits) {
        if ('newText' in edit) {
          workEdits.replace(documentURI, languageClient.protocol2CodeConverter.asRange(edit.range), edit.newText);
        }
      }
      const applied = await workspace.applyEdit(workEdits);
      if (!applied) {
        window.showWarningMessage('Grammar was generated but the binding could not be applied to the XML document.');
      }
    }
  } catch (error) {
    window.showErrorMessage('Error generating grammar: ' + error.message);
  }
}
