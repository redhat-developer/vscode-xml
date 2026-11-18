/**
 *  Copyright (c) 2026 Red Hat, Inc. and others.
 *  All rights reserved. This program and the accompanying materials
 *  are made available under the terms of the Eclipse Public License v2.0
 *  which accompanies this distribution, and is available at
 *  https://www.eclipse.org/legal/epl-v20.html
 */

import { ConfigurationTarget, ExtensionContext, Uri, env, window, workspace } from 'vscode';

const DONT_SUGGEST_KEY = 'workspaceIndex.dontSuggest';
const GRAMMAR_PATTERN = '**/*.{xsd,dtd,rng,rnc,wsdl,xsl,xslt}';
const LEARN_MORE_URL = 'https://github.com/redhat-developer/vscode-xml/blob/main/docs/WorkspaceIndex.md';

/**
 * After the LSP client is ready, checks whether the workspace contains grammar
 * files and, if so, offers to enable the Workspace Index via a notification.
 *
 * The check is intentionally lightweight: `findFiles` with `maxResults: 1`
 * stops at the first match and uses VS Code's existing file-watcher cache —
 * no extra disk I/O, no impact on XML language support.
 */
export async function suggestWorkspaceIndexIfNeeded(context: ExtensionContext): Promise<void> {
  // Already enabled at any configuration level (global / workspace / folder)
  if (workspace.getConfiguration('xml').get<boolean>('workspaceIndex.enabled')) return;
  // User permanently dismissed the suggestion
  if (context.globalState.get<boolean>(DONT_SUGGEST_KEY)) return;

  const files = await workspace.findFiles(GRAMMAR_PATTERN, null, 1);
  if (files.length === 0) return;

  const ENABLE_GLOBALLY = 'Enable Globally';
  const ENABLE_WORKSPACE = 'For this Workspace';
  const LEARN_MORE = 'Learn more';
  const DONT_SHOW = "Don't show again";

  const message =
    'Your workspace contains grammar files (XSD, DTD, RNG, RNC…). ' +
    'Enable the Workspace Index to automatically update XML references when renaming these files. ' +
    'If you experience Out Of Memory errors, you can limit the scan via `xml.workspaceIndex.headLimits`.';

  const selection = await window.showInformationMessage(
    message, ENABLE_GLOBALLY, ENABLE_WORKSPACE, LEARN_MORE, DONT_SHOW
  );

  switch (selection) {
    case ENABLE_GLOBALLY:
      await workspace.getConfiguration('xml').update('workspaceIndex.enabled', true, ConfigurationTarget.Global);
      break;
    case ENABLE_WORKSPACE:
      await workspace.getConfiguration('xml').update('workspaceIndex.enabled', true, ConfigurationTarget.Workspace);
      break;
    case LEARN_MORE:
      await env.openExternal(Uri.parse(LEARN_MORE_URL));
      return suggestWorkspaceIndexIfNeeded(context);
    case DONT_SHOW:
      await context.globalState.update(DONT_SUGGEST_KEY, true);
      break;
    // undefined = dismissed (×) → shows again next session
  }
}
