/**
 * Copyright 2022 Red Hat, Inc. and others.

 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 *     http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { commands, ConfigurationTarget, Disposable, workspace, window } from 'vscode';
import { getDirectoryPath, getRelativePath, getWorkspaceUri } from './utils/fileUtils';
import * as CommandKind from './commands/lspCommandConstants';

/**
 * Registers the `CommandKind.UPDATE_CONFIGURATION` command
 */
export function registerConfigurationUpdateCommand(): Disposable {
  return commands.registerCommand(CommandKind.UPDATE_CONFIGURATION, resolveConfigurationItemEdit);
}

function resolveConfigurationItemEdit<T>(configurationItemEdit: ConfigurationItemEdit) {
  if (configurationItemEdit.valueKind == ConfigurationItemValueKind.file) {
    configurationItemEdit.value = resolveFilePath(configurationItemEdit.value);
  }
  switch (configurationItemEdit.editType) {
    case ConfigurationItemEditType.Add:
      addToPreferenceArray<T>(configurationItemEdit.section, configurationItemEdit.value);
      break;
    case ConfigurationItemEditType.Delete: {
      removeFromPreferenceArray<T>(configurationItemEdit.section, configurationItemEdit.value);
    }
  }
}

function resolveFilePath(filePath: any): any {
  const currentWorkspaceUri = getWorkspaceUri(window.activeTextEditor.document).toString();
  return getDirectoryPath(filePath).includes(currentWorkspaceUri) ? getRelativePath(currentWorkspaceUri, filePath) : filePath;

}

function addToPreferenceArray<T>(key: string, value: T): void {
  const configArray: T[] = workspace.getConfiguration().get<T[]>(key, []);
  if (configArray.includes(value)) {
    return;
  }
  configArray.push(value);
  workspace.getConfiguration().update(key, configArray, ConfigurationTarget.Workspace);
}

function removeFromPreferenceArray<T>(key: string, value: T): void {
  const configArray: T[] = workspace.getConfiguration().get<T[]>(key, []);
  if (!configArray.includes(value)) {
    return;
  }
  const resultPref = configArray.filter(i => i != value);
  workspace.getConfiguration().update(key, resultPref, ConfigurationTarget.Workspace);
}

interface ConfigurationItemEdit {
  section: string;
  value: any;
  editType: ConfigurationItemEditType;
  valueKind: ConfigurationItemValueKind;
}

enum ConfigurationItemEditType {
  Add = 0,
  Delete = 1
}

enum ConfigurationItemValueKind {
  file = 0
}