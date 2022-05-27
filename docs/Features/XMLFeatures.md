# XML Features

[vscode-xml](https://github.com/redhat-developer/vscode-xml) provides a number of notable features, with demos below.

## Formatting

To format an XML document, you can use the formatting shortcut `Ctrl + Shift + K`.

![Format XML](../images/Features/FormatXML.gif)

For more information on formatting capabilities, see [Formatting](../Formatting.md#formatting).

## Folding

XML tag folding is supported:

To collapse and expand a tag, press the arrow.

![Folding XML](../images/Features/FoldingXML.gif)

For more information on folding capabilities, see [Folding](../Folding.md#folding).

## XML Tag Auto Close

XML tag `auto-close` is supported:

Using `/` in an opening tag will auto close the tag.

![Auto Close Tag Slash](../images/Features/AutoCloseTagSlashXML.gif)

## Auto Rename Tag

Linked editing is supported, allowing for simultaneous changes an opening and closing tag pair.

To enable this feature, the setting `editor.linkedEditing` must be set to `true` in your `settings.json`.

![Linked Editing](../images/Features/LinkedEditingXML.gif)

## Jump to Start/End Tag

For quick navigation, you can use `Ctrl + Click` on a closing tag to jump to the corresponding opening tag.

![Jump To Opening Tag](../images/Features/JumpToOpeningTagXML.gif)

The same applies to jumping from an opening tag to the respective closing tag.

![Jump To Closing Tag](../images/Features/JumpToClosingTagXML.gif)

## Rename Tag

To rename a single tag and its corresponding opening/closing, highlight the tag and press `F2` or use the dropdown to select `Rename Symbol`.

![Rename Tag](../images/Features/RenameTagXML.gif)

## Tag Name Highlighting

When placing the cursor on an XML tag, the corresponding opening/closing tag will be highlighted.

![Highlight Corresponding XML](../images/Features/HighlightCorrespondingXML.gif)

## Symbols from Outline and Breadcrumbs

The `OUTLINE` dropdown under `EXPLORER` details the XML tags in the document and their children. The `Breadcrumbs` bar also shows the hierarchy of the tag that the cursor is on. Both features permit jumping to the tag(s) displayed.

![Symbol Outline XML](../images/Features/SymbolOutlineXML.gif)

## Snippet Generation

When starting a new XML document, `Ctrl` + `Space` lists different snippet options to set up the document.

![Generate XML Snippet](../images/Features/GenerateXMLSnippet.gif)

There are also a number of keywords that will be recognized as snippets and autocompleted. For example, typing `schema` will list schema related snippet options.

![Generate XML Schema Snippet](../images/Features/GenerateXMLSchemaSnippet.gif)

## Completion Support

### Basic completion

If an XML file is not associated to a bound grammar file, you can utilize XML completion which uses existing XML tag elements.

### Attribute value completion

For an XML tag attribute, there is autocompletion support for the attribute value. For example, for path completion, type `.` or `/`.

![Attribute Completion XML](../images/Features/AttributeCompletionXML.gif)

### Completion based on grammar

#### Completion based on XSD

When an XML file is associated with an XSD file, there is support for completion based on the tags, attribute names and values defined in the XML Schema/XSD file.

![Completion Based On XSD](../images/Features/CompletionBasedOnXSD.gif)

#### Completion based on DTD

When XML file is associated with a DTD file, completion based on tags, attributes name and value defined in the DTD file are supported.

![Completion Based On DTD](../images/Features/CompletionBasedOnDTD.gif)

## Jump to Grammar Definition

If an XML file is associated with an XSD file, there is support for jumping from the XML tag to the schema definition.

![Jump to XSD Def From XML](../images/Features/JumpToXSDDefFromXML.gif)

## Hover Support

### Hover based on grammar

#### Hover based on XSD

When XML file is associated with an XSD file, hover documentation based on tags, attributes name and value defined in the XML Schema/XSD file are supported.

![Hover Based On XSD](../images/Features/HoverBasedOnXSD.gif)

#### Hover based on DTD

When XML file is associated with a DTD file, hover documentation based on tags, attributes name and value defined in the DTD  file are supported.

![Hover Based On DTD](../images/Features/HoverBasedOnDTD.gif)

## Validation Support

### Syntax validation

LemMinX will show syntax errors in your XML documentation, and will provide quick fixes to resolve these errors.

![Validate XML](../images/Features/ValidationXML.gif)

There is also validation based on grammar when an XSD or DTD file is associated with the XML document.

### Read more

See [XML Validation](../Validation.md#xml-validation) for more details.

## Binding Grammar to an XML Document

For any XML document, should you need to bind a grammar or schema with the file, you can do so by either using an existing grammar file, or by generating one using the built-in schema generator.

See [Binding with Existing Grammar](../BindingWithGrammar.md#binding-with-existing-grammar) for info on binding to an existing schema.

See [Binding with New Grammar](../BindingWithGrammar.md#binding-with-new-grammar) for info on grammar generation.

## Selection Range

You can use `Alt + Shift + Right Arrow` to expand your selection range according to the structure of the XML document.

For instance, if you expand the selection range in an element with text content, it will first select all the text content, then the element.

This also works for other portions of an XML document, such as attributes and the DTD subset.

![Selection Range](../images/Features/SelectionRange.gif)

## CodeLens

CodeLens is supported for `.xml` files for a number of different features.

### CodeLens 'Bind to grammar/schema...'

If the current XML document is not bound to an existing grammar/schema, a CodeLens will appear above the root element, which will trigger the [XML Binding Wizard](../BindingWithGrammar.md#the-xml-binding-wizard).

![CodeLens Bind](../images/Features/CodeLensBind.png)

For more information on CodeLens capabilities, see [CodeLens](../CodeLens.md#code-lens).

## Custom Feature Implementation

You can implement your own feature with a [Java extension](../Extensions.md).
