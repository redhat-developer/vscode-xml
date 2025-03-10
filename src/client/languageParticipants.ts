/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Event, EventEmitter, extensions } from 'vscode';
import { DocumentFilter, DocumentSelector } from 'vscode-languageclient';

const SCHEMES: string[] = [
  'untitled',
  'file',
  'ftp',
  'http',
  'https',
  'ssh',
  'streamfile',
];

/**
 * XML language participant contribution.
 */
interface LanguageParticipantContribution {
  /**
   * The id of the language which participates with the XML language server.
   */
  languageId: string;
}

export interface LanguageParticipants {
  readonly onDidChange: Event<void>;
  readonly documentSelector: DocumentSelector;
  hasLanguage(languageId: string): boolean;
  dispose(): void;
}

export function getLanguageParticipants(): LanguageParticipants {
  const onDidChangeEmmiter = new EventEmitter<void>();
  let languages = new Set<string>();

  function update() {
    const oldLanguages = languages;

    languages = new Set<string>();
    languages.add('xml');
    languages.add('xsl');
    languages.add('dtd');
    languages.add('svg');

    for (const extension of extensions.all /*extensions.allAcrossExtensionHosts*/) {
      const xmlLanguageParticipants = extension.packageJSON?.contributes?.xmlLanguageParticipants as LanguageParticipantContribution[];
      if (Array.isArray(xmlLanguageParticipants)) {
        for (const xmlLanguageParticipant of xmlLanguageParticipants) {
          const languageId = xmlLanguageParticipant.languageId;
          if (typeof languageId === 'string') {
            languages.add(languageId);
          }
        }
      }
    }
    return !isEqualSet(languages, oldLanguages);
  }
  update();

  const changeListener = extensions.onDidChange(_ => {
    if (update()) {
      onDidChangeEmmiter.fire();
    }
  });

  return {
    onDidChange: onDidChangeEmmiter.event,
    get documentSelector() {
      return SCHEMES.flatMap(scheme => {
        return Array.from(languages).map(language => {
          return {
            language,
            scheme
          } as DocumentFilter;
        });
      });
    },
    hasLanguage(languageId: string) { return languages.has(languageId); },
    dispose: () => changeListener.dispose()
  };
}

function isEqualSet<T>(s1: Set<T>, s2: Set<T>) {
  if (s1.size !== s2.size) {
    return false;
  }
  for (const e of s1) {
    if (!s2.has(e)) {
      return false;
    }
  }
  return true;
}
