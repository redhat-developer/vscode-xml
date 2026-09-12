/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *
 *  Adapted from: https://github.com/microsoft/vscode/blob/main/extensions/html-language-features/client/src/autoInsertion.ts
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { window, workspace, Disposable, TextDocumentContentChangeEvent, TextDocument, Position, SnippetString, Range, TextDocumentChangeEvent, TextDocumentChangeReason } from 'vscode';

export interface AutoInsertResult {
  snippet: string,
  range?: Range
}

export function activateAutoInsertion(
  provider: (kind: 'autoQuote' | 'autoClose', document: TextDocument, position: Position) => Thenable<AutoInsertResult>,
  supportedLanguages: { [id: string]: boolean },
  autoCloseConfigName: string,
  autoQuoteConfigName: string
): Disposable {

  const disposables: Disposable[] = [];
  workspace.onDidChangeTextDocument(onDidChangeTextDocument, null, disposables);

  let anyIsEnabled = false;
  const isEnabled = {
    'autoQuote': false,
    'autoClose': false
  };
  updateEnabledState();
  window.onDidChangeActiveTextEditor(updateEnabledState, null, disposables);

  let timeout: NodeJS.Timeout | undefined = undefined;

  disposables.push({
    dispose: () => {
      if (timeout) {
        clearTimeout(timeout);
        timeout = undefined;
      }
    }
  });

  function updateEnabledState() {
    anyIsEnabled = false;
    const editor = window.activeTextEditor;
    if (!editor) {
      return;
    }
    const document = editor.document;
    if (!supportedLanguages[document.languageId]) {
      return;
    }
    const configurations = workspace.getConfiguration(undefined, document.uri);
    isEnabled['autoClose'] = configurations.get<boolean>(autoCloseConfigName) ?? false;
    isEnabled['autoQuote'] = configurations.get<boolean>(autoQuoteConfigName) ?? false;
    anyIsEnabled = isEnabled['autoClose'] || isEnabled['autoQuote'];
  }

  function onDidChangeTextDocument({ document, contentChanges, reason }: TextDocumentChangeEvent) {
    if (!anyIsEnabled || contentChanges.length === 0 || reason === TextDocumentChangeReason.Undo || reason === TextDocumentChangeReason.Redo) {
      return;
    }
    const activeDocument = window.activeTextEditor && window.activeTextEditor.document;
    if (document !== activeDocument) {
      return;
    }
    if (typeof timeout !== 'undefined') {
      clearTimeout(timeout);
    }
    const lastChange = contentChanges[contentChanges.length - 1];

    if (lastChange.rangeLength === 0 && isSingleLine(lastChange.text)) {
      // Insertion case
      const lastCharacter = lastChange.text[lastChange.text.length - 1];
      if (isEnabled['autoQuote'] && lastCharacter === '=') {
        doAutoInsert('autoQuote', document, lastChange);
      } else if (isEnabled['autoClose'] && (lastCharacter === '>' || lastCharacter === '/')) {
        doAutoInsert('autoClose', document, lastChange);
      }
    } else if (isEnabled['autoClose'] && lastChange.rangeLength > 0 && lastChange.text === '') {
      // Deletion case: check if the character at the deletion position is now '>'
      // This handles the case where '/' is removed from <tag/> leaving <tag>
      const position = lastChange.range.start;
      const lineText = document.lineAt(position.line).text;
      if (position.character < lineText.length) {
        const charAtCursor = lineText.charAt(position.character);
        if (charAtCursor === '>') {
          doAutoInsertAtPosition('autoClose', document, new Position(position.line, position.character + 1));
        }
      }
    }
  }

  function isSingleLine(text: string): boolean {
    return !/\n/.test(text);
  }

  function doAutoInsert(kind: 'autoQuote' | 'autoClose', document: TextDocument, lastChange: TextDocumentContentChangeEvent) {
    const rangeStart = lastChange.range.start;
    const position = new Position(rangeStart.line, rangeStart.character + lastChange.text.length);
    doAutoInsertAtPosition(kind, document, position);
  }

  function doAutoInsertAtPosition(kind: 'autoQuote' | 'autoClose', document: TextDocument, position: Position) {
    const version = document.version;
    timeout = setTimeout(() => {
      provider(kind, document, position).then(result => {
        const text = result?.snippet;
        if (text && isEnabled[kind]) {
          const activeEditor = window.activeTextEditor;
          if (activeEditor) {
            const activeDocument = activeEditor.document;
            if (document === activeDocument && activeDocument.version === version) {
              const selections = activeEditor.selections;
              if (selections.length > 1 && selections.some(s => s.active.isEqual(position))) {
                activeEditor.insertSnippet(new SnippetString(text), selections.map(s => s.active));
              } else {
                activeEditor.insertSnippet(new SnippetString(text), getReplaceLocation(result.range, position));
              }
            }
          }
        }
      }, (_reason: any) => {
        console.log('xml/autoInsert request has been cancelled');
      });
      timeout = undefined;
    }, 100);
  }

  return Disposable.from(...disposables);
}

function getReplaceLocation(range: Range | undefined, position: Position): Range | Position {
  if (range != null) {
    return new Range(
      new Position(range.start.line, range.start.character),
      new Position(range.end.line, range.end.character)
    );
  }
  return position;
}
