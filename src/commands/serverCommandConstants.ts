import * as ClientCommandConstants from "./clientCommandConstants";

/**
 * XML Language Server commands.
 */

/**
 * Auto close tags
 */
export const AUTO_CLOSE_TAGS = 'xml.completion.autoCloseTags';

/**
 * Commands to revalidate files with an LSP command on the XML Language Server
 */
export const VALIDATE_CURRENT_FILE = ClientCommandConstants.VALIDATE_CURRENT_FILE;

export const VALIDATE_ALL_FILES = ClientCommandConstants.VALIDATE_ALL_FILES;

/**
 * Command to associate a grammar in a XML document
 */
export const ASSOCIATE_GRAMMAR_INSERT = "xml.associate.grammar.insert";

/**
 * Command to check if the current XML document is bound to a grammar
 */
export const CHECK_BOUND_GRAMMAR = "xml.check.bound.grammar";

/**
 * Command to check if a given file pattern matches any file on the workspace
 */
export const CHECK_FILE_PATTERN = "xml.check.file.pattern";

/**
 * Command to surround with tags, comments, cdata
 */
 export const REFACTOR_SURROUND_WITH = "xml.refactor.surround.with";