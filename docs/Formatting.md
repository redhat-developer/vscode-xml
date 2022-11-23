## Formatting

### Formatting strategy

  As the frequency of issues regarding the previous XML formatter increased, we have decided to redo our formatter from scratch. To revert to the old formatter, the setting `xml.format.legacy` should be set to true.

  The old formatter uses the DOM document to rewrite the XML document, or simply a fragment of XML (when range formatting is processed). *Note*: This strategy provides a lot of bugs if XML is not valid (ex : `<%` will format with `<null`).

  The new strategy used by the formatter formats the current XML by adding or removing some spaces without updating the XML content. The formatter categorizes each element as:

  * `ignore space`
  * `normalize space`
  * `mixed content`
  * `preserve space`. (You can use `xml:space="preserve"` to preserve spaces in some elements or use `xml.format.preserveSpace` to add a given tag element which must preserve spaces.)

Once the element is categorized, the element content is formatted according the category:

  * `ignore space` :

```xml
<foo>
                <bar></bar>         </foo>
```

Here `foo` is categorized as `ignore space`, because all children of `foo` are tag elements and single spaces. All single spaces are removed. After formatting, you should see this result:

```xml
<foo>
    <bar></bar>
</foo>
```

 * `normalize space` :

```xml
<foo>
      abc    def
  ghi
</foo>
```

Here `foo` is categorized as `normalize space` since it only contains text content, it means that it replaces all spaces on the same line with a single space while respecting existing line breaks. After formatting, you should see this result:

```xml
<foo>
  abc def
  ghi
</foo>
```

 * `preserve space`

If you want to preserve space, you can use `xml:space="preserve"` to preserve spaces in some elements or use the [`xml.format.preserveSpace`](#xmlformatpreservespace) setting.

```xml
<foo xml:space="preserve" >
     abc
 def
</foo>
```

Here `foo` is categorized as `preserve space`. After formatting, you should see this result:

```xml
<foo xml:space="preserve" >
     abc
 def
</foo>
```

 * `mixed content`

```xml
<foo>
    <bar></bar>
    abc
    def
</foo>
```

Here `foo` is categorized as `mixed content`, since it contains text and tag element. All single spaces are removed between text content. After formatting, you should see this result:

```xml
<foo>
    <bar></bar> abc def </foo>
```

***

### xml.format.enabled

  Set to `false` to disable XML formatting. Defaults to `true`.

***

### xml.format.legacy

  Set to `true` to enable legacy formatter. Defaults to `false`.

  Any setting unsupported by the legacy formatter will be marked with **Not supported by the legacy formatter** in this document and in the settings, while settings exclusive to the legacy formatter will be marked with **This setting is only available with legacy formatter**.

***

### xml.format.emptyElements

Expand/collapse empty elements. Available values are `ignore`, `collapse` and `expand`. Defaults to `ignore`.
An empty element is an element which is empty or which contains only white spaces.

Set to `collapse` to collapse empty elements during formatting.

  ```xml
  <example attr="value" ></example>
  ```
  becomes...
  ```xml
    <example attr="value" />
  ```

Set to `expand` to expand empty elements during formatting.

  ```xml
  <example attr="value" />
  ```
  becomes...
  ```xml
   <example attr="value" ></example>
  ```
***

### xml.format.enforceQuoteStyle

Enforce `preferred` quote style (set by `xml.preferences.quoteStyle`) or `ignore` quote style when formatting.

For instance, when set to `preferred` with `xml.preferences.quoteStyle` set to `single`, the following document:

  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <root>
    <child attribute='value' otherAttribute="otherValue"></child>
  </root>
  ```

will be formatted to:

  ```xml
  <?xml version='1.0' encoding='UTF-8'?>
  <root>
    <child attribute='value' otherAttribute='otherValue'></child>
  </root>
  ```

No changes to quotes will occur during formatting if `xml.format.enforceQuoteStyle` is set to `ignore`.

***

### xml.format.preserveAttributeLineBreaks

Preserve line breaks that appear before and after attributes. This setting is overridden if [xml.format.splitAttributes](#xmlformatsplitattributes) is set to `true`. Default is `true`.

If set to `true`, formatting does not change the following document:

  ```xml
  <?xml version='1.0' encoding='UTF-8'?>
  <root>
    <child
      attr1='value1'
      attr2='value2'
      attr3='value3'></child>
  </root>
  ```

If set to `false`, the document above becomes:

  ```xml
  <?xml version='1.0' encoding='UTF-8'?>
  <root>
    <child attr1='value1' attr2='value2' attr3='value3'></child>
  </root>
  ```

***

### xml.format.preservedNewlines

The number of blank lines to leave between tags during formatting.

The default is 2. This means that if more than two consecutive empty lines are left in a document, then the number of blank lines will become 2.

Any number of new lines present that is less than the set number will also be preserved. In other words, if there is 1 new line between tags while `xml.format.preservedNewlines` is set to 2, the single new line will be preserved.

  For example, this document:
  ```xml
  <?xml version="1.0" encoding="UTF-8"?>



  <root>



    <child></child>

  </root>
  ```

  Will be replaced with:
  ```xml
  <?xml version="1.0" encoding="UTF-8"?>


  <root>


    <child></child>

  </root>
  ```

If this value is set to 0, then all blank lines will be removed during formatting.

  For example, this document:
  ```xml
  <?xml version="1.0" encoding="UTF-8"?>

  <root>

    <child></child>

  </root>
  ```

  Will be replaced with:
  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <root>
    <child></child>
  </root>
  ```

***

### xml.format.splitAttributes

  Set to `true` to split node attributes onto multiple lines during formatting. Defaults to `false`.
  Overrides the behaviour of [xml.format.preserveAttributeLineBreaks](#xmlformatpreserveattributelinebreaks).
  Please see [xml.format.splitAttributesIndentSize](#xmlformatsplitAttributesIndentSize) for information on configuring the indentation level of the attributes.

  ```xml
  <project a="1" b="2" c="3"></project>
  ```
  becomes...
  ```xml
  <project
      a="1"
      b="2"
      c="3"></project>
  ```

***

### xml.format.joinCDATALines

  Set to `true` to join lines in CDATA content during formatting. Defaults to `false`.
  ```xml
  <![CDATA[This
  is
  a
  test
  ]]>
  ```
  becomes...
  ```xml
  <![CDATA[This is a test ]]>
  ```

***

### xml.format.preserveEmptyContent

  Set to `true` to preserve empty whitespace content.
  ```xml
  <project>    </project>

  <a> </a>
  ```
  becomes...
  ```xml
  <project>    </project>
  <a> </a>
  ```

**This setting is only available with legacy formatter.**

***

### xml.format.joinCommentLines

  Set to `true` to join lines in comments during formatting. Defaults to `false`.
  ```xml
  <!-- This
  is
  my

  comment -->
  ```
  becomes...
  ```xml
  <!-- This is my comment -->
  ```

***

### xml.format.joinContentLines

Set to `true` to normalize the whitespace of content inside an element. Newlines and excess whitespace are removed. Default is `false`.

When `xml.format.joinContentLines` is set to `false`, the following edits will be made:

* text following a line separator will be appropriately indented (not applied to cases where the element is categorized as `mixed content`)
  * Please see [xml.format.experimental](#xmlformatexperimental) for more information on mixed content
* spaces between text in the same line will be normalized
* any exisiting new lines will be treated with respect to the [`xml.format.preservedNewlines`](#xmlformatpreservednewlines) setting

For example, before formatting:

  ```xml
  <?xml version='1.0' encoding='UTF-8'?>
  <root>
  <a>
  Interesting 

              text content
      </a> values and 

  1234 numbers </root>
  ```

After formatting with `xml.format.joinContentLines` is set to `false` and `xml.format.preservedNewlines` set to `2`:

  ```xml
  <?xml version='1.0' encoding='UTF-8'?>
  <root>
      <a>
          Interesting

          text content
      </a> values and 1234 numbers </root>
  ```

To remove all empty new lines, set `xml.format.preservedNewlines` to `0` for the following result:

After formatting with `xml.format.joinContentLines` is set to `false` and `xml.format.preservedNewlines` set to `0`:

  ```xml
  <?xml version='1.0' encoding='UTF-8'?>
  <root>
      <a>
          Interesting
          text content
      </a> values and 1234 numbers </root>
  ```

If `xml.format.joinContentLines` is set to `true`, the above document becomes:

  ```xml
  <?xml version='1.0' encoding='UTF-8'?>
  <root>
      <a> Interesting text content </a> values and 1234 numbers </root>
  ```

* line breaks will be inserted where needed with respect to the [`xml.format.maxLineWidth`](#xmlformatmaxlinewidth) setting

***

### xml.format.spaceBeforeEmptyCloseTag

  Set to `true` to insert a space before the end of self closing tags.  Defaults to `true`
  ```xml
  <tag/>
  ```
  becomes...
  ```xml
  <tag />
  ```

***

### files.insertFinalNewline

  Set to `true` to insert a final newline at the end of the document.  Defaults to `false`
  ```xml
  <a><a/>
  ```
  becomes...
  ```xml
  <a><a/>


  ```

***

### files.trimFinalNewlines

  Set to `true` to trim final newlines at the end of the document. This setting is overridden if `files.insertFinalNewline` is set to `true`. Defaults to `false`
  ```xml
  <a><a/>




  ```
  becomes...
  ```xml
  <a><a/>
  ```

***

### files.trimTrailingWhitespace

  Set to `true` to trim trailing whitespace.  Defaults to `false`

  ```xml
  <a><a/> [space][space]
  [space][space]
  text content [space][space]
  ```

  becomes...

  ```xml
  <a><a/>

  text content
  ```

***

### xml.format.xsiSchemaLocationSplit

  Used to configure how to format the content of `xsi:schemaLocation`.  Defaults to `onPair`

  To explain the different settings, we will use this xml document as an example:
  ```xml
  <ROOT:root
    xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'
    xmlns:ROOT='http://example.org/schema/root'
    xmlns:BISON='http://example.org/schema/bison'
    xsi:schemaLocation='http://example.org/schema/root root.xsd http://example.org/schema/bison bison.xsd'>
  <BISON:bison
      name='Simon'
      weight='20' />
  </ROOT:root>
  ```
  Note that it references two different external schemas. Additionally, the setting [`xml.format.splitAttributes`](#xmlformatsplitattributes) will be set to true for the formatted examples in order to make the formatted result easier to see.

  * When it is set to `none`, the formatter does not change the content of `xsi:schemaLocation`. The above file would not change after formatting.

  * When it is set to `onPair`, the formatter groups the content into pairs of namespace and URI, and inserts a new line after each pair. Assuming the other formatting settings are left at their default, the above file would look like this:
    ```xml
    <ROOT:root
        xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'
        xmlns:ROOT='http://example.org/schema/root'
        xmlns:BISON='http://example.org/schema/bison'
        xsi:schemaLocation='http://example.org/schema/root root.xsd
                            http://example.org/schema/bison bison.xsd'>
      <BISON:bison
          name='Simon'
          weight='20' />
    </ROOT:root>
    ```

  * When it is set to `onElement`, the formatter inserts a new line after each namespace and each URI.
    ```xml
    <ROOT:root
        xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'
        xmlns:ROOT='http://example.org/schema/root'
        xmlns:BISON='http://example.org/schema/bison'
        xsi:schemaLocation='http://example.org/schema/root
                            root.xsd
                            http://example.org/schema/bison
                            bison.xsd'>
      <BISON:bison
          name='Simon'
          weight='20' />
    </ROOT:root>
    ```

***

### xml.format.splitAttributesIndentSize

  Use to configure how many levels to indent the attributes by when [xml.format.splitAttributes](#xmlformatsplitAttributes) is set to `true`.

  Here are some examples. For these examples, an indentation is two spaces.

  `xml.format.splitAttributesIndentSize = 2` (default)

  ```xml
  <robot attribute1="value1" attribute2="value2" attribute3="value3">
    <child />
    <child />
  </robot>
  ```
  becomes
  ```xml
  <robot
      attribute1="value1"
      attribute2="value2"
      attribute3="value3">
    <child />
    <child />
  </robot>
  ```

  `xml.format.splitAttributesIndentSize = 1`

  ```xml
  <robot attribute1="value1" attribute2="value2" attribute3="value3">
    <child />
    <child />
  </robot>
  ```
  becomes
  ```xml
  <robot
    attribute1="value1"
    attribute2="value2"
    attribute3="value3">
    <child />
    <child />
  </robot>
  ```

  `xml.format.splitAttributesIndentSize = 3`

  ```xml
  <robot attribute1="value1" attribute2="value2" attribute3="value3">
    <child />
    <child />
  </robot>
  ```
  becomes
  ```xml
  <robot
        attribute1="value1"
        attribute2="value2"
        attribute3="value3">
    <child />
    <child />
  </robot>
  ```
***

### xml.format.closingBracketNewLine

If set to `true`, the closing bracket (`>` or `/>`) of a tag with at least 2 attributes will be put on a new line.

The closing bracket will have the same indentation as the attributes (if any), following the indent level defined by [splitAttributesIndentSize](#xmlformatsplitattributesindentsize).

Requires [splitAttributes](#xmlformatsplitattributes) to be set to `true`.

Defaults to `false`.

```xml
<a b="" c="" />
```

becomes
```xml
<a
  b=""
  c=""
  />
```

### xml.format.preserveSpace

Element names for which spaces will be preserved. Defaults is the following array:

```json
[
  "xsl:text",
  "xsl:comment",
  "xsl:processing-instruction",
  "literallayout",
  "programlisting",
  "screen",
  "synopsis",
  "pre",
  "xd:pre"
]
```

**Not supported by the legacy formatter.**

### xml.format.maxLineWidth

Max line width. Set to `0` to disable this setting. Default is `100`.

**Not supported by the legacy formatter.**

### xml.format.grammarAwareFormatting

Use Schema/DTD grammar information while formatting. Default is `true`.

When this is set to true, the following features are supported:

*1. The element content category will be dependent on the type of the element defined in the schema.*

If an element is of type string (xs:string) as defined in the schema, it will be categorized as `preserve space`.

If an element can contain both text and element as defined in the schema, it will be categorized as `mixed content`.

In this example, `description` is defined as a string type in the schema, while `description2` is of some other type.

```xml
  <description>a    b     c</description>
  <description2>a    b     c</description2>
```

After formatting, you should see that the content of `description` has spaces preserved, while the spaces in `description2` has been normalized.

```xml
  <description>a    b     c</description>
  <description2>a b c</description2>
```

*2. The xml.format.emptyElements setting will respect grammar constraints.*

The collapse option will now respect XSD's `nillable="false"` definitions. The collapse on the element will not be done if the element has `nillable="false"` in the XSD and `xsi:nil="true"` in the XML.

**Not supported by the legacy formatter.**