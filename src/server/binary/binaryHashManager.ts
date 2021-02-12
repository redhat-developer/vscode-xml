import { ConfigurationTarget, workspace } from "vscode";

const TRUSTED_HASHES_SETTING_ID = 'xml.server.binary.trustedHashes';

/**
 * Returns the list of user trusted binary hashes
 *
 * @returns the list of user trusted binary hashes
 */
export function getTrustedHashes(): string[] {
  const trustedHashesValue = workspace.getConfiguration().inspect<string>(TRUSTED_HASHES_SETTING_ID).globalValue;
  if (!Array.isArray(trustedHashesValue)) {
    return [];
  }
  return trustedHashesValue as string[];
}


/**
 * Add a new hash to the list of trusted binary hashes
 *
 * @param hash The hash to add to the list of trusted binary hashes
 */
export function addTrustedHash(hash: string): void {
  const trustedHashes = getTrustedHashes();
  trustedHashes.push(hash);
  workspace.getConfiguration().update(TRUSTED_HASHES_SETTING_ID, trustedHashes, ConfigurationTarget.Global);
}