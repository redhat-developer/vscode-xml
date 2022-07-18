/**
 * VScode client commands.
 */

/**
   * Show XML references
   */
export const SHOW_REFERENCES = 'xml.show.references';

/**
 * Show editor references
 */
export const EDITOR_SHOW_REFERENCES = 'editor.action.showReferences';

/**
 * Reload VS Code window
 */
export const RELOAD_WINDOW = 'workbench.action.reloadWindow';

/**
 * Open settings command
 *
 * A `settingId: string` parameter can be optionally provided
 */
export const OPEN_SETTINGS = 'xml.open.settings';

/**
* Open settings command
*
* A `settingId: string` parameter can be optionally provided
*/
export const OPEN_URI = 'xml.open.uri';

/**
 * Render markdown string to html string
 */
export const MARKDOWN_API_RENDER = 'markdown.api.render';

export const OPEN_DOCS = 'xml.open.docs';

/**
 * Commands to revalidate files with an LSP command on the XML Language Server
 */
export const VALIDATE_CURRENT_FILE = 'xml.validation.current.file';

export const VALIDATE_ALL_FILES = 'xml.validation.all.files';

export const OPEN_DOCS_HOME = 'xml.open.docs.home';

/**
 * VSCode client commands to open the binding wizard to bind a XML to a grammar/schema.
 */
export const OPEN_BINDING_WIZARD = 'xml.open.binding.wizard';

/**
 * VSCode client command to open the grammar/schema binding wizard from command menu.
 */
export const COMMAND_PALETTE_BINDING_WIZARD = 'xml.command.bind.grammar';

/**
 * Client command to execute an XML command on XML Language Server side.
 */
export const EXECUTE_WORKSPACE_COMMAND = 'xml.workspace.executeCommand';

/**
 * Command to restart connection to language server.
 */
 export const RESTART_LANGUAGE_SERVER = 'xml.restart.language.server';