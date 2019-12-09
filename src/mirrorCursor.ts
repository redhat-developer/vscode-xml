/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import {
	window,
	workspace,
	ConfigurationChangeEvent,
	ExtensionContext,
	Disposable,
	TextDocument,
	Position,
	TextEditor,
	Selection,
	Range,
	WorkspaceEdit
} from 'vscode';

export function activateMirrorCursor(
	context: ExtensionContext,
	matchingTagPositionProvider: (document: TextDocument, position: Position) => Thenable<Position | null>,
	supportedLanguages: { [id: string]: boolean },
	configName: string
): Disposable {
	const disposables: Disposable[] = [];

	let isEnabled = false;
	let prevCursors: readonly Selection[] = [];
	let cursors: readonly Selection[] = [];
	let inMirrorMode = false;

	updateStateSetting();
	updateCursorsIfActiveEditor();

	window.onDidChangeTextEditorSelection(event => {
		updateCursors(event.selections, event.textEditor)
	}, undefined, disposables);

	workspace.onDidChangeConfiguration(updateEnabledState, undefined, disposables);

	function updateEnabledState(event: ConfigurationChangeEvent) {
		if (!event.affectsConfiguration(configName)) {
			return;
		}
		updateStateSetting();
		updateCursorsIfActiveEditor();
		promptUpdateMessage();
	}

	function updateStateSetting() {
		isEnabled = false;
		let editor = window.activeTextEditor;
		if (!editor) {
			return;
		}
		let document = editor.document;
		if (!supportedLanguages[document.languageId]) {
			return;
		}
		if (!workspace.getConfiguration(undefined, document.uri).get<boolean>(configName)) {
			return;
		}
		isEnabled = true;
	}

	function promptUpdateMessage() {
		const key: string = 'matchingTagNotified';
		const wasNotified: boolean | undefined= context.globalState.get<boolean>(key);
		if(!wasNotified) {
			window.showInformationMessage('Toggled the `xml.mirrorCursorOnMatchingTag` preference.');
			context.globalState.update(key, true);
		}
	}

	function exitMirrorMode() {
		inMirrorMode = false;
		window.activeTextEditor!.selections = [window.activeTextEditor!.selections[0]];
	};

	function updateCursorsIfActiveEditor() {
		const activeEditor: TextEditor | undefined = window.activeTextEditor;
		if (activeEditor) {
			updateCursors(activeEditor.selections, activeEditor);
		}
	}

	function updateCursors(selections: ReadonlyArray<Selection>, textEditor: TextEditor) {
		if (!isEnabled) {
			if (window.activeTextEditor) {
				prevCursors = window.activeTextEditor.selections;
				exitMirrorMode();
				cursors = window.activeTextEditor.selections;
			}
			return;
		}

		prevCursors = cursors;
		cursors = selections;

		if (cursors.length === 1) {
			if (inMirrorMode && prevCursors.length === 2) {
				if (cursors[0].isEqual(prevCursors[0]) || cursors[0].isEqual(prevCursors[1])) {
					return;
				}
			}
			if (selections[0].isEmpty) {
				matchingTagPositionProvider(textEditor.document, selections[0].active).then(matchingTagPosition => {
					if (matchingTagPosition && window.activeTextEditor) {
						const charBeforeAndAfterPositionsRoughtlyEqual = isCharBeforeAndAfterPositionsRoughtlyEqual(
							textEditor.document,
							selections[0].anchor,
							new Position(matchingTagPosition.line, matchingTagPosition.character)
						);

						if (charBeforeAndAfterPositionsRoughtlyEqual) {
							inMirrorMode = true;
							const newCursor = new Selection(
								matchingTagPosition.line,
								matchingTagPosition.character,
								matchingTagPosition.line,
								matchingTagPosition.character
							);
							window.activeTextEditor.selections = [...window.activeTextEditor.selections, newCursor];
						}
					}
				}).then(undefined,  err => {
					const msg = err.message ;
					// mutes "rejected promise not handled within 1 second"
					if (msg && !msg.endsWith('has been cancelled')){
						console.log(err);
					}
					return; 
				});
			}
		}

		if (cursors.length === 2 && inMirrorMode) {
			if (selections[0].isEmpty && selections[1].isEmpty) {
				if (
					prevCursors.length === 2 &&
					selections[0].anchor.line !== prevCursors[0].anchor.line &&
					selections[1].anchor.line !== prevCursors[0].anchor.line
				) {
					exitMirrorMode();
					return;
				}

				const charBeforeAndAfterPositionsRoughtlyEqual = isCharBeforeAndAfterPositionsRoughtlyEqual(
					textEditor.document,
					selections[0].anchor,
					selections[1].anchor
				);

				if (!charBeforeAndAfterPositionsRoughtlyEqual) {
					exitMirrorMode();
					return;
				} else {
					// Need to cleanup in the case of <div |></div |>
					if (
						shouldDoCleanupForHtmlAttributeInput(
							textEditor.document,
							selections[0].anchor,
							selections[1].anchor
						)
					) {
						const cleanupEdit = new WorkspaceEdit();
						const cleanupRange = new Range(selections[1].anchor.translate(0, -1), selections[1].anchor);
						cleanupEdit.replace(textEditor.document.uri, cleanupRange, '');
						exitMirrorMode();
						workspace.applyEdit(cleanupEdit);
					}
				}
			}
		}
	}

	return Disposable.from(...disposables);
}

function getCharBefore(document: TextDocument, position: Position) {
	const offset = document.offsetAt(position);
	if (offset === 0) {
		return '';
	}

	return document.getText(new Range(document.positionAt(offset - 1), position));
}

function getCharAfter(document: TextDocument, position: Position) {
	const offset = document.offsetAt(position);
	if (offset === document.getText().length) {
		return '';
	}

	return document.getText(new Range(position, document.positionAt(offset + 1)));
}

// Check if chars before and after the two positions are equal
// For the chars before, `<` and `/` are consiered equal to handle the case of `<|></|>`
function isCharBeforeAndAfterPositionsRoughtlyEqual(document: TextDocument, firstPos: Position, secondPos: Position) {
	const charBeforePrimarySelection = getCharBefore(document, firstPos);
	const charAfterPrimarySelection = getCharAfter(document, firstPos);
	const charBeforeSecondarySelection = getCharBefore(document, secondPos);
	const charAfterSecondarySelection = getCharAfter(document, secondPos);

	/**
	 * Special case for exiting
	 * |<div>
	 * |</div>
	 */
	if (
		charBeforePrimarySelection === ' ' &&
		charBeforeSecondarySelection === ' ' &&
		charAfterPrimarySelection === '<' &&
		charAfterSecondarySelection === '<'
	) {
		return false;
	}
	/**
	 * Special case for exiting
	 * |  <div>
	 * |  </div>
	 */
	if (charBeforePrimarySelection === '\n' && charBeforeSecondarySelection === '\n') {
		return false;
	}
	/**
	 * Special case for exiting
	 * <div>|
	 * </div>|
	 */
	if (charAfterPrimarySelection === '\n' && charAfterSecondarySelection === '\n') {
		return false;
	}

	// Exit mirror mode when cursor position no longer mirror
	// Unless it's in the case of `<|></|>`
	const charBeforeBothPositionRoughlyEqual =
		charBeforePrimarySelection === charBeforeSecondarySelection ||
		(charBeforePrimarySelection === '/' && charBeforeSecondarySelection === '<') ||
		(charBeforeSecondarySelection === '/' && charBeforePrimarySelection === '<');
	const charAfterBothPositionRoughlyEqual =
		charAfterPrimarySelection === charAfterSecondarySelection ||
		(charAfterPrimarySelection === ' ' && charAfterSecondarySelection === '>') ||
		(charAfterSecondarySelection === ' ' && charAfterPrimarySelection === '>');

	return charBeforeBothPositionRoughlyEqual && charAfterBothPositionRoughlyEqual;
}

function shouldDoCleanupForHtmlAttributeInput(document: TextDocument, firstPos: Position, secondPos: Position) {
	// Need to cleanup in the case of <div |></div |>
	const charBeforePrimarySelection = getCharBefore(document, firstPos);
	const charAfterPrimarySelection = getCharAfter(document, firstPos);
	const charBeforeSecondarySelection = getCharBefore(document, secondPos);
	const charAfterSecondarySelection = getCharAfter(document, secondPos);

	const primaryBeforeSecondary = document.offsetAt(firstPos) < document.offsetAt(secondPos);

	/**
	 * Check two cases
	 * <div |></div >
	 * <div | id="a"></div >
	 * Before 1st cursor: ` `
	 * After  1st cursor: `>` or ` `
	 * Before 2nd cursor: ` `
	 * After  2nd cursor: `>`
	 */
	return (
		primaryBeforeSecondary &&
		charBeforePrimarySelection === ' ' &&
		(charAfterPrimarySelection === '>' || charAfterPrimarySelection === ' ') &&
		charBeforeSecondarySelection === ' ' &&
		charAfterSecondarySelection === '>'
	);
}