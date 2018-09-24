# VSCode XML Client

## Description

  This VSCode extension provides support and editing during the creation of XML documents.


## Features

  * Symbol Highlighting
  * General Code Completion 
  * Document Folding
  * Symbols and Renaming
  * Syntax Error Reporting
  * XML Schema Validation
  * Document Formatting
  * Schema Based Hover
  * Schema Based Code Completion 

## How to Install

  1) Download latest development VSIX [from here](http://download.jboss.org/jbosstools/vscode-xml/staging/?C=M;O=D). `(vscode-xml-XXX.vsix)`

  2) Go to Extensions section in VSCode.

  3) At the top right click the 3 dots.

  4) Select 'Install from VSIX...' and choose the VSIX file.

## Requirements

  * Java 8+

  * Ensure Java path is set in either: 
  
    * `java.home` in VSCode preferences
    * Environment variable `JAVA_HOME` or `JDK_HOME`

## Language Server for XML

  The Language Server for this client can be [found here](https://github.com/angelozerr/lsp4xml).

## Supported VS Code settings

The following settings are supported:

* `xml.trace.server` : Trace the communication between VS Code and the XML language server in the Output view.
* `xml.catalogs` : Register XML catalog files.
* `xml.logs.client` : Enable/disable logging to the Output view.
* `xml.fileAssociations` : Associate XML Schemas to XML file patterns.
* `xml.format.splitAttributes` : Set to true to split node attributes onto multiple lines during formatting. Defaults to false.
* `xml.format.joinCDATALines` : Set to true to join lines in CDATA content during formatting. Defaults to false.
* `xml.format.joinContentLines` : Set to true to join lines in node content during formatting. Defaults to false.
* `xml.format.joinCommentLines` : Set to true to join lines in comments during formatting. Defaults to false.
* `xml.format.enabled` : Enable/disable formatting.
* `xml.autoCloseTags.enabled` : Set to true to enable/disable automatic closing tags.  
  **Note** 'editor.autoClosingBrackets' must be turned off to work

## Contributing

This is an open source project open to anyone. Contributions are extremely welcome!

For information on getting started, refer to the [CONTRIBUTING instructions](CONTRIBUTING.md).

## License

  EPL 1.0, See [LICENSE](https://github.com/redhat-developer/vscode-xml/blob/readme/LICENSE) file.


