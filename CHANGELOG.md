# Change Log

## [0.20.0](https://github.com/redhat-developer/vscode-xml/milestone/28?closed=1) (March 29, 2022)

### Enhancements

 * Improve DTD/XSD security with regard to remote resources. See [#671](https://github.com/redhat-developer/vscode-xml/issues/671).
 * Closing tags should be included in the code folding range. See [lemminx#1178](https://github.com/eclipse/lemminx/issues/1178).

### Bug Fixes

 * NPE on xsd datatype autocompletion in binary mode. See [lemminx#1189](https://github.com/eclipse/lemminx/issues/1189).
 * Completion for prefix of attribute name. See [lemminx#1133](https://github.com/eclipse/lemminx/issues/1133).

### Other

 * Add support to download binaries from GitHub Releases. See [#685](https://github.com/redhat-developer/vscode-xml/pull/685).
 * Fix GraalVM Native Image Builds on Jenkins. See [#681](https://github.com/redhat-developer/vscode-xml/pull/681).
 * Update GraalVM version used in binary verification builds to x.y.z. See [lemminx#1158](https://github.com/eclipse/lemminx/issues/1158).
 
## [0.19.1](https://github.com/redhat-developer/vscode-xml/milestone/27?closed=1) (February 15, 2022)

### Bug Fixes

 * Fix endless diagnostic publishing when validation is disabled. See [lemminx#1175](https://github.com/eclipse/lemminx/issues/1175).
 
## [0.19.0](https://github.com/redhat-developer/vscode-xml/milestone/26?closed=1) (February 14, 2022)

### Enhancements

 * Basic support for parameter entities. See [lemminx#1167](https://github.com/eclipse/lemminx/issues/1167).
 * Support for document link DTD entity SYSTEM. See [lemminx#1165](https://github.com/eclipse/lemminx/issues/1165).

### Bug Fixes

 * Bad SYSTEM for DTD DocType and Entity breaks the XML validation. See [#647](https://github.com/redhat-developer/vscode-xml/issues/647).
 * Prevent suspicious directory traversal. See [lemminx#1171](https://github.com/eclipse/lemminx/pull/1171).
 * Limit resource downloads to http, https and ftp and prevent insecure redirects. See [lemminx#1174](https://github.com/eclipse/lemminx/pull/1174).
 * Bump follow-redirects from 1.14.7 to 1.14.8. See [#647](https://github.com/redhat-developer/vscode-xml/issues/659).

### Build

 * Eliminate need for downloading just-released binary checksums. See [#650](https://github.com/redhat-developer/vscode-xml/pull/650).

## [0.18.3](https://github.com/redhat-developer/vscode-xml/milestone/24?closed=1) (February 2, 2022)

### Enhancements
 * Support more customization for attribute elements in document symbols protocol. See [#633](https://github.com/redhat-developer/vscode-xml/issues/633).
 * Add 'telemetry' tag to redhat.telemetry.enabled preference. See [#643](https://github.com/redhat-developer/vscode-xml/pull/643).

### Bug Fixes
 * End Tag completion should be given priority above some other proposals. See [eclipse/lemminx#1150](https://github.com/eclipse/lemminx/issues/1150).
 * 'No definition found' when using 'Go to Definition' for types defined in imported XSD. See [#632](https://github.com/redhat-developer/vscode-xml/issues/632).
 * Add option to control downloading of external schema resources. See [#640](https://github.com/redhat-developer/vscode-xml/pull/640).
 * Invalid "schemaLocation" is not reported. See [eclipse/lemminx#1143](https://github.com/eclipse/lemminx/issues/1143).
 * NPE on renaming a namespaced tag with no corresponding ending tag. See [eclipse/lemminx#1139](https://github.com/eclipse/lemminx/issues/1139).
 * Updated Xerces to 2.12.2. See [eclipse/lemminx#1156](https://github.com/eclipse/lemminx/pull/1156).
 * Update Gson to 2.8.9. See [eclipse/lemminx#1161](https://github.com/eclipse/lemminx/pull/1161).

### Others
 * Use curl instead of wget to be consistent with usage. See [#639](https://github.com/redhat-developer/vscode-xml/pull/639).

## [0.18.2](https://github.com/redhat-developer/vscode-xml/milestone/24?closed=1) (December 14, 2021)

### Enhancements

 * Improve xsd-based quick-fix suggestions. See [#618](https://github.com/redhat-developer/vscode-xml/issues/618).

### Bug Fixes

 * Reduce Telemetry volume for `server.document.open`. See [#620](https://github.com/redhat-developer/vscode-xml/issues/620).
 * Renaming Tags with namespaces duplicates namespace. See [#621](https://github.com/redhat-developer/vscode-xml/issues/621).
 * Add note in binary requirements for Linux distros lacking libc. See [#619](https://github.com/redhat-developer/vscode-xml/pull/619).

## [0.18.1](https://github.com/redhat-developer/vscode-xml/milestone/23?closed=1) (3 November, 2021)

### Enhancements

 * File association pattern validation. See [#586](https://github.com/redhat-developer/vscode-xml/issues/586).
 * Binding grammar/schema with file associations. See [#573](https://github.com/redhat-developer/vscode-xml/issues/573).
 * Report schema identifier of XML document through telemetry event. See [eclipse/lemminx#1105](https://github.com/eclipse/lemminx/issues/1105).

### Bug Fixes

 * Handle potentially undefined workspace uri. See [#606](https://github.com/redhat-developer/vscode-xml/pull/606).
 * Fix issue preventing relative symbolic links from being correctly resolved. See [#601](https://github.com/redhat-developer/vscode-xml/issues/601).
 * Aggregate errors in xsd:import|include@schemaLocation for referenced grammar which have errors. See [#596](https://github.com/redhat-developer/vscode-xml/issues/596).
 * Disable external entities when using SAX parser. See [eclipse/lemminx#1104](https://github.com/eclipse/lemminx/pull/1104).
 * Fix recommended tsl-problem-matcher id. See [#608](https://github.com/redhat-developer/vscode-xml/pull/608).

### Others

 * Update vscode-redhat-telemetry to 0.4.2. See [#595](https://github.com/redhat-developer/vscode-xml/pull/595).
 * Compress documentation image/gif space. See [#568](https://github.com/redhat-developer/vscode-xml/issues/568).

## [0.18.0](https://github.com/redhat-developer/vscode-xml/milestone/22?closed=1) (August 10, 2021)

### Enhancements

 * Added CodeLens that displays referenced grammars at the top of an XML file. See [#569](https://github.com/redhat-developer/vscode-xml/pull/569).
 * Added CodeAction to bind an XML document to an existing schema. See [#515](https://github.com/redhat-developer/vscode-xml/issues/515).
 * If the workspace is not trusted, "Resolve external entities" is set to false. See [#537](https://github.com/redhat-developer/vscode-xml/issues/537).
 * Command to bind an XML document to an existing schema. See [#514](https://github.com/redhat-developer/vscode-xml/issues/514).
 * Collect telemetry data about text documents that are opened: file extension, grammar binding strategy, grammar resolving strategy. See [eclipse/lemminx#1066](https://github.com/eclipse/lemminx/issues/1066).
 * Improved documentation. See [#543](https://github.com/redhat-developer/vscode-xml/issues/543), [#546](https://github.com/redhat-developer/vscode-xml/pull/546), [#550](https://github.com/redhat-developer/vscode-xml/pull/550), [#560](https://github.com/redhat-developer/vscode-xml/issues/560), [#561](https://github.com/redhat-developer/vscode-xml/issues/561), [#562](https://github.com/redhat-developer/vscode-xml/issues/562), [#567](https://github.com/redhat-developer/vscode-xml/issues/567).

### Bug Fixes

 * Fixed stackoverflow and resource leak when calculating folding ranges. See [#538](https://github.com/redhat-developer/vscode-xml/issues/538).
 * Aligned tag closing bracket with attribute when `splitAttributes` and `closingBracketNewLine` are enabled. See [#516](https://github.com/redhat-developer/vscode-xml/issues/516).
 * Fixed `src-import.3.1` error range. See [eclipse/lemminx#1075](https://github.com/eclipse/lemminx/issues/1075).
 * Fixed `src-import.3.2` error range. See [eclipse/lemminx#1069](https://github.com/eclipse/lemminx/issues/1069).
 * Adding closing bracket (`>`) in attribute quotation marks causes repeated auto-complete of the closing tag. See [#547](https://github.com/redhat-developer/vscode-xml/issues/547).
 * Wrong minimal engine 1.37.0 mentioned instead of 1.52.0. See [#554](https://github.com/redhat-developer/vscode-xml/issues/554).
 * Prevent XML language server from restarting when it crashes due to running out of memory. See [#527](https://github.com/redhat-developer/vscode-xml/issues/527).

## [0.17.0](https://github.com/redhat-developer/vscode-xml/milestone/21?closed=1) (June 28, 2021)

### Enhancements
 * Added `closingBracketNewLine` formatting option. See [#508](https://github.com/redhat-developer/vscode-xml/pull/508).
 * Support workspace trust. See [#506](https://github.com/redhat-developer/vscode-xml/issues/506).
 * Optimize images size. See [#497](https://github.com/redhat-developer/vscode-xml/pull/497).
 * Better handling of failed binary downloads. See [#492](https://github.com/redhat-developer/vscode-xml/issues/492).
 * Update to vscode language client 7. See [#478](https://github.com/redhat-developer/vscode-xml/issues/478).
 * Bind XSD, DTD with CodeLens. See [#395](https://github.com/redhat-developer/vscode-xml/issues/395).
 * Added Auto Rename Tag. See [#130](https://github.com/redhat-developer/vscode-xml/issues/130).
 * Promote features of `vscode-xml` in documentation. See [#475](https://github.com/redhat-developer/vscode-xml/issues/475).
 * Upgrade `@redhat-developer/vscode-redhat-telemetry` to 0.1.1. See [#504](https://github.com/redhat-developer/vscode-xml/issues/504).
 * Support for `textDocument/selectionRange`. See [eclipse/lemminx#1021](https://github.com/eclipse/lemminx/issues/1021).

### Bug Fixes
 * Error in show reference request when using binary. See [#513](https://github.com/redhat-developer/vscode-xml/issues/513).
 * Adapt `.vscodeignore` to the new path matching strategy. See [#510](https://github.com/redhat-developer/vscode-xml/issues/510).
 * Fixed internal documentation parent directory link support. See [#499](https://github.com/redhat-developer/vscode-xml/issues/499).
 * Automatically closing tags in multi-cursor mode only closes one tag. See [#225](https://github.com/redhat-developer/vscode-xml/issues/225).
 * Bump browserslist from 4.16.3 to 4.16.6 to fix security vulnerability. See [#482](https://github.com/redhat-developer/vscode-xml/pull/482).
 * Fixed 'Go To References' in binary. See [eclipse/lemminx#1059](https://github.com/eclipse/lemminx/pull/1059).
 * CodeLens does not work in binary. See [eclipse/lemminx#1046](https://github.com/eclipse/lemminx/issues/1046).
 * Error while saving file to cache on Windows OS (PosixFileAttributeView not supported). See [eclipse/lemminx#734](https://github.com/eclipse/lemminx/issues/734).
 * Extension doesn't start when running in vscode < 1.55. See [#520](https://github.com/redhat-developer/vscode-xml/pull/520).
 * Language server remains running after VS Code stops. See [#530](https://github.com/redhat-developer/vscode-xml/pull/530).

## [0.16.1](https://github.com/redhat-developer/vscode-xml/milestone/20?closed=1) (May 18, 2021)

### Enhancements

 * Improve the error range for unterminated elements, and use `relatedInformation` to show the expected close tag placement. See [eclipse/lemminx#963](https://github.com/eclipse/lemminx/issues/963).
 * Add setting `xml.completion.autoCloseRemovesContent` to prevent auto self-closing feature from deleting content. See [#440](https://github.com/redhat-developer/vscode-xml/issues/440).
 * Rename telemetry events. See [#453](https://github.com/redhat-developer/vscode-xml/pull/453).
 * Output the language server error stream during development. See [eclipse/lemminx#1019](https://github.com/eclipse/lemminx/issues/1019).
 * Build and distribute a static binary for Linux. See [#457](https://github.com/redhat-developer/vscode-xml/issues/457).

### Bug Fixes

 * Fix `xml.validation.noGrammar` setting. See [#467](https://github.com/redhat-developer/vscode-xml/issues/467).
 * Fix XML 1.1 support in the binary server. See [eclipse/lemminx#1027](https://github.com/eclipse/lemminx/issues/1027).
 * Fix revalidation commands in the binary server. See [eclipse/lemminx#1031](https://github.com/eclipse/lemminx/issues/1031).
 * Do not override user's `files.trimTrailingWhitespace` in XML files. See [#299](https://github.com/redhat-developer/vscode-xml/issues/299).
 * Use the default npm registry in `package-lock.json`. See [#465](https://github.com/redhat-developer/vscode-xml/pull/465).
 * Fix range formatting in the binary server. See [eclipse/lemminx#1035](https://github.com/eclipse/lemminx/issues/1035).
 * Mitigate Billion Laughs vulnerability. See [#476](https://github.com/redhat-developer/vscode-xml/issues/476).

## [0.16.0](https://github.com/redhat-developer/vscode-xml/milestone/19?closed=1) (April 13, 2021)

### Enhancements

 * Add a progress bar to the binary server download. See [#433](https://github.com/redhat-developer/vscode-xml/issues/433).
 * Collect Telemetry data. See [#415](https://github.com/redhat-developer/vscode-xml/issues/415).
 * License change from EPL-1.0 to EPL-2.0. See [#392](https://github.com/redhat-developer/vscode-xml/issues/392).
 * Configure language server proxy based on a`http.proxyHost` and `http.proxyAuthorization`. See [#416](https://github.com/redhat-developer/vscode-xml/issues/416).

### Bug Fixes

 * Wait for the language server to stop before exiting. See [#437](https://github.com/redhat-developer/vscode-xml/pull/437).
 * Use `User-Agent: LemMinX` when downloading schemas to prevent HTTP 403 when using Java 8. See [#429](https://github.com/redhat-developer/vscode-xml/issues/429).
 * Fix rename not completing when using the binary. See [#424](https://github.com/redhat-developer/vscode-xml/issues/424).
 * Fix a regression where the vscode-xml API was not returned when calling extension.ts -> activate(). See [#418](https://github.com/redhat-developer/vscode-xml/issues/418).
 * Fix URL for extensions. See [#413](https://github.com/redhat-developer/vscode-xml/pull/413).
 * Notify the user when the language server fails to start. See [#409](https://github.com/redhat-developer/vscode-xml/issues/409).
 * Fix NPE when hovering on a malformed document. See [eclipse/lemminx#984](https://github.com/eclipse/lemminx/issues/984).
 * `trimTrailingWhitespace` option is not respected by `textDocument/formatting`. See [eclipse/lemminx#827](https://github.com/eclipse/lemminx/issues/827).
 * Fix auto close tags in XSLT files. See [#446](https://github.com/redhat-developer/vscode-xml/issues/446)

## [0.15.0](https://github.com/redhat-developer/vscode-xml/milestone/18?closed=1) (2 February, 2021)

### Enhancements

 * Run a binary executable version of the language server to avoid Java requirement. See [#316](https://github.com/redhat-developer/vscode-xml/pull/316).
 * Add new formatting setting `xml.format.splitAttributesIndentSize`. See [#386](https://github.com/redhat-developer/vscode-xml/pull/386).
 * Disable XSD validation when `xsi:schemaLocation` doesn't declare the namespace for the document element root. See [#390](https://github.com/redhat-developer/vscode-xml/pull/390).
 * Manage namespaces / prefix validation with a setting. See [#391](https://github.com/redhat-developer/vscode-xml/pull/391).
 * Add documentation for debugging external LemMinX extensions. See [#380](https://github.com/redhat-developer/vscode-xml/issues/380).
 * XML catalog schema is now built-in. See [#375](https://github.com/redhat-developer/vscode-xml/issues/375).

### Bug Fixes

 * Don't add trailing space to processing instructions. See [#372](https://github.com/redhat-developer/vscode-xml/issues/372).
 * LemMinX no longer crashes if a LemMinX extension class cannot be created. See [eclipse/lemminx#967](https://github.com/eclipse/lemminx/issues/967).
 * Single `<` no longer has code action to close with `/>`. See [#373](https://github.com/redhat-developer/vscode-xml/issues/373).
 * Catch errors from any participants. See [eclipse/lemminx#946](https://github.com/eclipse/lemminx/issues/946).
 * Avoid sending duplicate `client/registerCapability` for `workspace/executeCommand`. See [eclipse/lemminx#937](https://github.com/eclipse/lemminx/issues/937).
 * Use `kill -0` instead of `ps -p` in `ParentProcessWatcher`. See [eclipse/lemminx#936](https://github.com/eclipse/lemminx/issues/936).
 * Prevent `ClassCastException` when generating document links for XML catalogs. See [eclipse/lemminx#932](https://github.com/eclipse/lemminx/issues/932).
 * Register `org.eclipse.lsp4j.FileEvent` for reflection. See [eclipse/lemminx#979](https://github.com/eclipse/lemminx/issues/979).
 * Prevent URLs in `uri` attributes in catalogs from raising exceptions. See [eclipse/lemminx#977](https://github.com/eclipse/lemminx/issues/977).
 * Update find-java-home to improve automatic locating of Java. See [#374](https://github.com/redhat-developer/vscode-xml/issues/374).
 * Fix broken example XML document in the documentation. See [#394](https://github.com/redhat-developer/vscode-xml/issues/394).
 * Fix link to Extensions.md page from README.md. See [#379](https://github.com/redhat-developer/vscode-xml/pull/379).
 * Fix link to Extensions.md page from Preferences.md. See [#401](https://github.com/redhat-developer/vscode-xml/issues/401).

## [0.14.0](https://github.com/redhat-developer/vscode-xml/milestone/17?closed=1) (10 November, 2020)

### Enhancements

 * Allow globs in `xml.javaExtensions`. See [#324](https://github.com/redhat-developer/vscode-xml/pull/324).
 * Add links to the wiki in the settings. See [#322](https://github.com/redhat-developer/vscode-xml/issues/322).
 * Support file path variables in `xml.fileAssociations`. See [#307](https://github.com/redhat-developer/vscode-xml/issues/307).
 * Command to reload remote schema. See [#284](https://github.com/redhat-developer/vscode-xml/issues/284).
 * Customize symbols in the outline. See [#220](https://github.com/redhat-developer/vscode-xml/issues/220).
 * Publish releases to open-vsx.org. See [#287](https://github.com/redhat-developer/vscode-xml/pull/287).
 * Add documentation for `xml.symbols.showReferencedGrammar` setting. See [#335](https://github.com/redhat-developer/vscode-xml/issues/335).
 * Embed docs in vscode-xml. See [#326](https://github.com/redhat-developer/vscode-xml/issues/326).
 * Add LemMinX extensions via vscode user settings. See [#251](https://github.com/redhat-developer/vscode-xml/issues/251).
 * Outline should display referenced DTD / XSD from the current XML. See [lemminx#892](https://github.com/eclipse/lemminx/issues/892).
 * XML catalog `nextCatalog/@catalog` documentLink support. See [lemminx#845](https://github.com/eclipse/lemminx/issues/845).
 * Format for `xsi:schemaLocation`. See [lemminx#825](https://github.com/eclipse/lemminx/issues/825).
 * Document links in catalog's `<system uri="..." />`. See [lemminx#220](https://github.com/eclipse/lemminx/issues/220).

### Bug Fixes

 * Formatting comments which have no end should not generate `-->`. See [#347](https://github.com/redhat-developer/vscode-xml/issues/347).
 * Completion & hover based on XSD with `elementFormDefault="unqualified"` doesn't work. See [#311](https://github.com/redhat-developer/vscode-xml/issues/311).
 * Don't send invalid catalog notifications for paths with file schemes. See [#289](https://github.com/redhat-developer/vscode-xml/issues/289).
 * EntityNotDeclared quick fix doesn't use the proper indentation settings. See [#267](https://github.com/redhat-developer/vscode-xml/issues/267).
 * XSD with `targetNamespace` cannot be used with `xml.fileAssociations`. See [#223](https://github.com/redhat-developer/vscode-xml/issues/223).
 * `xml.fileAssociations` does not work with DTD files. See [#184](https://github.com/redhat-developer/vscode-xml/issues/184).
 * Remove 'Configuration' from XML preferences category name. See [#341](https://github.com/redhat-developer/vscode-xml/pull/341).
 * Avoid duplication of documentation between extension and wiki. See [#331](https://github.com/redhat-developer/vscode-xml/issues/331).
 * Stop the XMLServerLauncher process when the extension is deactivated. See [#303](https://github.com/redhat-developer/vscode-xml/issues/303).
 * Update dependencies to fix security vulnerabilities. See [#300](https://github.com/redhat-developer/vscode-xml/pull/300).
 * When associating a DTD through `<?xml-model...?>`, DTD-related errors should be aggregated. See [lemminx#918](https://github.com/eclipse/lemminx/issues/918).
 * Can't use XML catalog with XSD files that have `<xs:include />`. See [lemminx#914](https://github.com/eclipse/lemminx/issues/914).
 * Empty log file string crashes the server. See [lemminx#904](https://github.com/eclipse/lemminx/issues/904).
 * Incorrect diagnostic error range for `MSG_SPACE_REQUIRED_BEFORE_ELEMENT_TYPE_IN_ELEMENTDECL`. See [lemminx#902](https://github.com/eclipse/lemminx/issues/902).
 * CodeAction which raises an Exception prevents other CodeActions from being generated. See [lemminx#900](https://github.com/eclipse/lemminx/issues/900).
 * Symbols Max Items Computed doesn't work for 0. See [lemminx#898](https://github.com/eclipse/lemminx/issues/898).
 * Code Action for `</` with no matching open tag doesn't fix content. See [lemminx#889](https://github.com/eclipse/lemminx/issues/889).
 * Incorrect error range for cvc-complex-type.2.3. See [lemminx#885](https://github.com/eclipse/lemminx/issues/885).
 * Code Action to close root element closing tag inserts wrong closing tag. See [lemminx#878](https://github.com/eclipse/lemminx/issues/878).
 * Improve ETagRequired error range. See [lemminx#876](https://github.com/eclipse/lemminx/issues/876).
 * Improve error range for ETagUnterminated . See [lemminx#875](https://github.com/eclipse/lemminx/issues/875).
 * Error range for empty element cvc-datatype-valid.1.2.3. See [lemminx#871](https://github.com/eclipse/lemminx/issues/871).
 * Incorrect error range for cvc-datatype-valid.1.2.3. See [lemminx#864](https://github.com/eclipse/lemminx/issues/864).
 * `StringIndexOutOfBoundsException` in `EntityNotDeclaredCodeAction.getEntityName`. See [lemminx#862](https://github.com/eclipse/lemminx/issues/862).
 * Infinite loop inside `LSPMessageFormatter` for some cases. See [lemminx#856](https://github.com/eclipse/lemminx/issues/856).
 * XML validation should aggregate DTD errors in doctype. See [lemminx#853](https://github.com/eclipse/lemminx/issues/853).
 * DTD hyperlink with XML catalog and `PUBLIC` declaration doesn't work. See [lemminx#850](https://github.com/eclipse/lemminx/issues/850).
 * XML completion based on DTD with XML catalog and `PUBLIC` declaration doesn't work. See [lemminx#849](https://github.com/eclipse/lemminx/issues/849).
 * DTD validation doesn't work with XML catalog and `PUBLIC` declaration. See [lemminx#847](https://github.com/eclipse/lemminx/issues/847).
 * Null Pointer Exception in catalog extension. See [lemminx#833](https://github.com/eclipse/lemminx/issues/833).
 * XML validation should aggregate XSD errors where is referenced. See [lemminx#768](https://github.com/eclipse/lemminx/issues/768).
 * `completionRequest.getReplaceRange()` is erroneous in text that contains `/`. See [lemminx#723](https://github.com/eclipse/lemminx/issues/723).

## [0.13.0](https://github.com/redhat-developer/vscode-xml/milestone/16?closed=1) (July 6, 2020)

### Enhancements

 * Formatting support for trim trailing whitespace. See [#250](https://github.com/redhat-developer/vscode-xml/issues/250).
 * Warning message when one of the `xml.catalogs` paths cannot be found. See [#217](https://github.com/redhat-developer/vscode-xml/issues/217).
 * Grammar generator: generate a grammar from an XML document. See [lemminx#778](https://github.com/eclipse/lemminx/issues/778).
 * Bind XML document with no grammar constraints to generated XSD / DTD. See [lemminx#151](https://github.com/eclipse/lemminx/issues/151).
 * Quick fix to create missing `xsi:noNamespaceSchemaLocation` and generate XSD that adheres to current XML document. See [lemminx#702](https://github.com/eclipse/lemminx/issues/702).
 * Highlight the XSD file name in `xsi:schemaLocation` when reporting an invalid or missing XSD file. See [lemminx#782](https://github.com/eclipse/lemminx/issues/782).
 * Add support for `textDocument/documentLink` for `xsi:schemaLocation`. See [lemminx#666](https://github.com/eclipse/lemminx/issues/666).
 * Sort snippets. See [lemminx#692](https://github.com/eclipse/lemminx/issues/692).
 * New snippet to generate a catalog. See [lemminx#708](https://github.com/eclipse/lemminx/issues/708).
 * New snippets for `xml-stylesheet`. See [lemminx#728](https://github.com/eclipse/lemminx/issues/728).

### Bug Fixes

 * Missing `xml-model` reference generates multiple similar warnings. See [#795](https://github.com/eclipse/lemminx/issues/795).
 * Fix line break being incorrectly added when `preserveAttrLineBreaks` is `true`. See [#780](https://github.com/eclipse/lemminx/pull/780).
 * Fix cases where spaces in file paths weren't accounted for. See [lemminx#749](https://github.com/eclipse/lemminx/issues/749).
 * Fix documentation "information" typo. See [lemminx#812](https://github.com/eclipse/lemminx/pull/812).

## [0.12.0](https://github.com/redhat-developer/vscode-xml/milestone/15?closed=1) (June 10, 2020)

### Enhancements

 * Add `xml.format.preserveAttributeLineBreaks` setting. See [#271](https://github.com/redhat-developer/vscode-xml/pull/271)
 * Missing Java now links to adoptopenjdk.net, for Mac Users. See [#270](https://github.com/redhat-developer/vscode-xml/pull/270)
 * Don't return hover when there's no documentation. See [#258](https://github.com/redhat-developer/vscode-xml/issues/258)
 * Improve formatting for processing instructions. See [#240](https://github.com/redhat-developer/vscode-xml/issues/240)
 * Provide `xml.symbols.maxItemsComputed` setting for outline. See [#237](https://github.com/redhat-developer/vscode-xml/issues/237)
 * Formatter expand/collapse/ignore empty XML tags. See [#219](https://github.com/redhat-developer/vscode-xml/issues/219)
 * Completion for `xsd:enumeration` inside of text node. See [#218](https://github.com/redhat-developer/vscode-xml/issues/218)
 * Formatting of newlines at EOF. See [#196](https://github.com/redhat-developer/vscode-xml/issues/196)
 * Disable cdata autocompletion when typing period. See [#179](https://github.com/redhat-developer/vscode-xml/issues/179)
 * Provide more server/build info on startup. See [lemminx#755](https://github.com/eclipse/lemminx/pull/755)
 * Add support for `textDocument/documentLink` for xs:import/schemaLocation. See [lemminx#733](https://github.com/eclipse/lemminx/issues/733)
 * Add support for `textDocument/documentLink` for xml-model/href. See [lemminx#712](https://github.com/eclipse/lemminx/issues/712)
 * Find definition for external declared entity. See [lemminx#706](https://github.com/eclipse/lemminx/issues/706)
 * Snippet to generate xml-model. See [lemminx#699](https://github.com/eclipse/lemminx/issues/699)
 * XML Completion based on DTD/XML Schema by using xml-model . See [lemminx#698](https://github.com/eclipse/lemminx/issues/698)
 * Validate XML with DTD/XML Schema by using xml-model. See [lemminx#697](https://github.com/eclipse/lemminx/issues/697)
 * Create hyperlink to DTD source on hover. See [lemminx#693](https://github.com/eclipse/lemminx/issues/693)
 * Add support for `textDocument/documentLink` for xs:include/schemaLocation. See [#689](https://github.com/eclipse/lemminx/issues/689)
 * Validate XML with DTD/XML Schema by using xml-model. See [lemminx#688](https://github.com/eclipse/lemminx/pull/688)
 * Remove spacing when formatting processing instruction. See [lemminx#670](https://github.com/eclipse/lemminx/pull/670)
 * Hover for referenced entities. See [lemminx#663](https://github.com/eclipse/lemminx/issues/663)
 * Completion for external declared entity. See [lemminx#660](https://github.com/eclipse/lemminx/issues/660)
 * Insert final newline depending on lsp4j formatting settings. See [lemminx#649](https://github.com/eclipse/lemminx/pull/649)
 * Hyperlink to open declared DTD files. See [lemminx#641](https://github.com/eclipse/lemminx/issues/641)
 * Manage snippet registry to write snippet in JSON. Adds new snippets. See [lemminx#640](https://github.com/eclipse/lemminx/issues/640)
 * Separate xsd:documentation and xsd:appinfo contents on hover and completion. See [lemminx#630](https://github.com/eclipse/lemminx/issues/630)
 * Find definition for locally declared entity. See [lemminx#625](https://github.com/eclipse/lemminx/issues/625)
 * CodeActions for RootElementTypeMustMatchDoctypedecl. See [lemminx#561](https://github.com/eclipse/lemminx/issues/561)
 * CodeAction for EntityNotDeclared. See [lemminx#532](https://github.com/eclipse/lemminx/issues/532)
 * Completion for locally declared entity. See [lemminx#520](https://github.com/eclipse/lemminx/issues/520)

### Bug Fixes

 * Don't set the -noverify flag on startup. See [#259](https://github.com/redhat-developer/vscode-xml/issues/259)
 * XML entities declared in a DTD are marked undeclared after XML file change. See [#234](https://github.com/redhat-developer/vscode-xml/issues/234)
 * Formatting breaks attributes containing quotes. See [#182](https://github.com/redhat-developer/vscode-xml/issues/182)
 * Too many logs after completion, hover with XML that contains DTD subset. See [lemminx#750](https://github.com/eclipse/lemminx/issues/750)
 * Fix collection of external entities depending on line ending. See [lemminx#744](https://github.com/eclipse/lemminx/pull/744)
 * No entity completion for externally declared SYSTEM and PUBLIC entities. See [lemminx#742](https://github.com/eclipse/lemminx/issues/742)
 * Entity documentation has no value for entities declared with SYSTEM OR PUBLIC. See [lemminx#741](https://github.com/eclipse/lemminx/issues/741)
 * Error while loading DOCTYPE subset : java.lang.NullPointerException. See [lemminx#739](https://github.com/eclipse/lemminx/issues/739)
 * NPE in ContentModelCompletionParticipant.addCompletionItem. See [lemminx#720](https://github.com/eclipse/lemminx/issues/720)
 * NPE in XMLCompletions collectAttributeNameSuggestions(). See [lemminx#719](https://github.com/eclipse/lemminx/issues/719)
 * Support advanced characters for entity name. See [lemminx#718](https://github.com/eclipse/lemminx/pull/718)
 * Fix error range TargetNamespace.1. See [lemminx#704](https://github.com/eclipse/lemminx/issues/704)
 * Fix error range TargetNamespace.2. See [lemminx#703](https://github.com/eclipse/lemminx/issues/703)
 * Fix cache result of external grammar info. See [lemminx#696](https://github.com/eclipse/lemminx/pull/696)
 * Read the cached XSD, DTD grammar file with lazy mode. See [lemminx#687](https://github.com/eclipse/lemminx/pull/687)
 * NPE with Codelens in empty XSD file. See [lemminx#684](https://github.com/eclipse/lemminx/issues/684)
 * Range formatting inserts `<null>` when formatting inside DOCTYPE element. See [lemminx#682](https://github.com/eclipse/lemminx/issues/682)
 * NPE in ContentModelCodeActionParticipant.doCodeAction#L47. See [lemminx#671](https://github.com/eclipse/lemminx/issues/671)
 * Fix error range for `SemicolonRequiredInReference`. See [lemminx#664](https://github.com/eclipse/lemminx/issues/664)
 * Don't generate end element on apply completion if it exists. See [lemminx#651](https://github.com/eclipse/lemminx/issues/651)
 * Quickfix to close open tag doesn't deal with attributes. See [lemminx#646](https://github.com/eclipse/lemminx/issues/646)
 * NPE with TypeDefinition. See [lemminx#629](https://github.com/eclipse/lemminx/issues/629)
 * MSG_ATTRIBUTE_NOT_DECLARED must highlight attribute name instead of attribute value. See [lemminx#623](https://github.com/eclipse/lemminx/pull/634)

### Build

* Fix debug mode detection. See [#266](https://github.com/redhat-developer/vscode-xml/pull/266)
* Make it easier to start XML language server with suspend. See [#257](https://github.com/redhat-developer/vscode-xml/issues/257)

## [0.11.0](https://github.com/redhat-developer/vscode-xml/milestone/14?closed=1) (March 25, 2020)

### Enhancements

 * Switched XML Language server from lsp4xml to [Eclipse LemMinX](https://github.com/eclipse/lemminx). See [lemminx#283](https://github.com/eclipse/lemminx/issues/283)

### Bug Fixes

 * Enumeration documentation is not displayed. See [lemminx#233](https://github.com/redhat-developer/vscode-xml/issues/233)
 * XSD download fails in recent versions. See [#226](https://github.com/redhat-developer/vscode-xml/issues/226)
 * Gracefully handle cancelled  `xml/closeTag` requests. See [#149](https://github.com/redhat-developer/vscode-xml/issues/149)
 * NPE when typing <?. See [lemminx#614](https://github.com/eclipse/lemminx/issues/614)
 * NPE when document contains an empty tag. See [lemminx#613](https://github.com/eclipse/lemminx/issues/613)
 * In Maven <configuration>, all known XML elements from schema are suggested as completion. See [lemminx#612](https://github.com/eclipse/lemminx/issues/612)
 * UTF-16 not supported. See [lemminx#611](https://github.com/eclipse/lemminx/issues/611)

## [0.10.1](https://github.com/redhat-developer/vscode-xml/milestone/13?closed=1) (December 15, 2019)

### Bug Fixes

* Temporarily removed experimental simultaneously editing of start/end tags causing editing issues in all of VS Code. See [#211](https://github.com/redhat-developer/vscode-xml/issues/211).

## [0.10.0](https://github.com/redhat-developer/vscode-xml/milestone/12?closed=1) (December 13, 2019)

### Enhancements

* (Experimental) Ability to edit start/end tag simultaneously under `xml.mirrorCursorOnMatchingTag` preference. Can be toggled on/off on Windows/Linux through `ctrl+shift+f2` and on Mac `cmd+shift+f2`. See [#130](https://github.com/redhat-developer/vscode-xml/issues/130).
* Allows File Associations to be used without Workspace. See [#202](https://github.com/redhat-developer/vscode-xml/issues/202).
* CodeAction for missing root end tag. See [#lsp4xml/595](https://github.com/angelozerr/lsp4xml/pull/595).
* DTD hover/completion support for documentation. See [#lsp4xml/592](https://github.com/angelozerr/lsp4xml/pull/592).
* CodeAction for similar looking element names if it doesn't match the schema. See [#lsp4xml/591](https://github.com/angelozerr/lsp4xml/pull/591).
* Navigation and intellisense for xs:include-ed types. See [#lsp4xml/579](https://github.com/angelozerr/lsp4xml/pull/579).
* Contribute to completion, hover .. with external JAR. See [#193](https://github.com/redhat-developer/vscode-xml/pull/193).
* Added documentation on how to contribute extensions to the XML LS. See [#197](https://github.com/redhat-developer/vscode-xml/pull/197).


### Bug Fixes

* xs:import code action was inserting inside the tag name. See [#lsp4xml/593](https://github.com/angelozerr/lsp4xml/pull/593).
* Prolog attribute completion was providing invalid values. See [#lsp4xml/587](https://github.com/angelozerr/lsp4xml/pull/587).
* getCurrentAttribute method was not returning the correct attribute name. See [#lsp4xml/584](https://github.com/angelozerr/lsp4xml/pull/584).
* Hover was not returning all hover responses. See [#lsp4xml/582](https://github.com/angelozerr/lsp4xml/pull/582).
* cvc-pattern error range fix. See [#lsp4xml/580](https://github.com/angelozerr/lsp4xml/pull/580).

## [0.9.1](https://github.com/redhat-developer/vscode-xml/milestone/11?closed=1) (October 17, 2019)

### Bug Fixes

 * XSD: IntelliSense and element substitutions. See [#186](https://github.com/redhat-developer/vscode-xml/issues/186)
 * Completion doesn't use file cache for included XML schema. See [lsp4xml#570](https://github.com/angelozerr/lsp4xml/pull/570)
 * Prevent from NPE validation with schemaLocaton and "schema.reference.4" error. See [lsp4xml#569](https://github.com/angelozerr/lsp4xml/pull/569)

### Performance

 * Improve performance and memory for validation by caching XML Schema / DTD. See [lsp4xml#534](https://github.com/angelozerr/lsp4xml/issues/534)

### Others

 * Reject download of resource which are not in the cache folder. See [lsp4xml#567](https://github.com/angelozerr/lsp4xml/pull/567)
 * Add xml.validation.disallowDocTypeDecl & xml.validation.resolveExternalEntities settings. See [#187](https://github.com/redhat-developer/vscode-xml/pull/187)
 * Added maven info. See [#148](https://github.com/redhat-developer/vscode-xml/pull/148)

## [0.9.0](https://github.com/redhat-developer/vscode-xml/milestone/10?closed=1) (September 10, 2019)

### Enhancements

 * Add support for `textDocument/documentHighlight` for DTD. See [lsp4xml#545](https://github.com/angelozerr/lsp4xml/issues/545)
 * Ability to `rename` a `complexType/@name` inside XML Schema. See [lsp4xml#454](https://github.com/angelozerr/lsp4xml/issues/454)
 * Add support for `textDocument/codeLens` for XML DTD. See [lsp4xml#252](https://github.com/angelozerr/lsp4xml/issues/252)
 * Add support for `textDocument/references` for DTD. See [lsp4xml#234](https://github.com/angelozerr/lsp4xml/issues/234)
 * Add support for `textDocument/definition` for DTD. See [lsp4xml#233](https://github.com/angelozerr/lsp4xml/issues/233)
 * `JDK changes` (xml.java.home or java.home) should be detected. See [#150](https://github.com/redhat-developer/vscode-xml/issues/150)

### Bug Fixes

 * Fix error range for `cvc-datatype-valid-1-2-1`. See [lsp4xml#323](https://github.com/angelozerr/lsp4xml/issues/323)
 * Support completion with `xs:any`. See [#177](https://github.com/redhat-developer/vscode-xml/issues/177)
 * Cache completion based on XML Schema/DTD. See [#172](https://github.com/redhat-developer/vscode-xml/issues/172)
 * Fixes issue with error messages not showing. See [lsp4xml#557](https://github.com/angelozerr/lsp4xml/pull/557)
 * Validation Error Message Fails on Certain Cases. See [lsp4xml#553](https://github.com/angelozerr/lsp4xml/issues/553)
 * Error range for `RootElementTypeMustMatchDoctypedecl`. See [lsp4xml#537](https://github.com/angelozerr/lsp4xml/issues/537)

## [0.8.0](https://github.com/redhat-developer/vscode-xml/milestone/9?closed=1) (July 23, 2019)

### Enhancements

 * `Markdown` support for `completion` and `hover` documentation. See [#32](https://github.com/redhat-developer/vscode-xml/issues/32)
 * Add completion for `comment` and `#region`. See [lsp4xml#54](https://github.com/angelozerr/lsp4xml/issues/54)
 * Add completion for `CDATA` block. See [#168](https://github.com/redhat-developer/vscode-xml/issues/168)
 * Find definition for start/end tag element. See [lsp4xml#535](https://github.com/angelozerr/lsp4xml/issues/535)
 * Show `relevant XML` completion options based on XML Schema. See [lsp4xm#347](https://github.com/angelozerr/lsp4xml/issues/347)
 * Improve `XSD source` information for XML completion. See [lsp4xm#529](https://github.com/angelozerr/lsp4xml/issues/529)
 * Add support for `textDocument/documentHighlight` for XML Schema types. See [lsp4xm#470](https://github.com/angelozerr/lsp4xml/issues/470)
 * Add support for `textDocument/completion` for xs:element/@name / xs:extension/@base. See [lsp4xm#451](https://github.com/angelozerr/lsp4xml/issues/451)
 * Add support for selective outline enablement per file. See [lsp4xm#427](https://github.com/angelozerr/lsp4xml/issues/427)
 * Parse `.ent` and `.mod` files as DTD files. See [lsp4xm#380](https://github.com/angelozerr/lsp4xml/issues/380)
 * Add support for `textDocument/typeDefinition` from XML to XMLSchema/DTD. See [lsp4xm#371](https://github.com/angelozerr/lsp4xml/issues/371)
 * Add support for `textDocument/definition` for XML Schema. See [lsp4xm#148](https://github.com/angelozerr/lsp4xml/issues/148)
 * Add support for `textDocument/references` for XML Schema types. See [lsp4xm#58](https://github.com/angelozerr/lsp4xml/issues/58)
 * Add support for `textDocument/codelens` for XML Schema types. See [lsp4xm#55](https://github.com/angelozerr/lsp4xml/issues/55)
 * Add support for clickable`XSD CodeLens`. See [lsp4xm#490](https://github.com/angelozerr/lsp4xml/issues/490)
 * Active editor cannot provide outline information. See [#166](https://github.com/redhat-developer/vscode-xml/issues/166)
 * Add XML support for unsaved XML, XSD and XSL files. See [#156](https://github.com/redhat-developer/vscode-xml/issues/156)
 * Trigger `textDocument/didSave` if an XSD file was changed externally from a different editor. See [#132](https://github.com/redhat-developer/vscode-xml/issues/132)
 * Improved XML validation when XSD files are saved. See [lsp4xm#506](https://github.com/angelozerr/lsp4xml/issues/506)

### Bug Fixes

 * Hover markup response ignored the hover client capability. See [lsp4xm#525](https://github.com/angelozerr/lsp4xml/issues/525)
 * Completion capability was lost in specific scenarios. See [lsp4xm#522](https://github.com/angelozerr/lsp4xml/issues/522)
 * Fixed NPE in  `textDocument/definition` in XSD files. See [lsp4xm#488](https://github.com/angelozerr/lsp4xml/issues/488)
 * Fix test with markdown on Windows OS. See [lsp4xm#487](https://github.com/angelozerr/lsp4xml/issues/487)
 * Fixed case sensitivity problems for element and attribute names. See [lsp4xm#433](https://github.com/angelozerr/lsp4xml/issues/433)
 * Selection formatting ignores attribute indentation preference. See [lsp4xm#429](https://github.com/angelozerr/lsp4xml/issues/429)
 * Fixed error range for `src-import.1.2`. See [lsp4xm#499](https://github.com/angelozerr/lsp4xml/issues/499)
 * Fixed error range for `s4s-elt-invalid-content.3`. See [lsp4xm#496](https://github.com/angelozerr/lsp4xml/issues/496)
 * Fixed error range for `EntityNotDeclared`. See [lsp4xm#518](https://github.com/angelozerr/lsp4xml/issues/518)
 * Fixed error range for `cvc-pattern-valid`. See [lsp4xm#477](https://github.com/angelozerr/lsp4xml/issues/477)
 * Fixed error range for `AttributePrefixUnbound`. See [lsp4xm#476](https://github.com/angelozerr/lsp4xml/issues/476)
 * Fixed error range for `EmptyTargetNamespace`. See [lsp4xm#472](https://github.com/angelozerr/lsp4xml/issues/472)
 * Fixed error range for `ct-props-correct.3`. See [lsp4xm#467](https://github.com/angelozerr/lsp4xml/issues/467)
 * Fixed error range for `sch-props-correct.2`. See [lsp4xm#462](https://github.com/angelozerr/lsp4xml/issues/462)
 * Fixed error range for `s4s-elt-must-match.2`. See [lsp4xm#458](https://github.com/angelozerr/lsp4xml/issues/458)
 * Fixed error range for `ct-props-correct.3`. See [lsp4xm#455](https://github.com/angelozerr/lsp4xml/issues/455)
 * Fixed error range for `src-ct.1`. See [lsp4xm#453](https://github.com/angelozerr/lsp4xml/issues/453)
 * Fixed error range for `duplicate attribute`. See [lsp4xm#452](https://github.com/angelozerr/lsp4xml/issues/452)
 * Fixed error range for `p-props-correct.2.1`. See [lsp4xm#436](https://github.com/angelozerr/lsp4xml/issues/436)
 * Fixed error range for `cos-all-limited.2`. See [lsp4xm#428](https://github.com/angelozerr/lsp4xml/issues/428)
 * Fixed error range for `src-element.3`. See [lsp4xm#420](https://github.com/angelozerr/lsp4xml/issues/420)
 * Documents with an Internal Subset DOCTYPE had stopped trying to bind. See [lsp4xm#379](https://github.com/angelozerr/lsp4xml/issues/379)
 * XML did not validate when bounded DTD file was not found. See [#167](https://github.com/redhat-developer/vscode-xml/issues/167)
 * Unexpected indentation after empty element and attribute. See [#159](https://github.com/redhat-developer/vscode-xml/issues/159)
 * Formatter inserts spaces in empty lines. See [lsp4xm#157](https://github.com/redhat-developer/vscode-xml/issues/157)
 * Plugin is not recognized as a XML formatter. See [#154](https://github.com/redhat-developer/vscode-xml/issues/154)
 * Fixed discrepancy in completion between prefixed and default namespaces. See [#87](https://github.com/redhat-developer/vscode-xml/issues/87)

### Performance

 * Improve XML Scanner performance. See [lsp4xm#444](https://github.com/angelozerr/lsp4xml/issues/444)
 * Use CompletableFuture to load DOMDocument. See [lsp4xm#439](https://github.com/angelozerr/lsp4xml/issues/439)
 * Feedback from memory. See [lsp4xm#438](https://github.com/angelozerr/lsp4xml/issues/438)
 * Improve performance of TextDocument update (in async) with TreeLineTracker. See [lsp4xm#426](https://github.com/angelozerr/lsp4xml/issues/426)
 * Test Large Files for Performance. See [lsp4xm#48](https://github.com/angelozerr/lsp4xml/issues/48)

## [0.7.0](https://github.com/redhat-developer/vscode-xml/milestone/8?closed=1) (June 11, 2019)

### Enhancements

* Display Java runtime used to launch the server (See Output view). See [lsp4xml#415](https://github.com/angelozerr/lsp4xml/pull/415).
* Added `xml.symbols.enabled` preference, to enable/disable Document Symbols. See [#151](https://github.com/redhat-developer/vscode-xml/pull/151).
* Added `xml.java.home` preference, to set the Java path. See [#145](https://github.com/redhat-developer/vscode-xml/issues/145).
* File completion in attribute value. See [lsp4xml#345](https://github.com/angelozerr/lsp4xml/issues/345).
* Support for JRE's. See [#152](https://github.com/redhat-developer/vscode-xml/pull/152).
* Validation when editing an XML Schema. See [lsp4xml#190](https://github.com/angelozerr/lsp4xml/issues/190).
* Added XML Prolog completion in DTD files. See [lsp4xml#267](https://github.com/angelozerr/lsp4xml/issues/267).
* Ability to rename a namespace/namespace renaming improvements. See [lsp4xml#366](https://github.com/angelozerr/lsp4xml/issues/366).
* Startup time for SVG DTD file completion was too slow. See [lsp4xml#397](https://github.com/angelozerr/lsp4xml/issues/397).
* Mark element source coming from XML Schema/DTD for completion. See [lsp4xml#210](https://github.com/angelozerr/lsp4xml/issues/210).
* Added Webpack support. See [#122](https://github.com/redhat-developer/vscode-xml/issues/122).

### Bug Fixes

* Memory usage improvements. See [lsp4xml#389](https://github.com/angelozerr/lsp4xml/issues/389).
* Fix completion source crash on Windows OS. See [lsp4xml#408](https://github.com/angelozerr/lsp4xml/pull/408).
* Fix error range for `ETagRequired`. See [lsp4xml#387](https://github.com/angelozerr/lsp4xml/issues/387).
* Fix error range for `cos-all-limited.2`. See [lsp4xml#407](https://github.com/angelozerr/lsp4xml/issues/407).
* Document Symbols only returns the 1st `ATTLIST` value. See [lsp4xml#265](https://github.com/angelozerr/lsp4xml/issues/265).
* Completion in SVG DTD file proposed duplicate completions. See [#141](https://github.com/redhat-developer/vscode-xml/issues/141).
* Indentation wasn't working properly on a certain case. See [#137](https://github.com/redhat-developer/vscode-xml/issues/137).
* Fix excessive autoclose calls. See [#153](https://github.com/redhat-developer/vscode-xml/pull/153).
* Fixed formatting range issues. See [lsp4xml#76](https://github.com/angelozerr/lsp4xml/issues/76).

## [0.6.0](https://github.com/redhat-developer/vscode-xml/milestone/7?closed=1) (May 22, 2019)

### Enhancements

* Attribute completion for both `xsi:schemaLocation` and `xsi:noNamespaceSchemaLocation` are independent of each other. See [#129](https://github.com/redhat-developer/vscode-xml/issues/129).
* Upgraded to lsp4j version 0.7.1. See [lsp4xml#370](https://github.com/angelozerr/lsp4xml/issues/370).
* Preference `xml.format.preservedNewLines` to preserve new lines on format. See [#133](https://github.com/redhat-developer/vscode-xml/pull/133).

### Bug Fixes

* Fixed error range for `cvc-complex-type.2.4.f`. See [lsp4xml#368](https://github.com/angelozerr/lsp4xml/issues/368).
* Fixed error range for `SchemaLocation` warning. See [lsp4xml#343](https://github.com/angelozerr/lsp4xml/issues/343).
* Fixed error range for `MarkupEntityMismatch`. See [lsp4xml#367](https://github.com/angelozerr/lsp4xml/issues/367).
* Missing schema would generate too many/redundant warnings. See [lsp4xml#336](https://github.com/angelozerr/lsp4xml/issues/336).
* Self-closing tag did not remove end tag if tag name contained uppercase characters. See [lsp4xml#354](https://github.com/angelozerr/lsp4xml/issues/354).
* Placing a `/` in an attribute value triggered autoclosing. See [#126](https://github.com/redhat-developer/vscode-xml/issues/126).
* Fixed 4 vulnerable npm dependencies. See [#139](https://github.com/redhat-developer/vscode-xml/pull/139).


## [0.5.1](https://github.com/redhat-developer/vscode-xml/milestone/6?closed=1) (April 08, 2019)

### Bug Fixes

* Fixed incorrect expansion of the `~` directory on Windows, for `xml.server.workDir`. See [#125](https://github.com/redhat-developer/vscode-xml/issues/125).


## [0.5.0](https://github.com/redhat-developer/vscode-xml/milestone/5?closed=1) (April 05, 2019)

### Enhancements

* More detailed completion for prolog. See [lsp4xml#155](https://github.com/angelozerr/lsp4xml/issues/155).
* Added completion for xmlns attribute. See [lsp4xml#208](https://github.com/angelozerr/lsp4xml/issues/208).
* Have value completion for `xmlns:xsi`. See [lsp4xml#326](https://github.com/angelozerr/lsp4xml/issues/326).
* Disabled ParentProcessWatcher on Windows. See [#116](https://github.com/redhat-developer/vscode-xml/pull/116).
* Autoclose self-closing tags. See [#113](https://github.com/redhat-developer/vscode-xml/pull/113).
* Don't autoclose tag if the closing tag already exists. See [#113](https://github.com/redhat-developer/vscode-xml/pull/113).
* Changing the content of an XML Schema triggers validation. See [lsp4xml#213](https://github.com/angelozerr/lsp4xml/issues/213).
* Preference `xml.server.workDir` to set schema cache folder. See [lsp4xml#222](https://github.com/angelozerr/lsp4xml/issues/222).
* Code action to close missing quotes for attributes. See [lsp4xml#137](https://github.com/angelozerr/lsp4xml/issues/137).
* Hover for attribute value documentation from XSD's. See [lsp4xml#12](https://github.com/angelozerr/lsp4xml/issues/12).
* Autocompletion for `xsi:nil` values. See [lsp4xml#247](https://github.com/angelozerr/lsp4xml/issues/247).

### Bug Fixes

* `textDocument/publishDiagnostics` failed with message: Illegal argument: line must be non-negative. See [lsp4xml#157](https://github.com/angelozerr/lsp4xml/pull/157).
* XSI completion item messages were incorrect. See [lsp4xml#296](https://github.com/angelozerr/lsp4xml/issues/296).
* Removed trailing whitespace from normalized strings on format. See [lsp4xml#300](https://github.com/angelozerr/lsp4xml/pull/300).
* Formatting an attribute without value loses data. See [lsp4xml#294](https://github.com/angelozerr/lsp4xml/issues/294).
* Fixed error range of cvc-type.3.1.2. See [lsp4xml#318](https://github.com/angelozerr/lsp4xml/issues/318).
* Fixed error range of ETagUnterminated. See [lsp4xml#317](https://github.com/angelozerr/lsp4xml/issues/317).
* Fixed error range of cvc-elt.3.2.1. See [lsp4xml#321](https://github.com/angelozerr/lsp4xml/issues/321).
* Multiple `'insert required attribute'` code actions shown when multiple attributes are missing. See [lsp4xml#209](https://github.com/angelozerr/lsp4xml/issues/209).
* Self closing tag causes NPE in `cvc_complex_type_2_1CodeAction.doCodeAction`. See [lsp4xml#339](https://github.com/angelozerr/lsp4xml/issues/339).
* Formatting removes xml-stylesheet processing instruction attributes. See [#115](https://github.com/redhat-developer/vscode-xml/issues/115).
* Prevent rejected Promise during tag autoclose call. See [#117](https://github.com/redhat-developer/vscode-xml/issues/117).

## [0.4.0](https://github.com/redhat-developer/vscode-xml/milestone/4?closed=1) (March 07, 2019)

### Enhancements

* Modified schema validation messages. See [#91](https://github.com/redhat-developer/vscode-xml/issues/91).
* Preference `xml.format.quotations` to set single vs double quotes for attribute values on format. See [lsp4xml#263](https://github.com/angelozerr/lsp4xml/issues/263).
* Preference `xml.format.preserveEmptyContent` to preserve a whitespace value in an element's content. See [#96](https://github.com/redhat-developer/vscode-xml/issues/96).
* Compatibility with OSGi and p2. See [lsp4xml#288](https://github.com/angelozerr/lsp4xml/issues/288).

### Bug Fixes

* Fixed memory leak of file handles. See [#108](https://github.com/redhat-developer/vscode-xml/issues/108).
* XSI completion item messages were incorrect. See [lsp4xml#296](https://github.com/angelozerr/lsp4xml/issues/296).
* Removed trailing whitespace from normalized strings on format. See [lsp4xml#300](https://github.com/angelozerr/lsp4xml/pull/300).
* Format of attribute without value loses data. See [lsp4xml#294](https://github.com/angelozerr/lsp4xml/issues/294).

## [0.3.0](https://github.com/redhat-developer/vscode-xml/milestone/3?closed=1) (January 28, 2019)

### Enhancements

* Added ability to format DTD/DOCTYPE content. See [lsp4xml#268](https://github.com/angelozerr/lsp4xml/issues/268).
* Added outline for DTD elements. See [lsp4xml#226](https://github.com/angelozerr/lsp4xml/issues/226).
* XML completion based on internal DTD. See [lsp4xml#251](https://github.com/angelozerr/lsp4xml/issues/251).
* Add `xml.validation.noGrammar` preference, to indicate document won't be validated. See [#89](https://github.com/redhat-developer/vscode-xml/issues/89).
* Provide automatic completion/validation in catalog files. See [#204](https://github.com/redhat-developer/vscode-xml/issues/204).
* Hover for XSI attributes. See [lsp4xml#164](https://github.com/angelozerr/lsp4xml/issues/164).
* Show attribute value completion based on XML Schema/DTD. See [lsp4xml#242](https://github.com/angelozerr/lsp4xml/issues/242).
* Added `xml.format.spaceBeforeEmptyCloseTag` preference to insert whitespace before closing empty end-tag. See [#84](https://github.com/redhat-developer/vscode-xml/issues/84).
* Completion for XSI attributes. See [lsp4xml#163](https://github.com/angelozerr/lsp4xml/issues/163).
* Changing the content of catalog.xml refreshes the catalogs and triggers validation. See [lsp4xml#212](https://github.com/angelozerr/lsp4xml/issues/212).
* Added preference to enable/disable validation `xml.validation.enabled` and `xml.validation.schema`. See [#100](https://github.com/redhat-developer/vscode-xml/pull/100).
* XML completion based on external DTD. See [lsp4xml#106](https://github.com/angelozerr/lsp4xml/issues/106).
* Completion for DTD <!ELEMENT, <!ATTRIBUTE, ... . See [lsp4xml#232](https://github.com/angelozerr/lsp4xml/issues/232).

### Bug Fixes

* Formatting unclosed tag would be in wrong location. See [lsp4xml#269](https://github.com/angelozerr/lsp4xml/issues/269).
* Infinite loop when `<` was typed into an empty DTD file. See [lsp4xml#266](https://github.com/angelozerr/lsp4xml/issues/266).
* Formatting malformed xml removed content. See [#227](https://github.com/redhat-developer/vscode-xml/issues/227).
* Misplace diagnostic for cvc-elt.3.1. See [#241](https://github.com/redhat-developer/vscode-xml/issues/241).
* Adjust range for DTD validation errors. See [#88](https://github.com/redhat-developer/vscode-xml/issues/88).
* XML Schema completion prefix did not work in some cases. See [lsp4xml#214](https://github.com/angelozerr/lsp4xml/issues/214).
* Problems with npm run build-server on Windows. See [#86](https://github.com/redhat-developer/vscode-xml/issues/86).
* XML catalog support apparently not working. See [#78](https://github.com/redhat-developer/vscode-xml/issues/78).
* Formatting removes DOCTYPE's public declaration. See [lsp4xml#250](https://github.com/angelozerr/lsp4xml/issues/250).
* Adjust range error for internal DTD declaration. See [lsp4xml#225](https://github.com/angelozerr/lsp4xml/issues/225).
* Don't add sibling element when completion items is filled with grammar. See [lsp4xml#211](https://github.com/angelozerr/lsp4xml/issues/211).
* Validation needs additional `<uri>` catalog entry. See [lsp4xml#217](https://github.com/angelozerr/lsp4xml/issues/217).
* Support rootUri for XML catalog configuration. See [lsp4xml#206](https://github.com/angelozerr/lsp4xml/issues/206).
* CacheResourcesManager keeps trying to download unavailable resources. See [lsp4xml#201](https://github.com/angelozerr/lsp4xml/issues/201).



## 0.2.0 (November 8, 2018)

### Enhancements

* Prolog completion on first line, by typing: ```<?xml...``` . See [#85](https://github.com/angelozerr/lsp4xml/issues/85).
* Documentation on hover for schema defined attributes. See [#146](https://github.com/angelozerr/lsp4xml/issues/146).
* Faster schema loading. See [#159](https://github.com/angelozerr/lsp4xml/issues/159).
* Autocompletion for XSD's. See [#111](https://github.com/angelozerr/lsp4xml/issues/111).
* Expose server VM arguments in preferences (can configure proxy). See [#169](https://github.com/angelozerr/lsp4xml/issues/169).
* Auto closing tags preference handled with conflicting preference. See [#62](https://github.com/redhat-developer/vscode-xml/pull/62).
* Auto indentation when hitting enter inside an element. See [#52](https://github.com/redhat-developer/vscode-xml/issues/52).
* Document Link support added. See [#56](https://github.com/angelozerr/lsp4xml/issues/56).
* Support for XSL. See [#189](https://github.com/angelozerr/lsp4xml/issues/189).
* Support for completion requests from empty character. See [#112](https://github.com/angelozerr/lsp4xml/issues/112).

### Bug Fixes

* Formatting splitAttributes indentation fix. See [#59](https://github.com/redhat-developer/vscode-xml/issues/59).
* XML content fully preserved on format xml.format.joinContentLines. See [#152](https://github.com/angelozerr/lsp4xml/issues/152).
* Node completion was not working in nested elements. See [#66](https://github.com/redhat-developer/vscode-xml/issues/66).
* End tag completion on empty character. See [#23](https://github.com/redhat-developer/vscode-xml/issues/23).
* Formatting was removing DTD content. See [#198](https://github.com/angelozerr/lsp4xml/issues/198).
* Code action to insert attribute snippet was incorrect. See [#185](https://github.com/angelozerr/lsp4xml/issues/185).
* Completion for XSD was cached too aggressively. See [#194](https://github.com/angelozerr/lsp4xml/issues/194).
* Hover doesnt work when xs:annotation is declared in type. See [#182](https://github.com/angelozerr/lsp4xml/issues/182).
* Incomplete autocompletion for xsl documents. See [#165](https://github.com/angelozerr/lsp4xml/issues/165).
* Validation of non-empty nodes required to be empty shows misplaced diagnostics. See [#147](https://github.com/angelozerr/lsp4xml/issues/147).
* Validation of empty required node shows misplaced diagnostics. See [#145](https://github.com/angelozerr/lsp4xml/issues/145).
* File association should support relative path for systemId. See [#142](https://github.com/angelozerr/lsp4xml/issues/142).
* Code completion is sometimes "one off". See [#80](https://github.com/redhat-developer/vscode-xml/issues/80).
* DTD validation problems not refreshing correctly. See [#79](https://github.com/redhat-developer/vscode-xml/issues/79).
* No validation when referencing a schema in the same directory. See [#144](https://github.com/angelozerr/lsp4xml/issues/144)
