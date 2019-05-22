# XML Language Support by Red Hat

[![Join the chat at https://gitter.im/redhat-developer/vscode-xml](https://badges.gitter.im/redhat-developer/vscode-xml.svg)](https://gitter.im/redhat-developer/vscode-xml?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Marketplace Version](https://vsmarketplacebadge.apphb.com/version/redhat.vscode-xml.svg "Current Release")](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-xml)

## Description

This VS Code extension provides support for creating and editing XML documents, based on the [LSP4XML language server](https://github.com/angelozerr/lsp4xml), running with Java.

![Basic features](https://user-images.githubusercontent.com/148698/45977901-df208a80-c018-11e8-85ec-71c70ba8a5ca.gif)

## Features

  * Syntax error reporting
  * General code completion 
  * Auto-close tags
  * Automatic node indentation
  * Symbol highlighting
  * Document folding
  * Document links
  * Document symbols and outline
  * Renaming support
  * Document Formatting
  * DTD validation
  * DTD completion
  * DTD formatting
  * XSD validation
  * XSD based hover
  * XSD based code completion 
  * XSL support
  * XML catalogs
  * File associations
  * Code actions
  * Schema Caching

See the [changelog](CHANGELOG.md) for the latest release. You might also find useful information in the project [Wiki](https://github.com/redhat-developer/vscode-xml/wiki).

## Requirements

  * Java JDK 8 or more recent
  * Ensure Java path is set in either: 
    * `java.home` in VSCode preferences
    * Environment variable `JAVA_HOME` or `JDK_HOME`  
    * **Note**: The path should end at the parent folder that contains the `bin` folder.  
      **Example Path**: `/usr/lib/jvm/java-1.8.0` if `bin` exists at `/usr/lib/jvm/java-1.8.0/bin`.

## Supported VS Code settings

The following settings are supported:

* `xml.trace.server` : Trace the communication between VS Code and the XML language server in the Output view.
* `xml.catalogs` : Register XML catalog files.
* `xml.logs.client` : Enable/disable logging to the Output view.
* `xml.fileAssociations` : Associate XML Schemas to XML file patterns.
* `xml.format.splitAttributes` : Set to `true` to split node attributes onto multiple lines during formatting. Defaults to `false`.
* `xml.format.joinCDATALines` : Set to `true` to join lines in CDATA content during formatting. Defaults to `false`.
* `xml.format.joinContentLines` : Set to `true` to join lines in node content during formatting. Defaults to `false`.
* `xml.format.joinCommentLines` : Set to `true` to join lines in comments during formatting. Defaults to `false`.
* `xml.format.enabled` : Enable/disable formatting.
* `xml.autoCloseTags.enabled` : Enable/disable automatic tag closing.  
  **Note** 'editor.autoClosingBrackets' must be turned off to work.  
* `xml.server.vmargs`: Extra VM arguments used to launch the XML Language Server. Requires VS Code restart.  
* `xml.validation.enabled`: Set to `false` to disable all validation. Defaults to `true`.
* `xml.validation.schema`: Set to `false` to disable schema validation. Defaults to `true`.
* `xml.validation.noGrammar`: The message severity when a document has no associated grammar. Defaults to `hint`.
* `xml.format.spaceBeforeEmptyCloseTag`: Set to `true` to insert space before the end of a self closing tag. Defaults to `true`.
* `xml.format.quotations`: Set to `doubleQuotes` to format and only use `"`, or `singleQuotes` to format and only use `'`. Defaults to `doubleQuotes`.
* `xml.format.preserveEmptyContent`: Set to `true` to preserve standalone whitespace content in an element. Defaults to `false`.
* `xml.server.workDir`: Set an absolute path for all cached schemas to be stored. Defaults to `~/.lsp4xml`.
  
Since 0.6.0:
* `xml.format.preservedNewLines`: Set the maximum amount of newlines between elements. Defaults to `2`.

More detailed info in the [Wiki](https://github.com/redhat-developer/vscode-xml/wiki/Preferences).

## Contributing

This is an open source project open to anyone. Contributions are extremely welcome!

For information on getting started, refer to the [CONTRIBUTING instructions](CONTRIBUTING.md).

CI builds can be installed manually by following these instructions:

  1) Download the latest development VSIX archive [from here](http://download.jboss.org/jbosstools/vscode-xml/staging/?C=M;O=D). `(vscode-xml-XXX.vsix)`

  2) Go to the Extensions section in VSCode.

  3) At the top right click the `...` icon.

  4) Select 'Install from VSIX...' and choose the visx file.

Feedback
===============
* File a bug in [GitHub Issues](https://github.com/redhat-developer/vscode-xml/issues),
* Chat with us on [Gitter](https://gitter.im/redhat-developer/vscode-xml),


## License

  EPL 1.0, See [LICENSE](https://github.com/redhat-developer/vscode-xml/blob/master/LICENSE) file.


