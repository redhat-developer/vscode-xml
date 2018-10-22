# Change Log


## 0.0.2 (November 8, 2018)

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