# Symbols

## xml.symbols.maxItemsComputed

Use `xml.symbols.maxItemsComputed` to limit the number of symbols that are computed for each XML document.
This helps to prevent cases where the extension runs out of memory on large documents.
This limit can also improve performance on large documents.

The default limit is 5000.
If the limit is set to 0, no symbols are computed.
If the limit is set to a negative number, all the symbols will be computed.

If `xml.symbols.showReferencedGrammars` is enabled, the referenced grammar symbols are included in the count.
If symbols are disabled, this setting has no effect.

## xml.symbols.showReferencedGrammars

If `xml.symbols.showReferencedGrammars` is enabled, the referenced grammars will be listed in the document outline.
The following are also listed:
 * The association method for each grammar
 * If the grammar is in the cache. Remote grammars are cached by default. Please refer to the [server cache path documentation](Preferences.md#server-cache-path) for more information.

![An XML document that references two grammars. The referenced grammars are listed in the outline](./images/Symbols/ShowReferencedGrammars.png)

This option has no effect if symbols are disabled through `xml.symbols.enabled`.
The displayed symbols are affected by `xml.symbols.maxItemsComputed`
