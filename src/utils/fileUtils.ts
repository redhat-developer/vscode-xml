import * as path from "path";
import { TextDocument, Uri, workspace, WorkspaceFolder } from "vscode";

/**
 * Return the current workspace uri from root
 *
 * @param document the opened TextDocument
 * @returns the path from root of the current workspace
 */
 export function getWorkspaceUri(document: TextDocument): Uri | undefined {
  const currentWorkspace: WorkspaceFolder = (document && document.uri) ? workspace.getWorkspaceFolder(document.uri) : undefined;
  return ((currentWorkspace && currentWorkspace.uri) || (workspace.workspaceFolders && workspace.workspaceFolders.length > 0 && workspace.workspaceFolders[0].uri));
}

/**
 * Return the uri of the current file
 *
 * @param document the opened TextDocument
 * @returns the uri of the current file
 */
export function getFilePath(document: TextDocument): string {
  return (document && document.uri) ? document.uri.fsPath : undefined;
}

/**
 * Uses path to return a basename from a uri
 *
 * @param filePath the uri of the file
 * @return the filename
 */
export function getFileName(filePath: string): string {
  return path.basename(filePath);
}

/**
 * Return the relative file path between a start and destination uri
 *
 * @param startPath the absolute path of the beginning directory
 * @param destinationPath the absolute path of destination file
 * @returns the path to the destination relative to the start
 */
export function getRelativePath(startPath: string, destinationPath: string): string {
  return path.relative(path.normalize(startPath), path.normalize(destinationPath)).replace(/\\/g, '/');
}

/**
 * Uses path to return the directory name from a uri
 *
 * @param filePath the uri of the file
 * @return the directory path
 */
export function getDirectoryPath(filePath: string): string {
  return path.dirname(filePath);

}
