# Symbols

## Show Referenced Grammars

If `xml.symbols.showReferencedGrammars` is enabled, the referenced grammars will be listed in the document outline.
The following are also listed:
 * The association method for each grammar
 * If the grammar is in the cache. Remote grammars are cached by default. Please refer to the [server cache path documentation](Preferences.md#server-cache-path) for more information.

![An XML document that references two grammars. The referenced grammars are listed in the outline](./images/Symbols/ShowReferencedGrammars.png)

This option has no effect if symbols are disabled through `xml.symbols.enabled`.
The displayed symbols are affected by `xml.symbols.maxItemsComputed`