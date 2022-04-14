## Formatting

### xml.format.enabled

  Set to `false` to disable XML formatting. Defaults to `true`.

***

### xml.format.experimental

  Set to `true` to enable experimental formatter. Defaults to `false`.

  As we have more and more issues with our current XML formatter, we  have decided to redo our formatter to try to fix them. This new formatter is in experimental state because it doesn't support all current formatter settings and it could have some bugs. To enable this experimental formatter you can set the setting `xml.format.experimental` to true. 
  
  Once we have enough good feedback and we support all current formatting settings, we will replace the current formatter with the experimental formatter. Don't hesitate to [create issues](https://github.com/redhat-developer/vscode-xml/issues) to give us feedback with this experimental formatter.
  
  The current formatter uses the DOM document and rewrite the XML document or a fragment of XML (when range formatting is processed). This strategy provides a lot of bugs if XML is not valid (ex : <% will format with <null).
  
  The new strategy is to format the current XML by adding or removing some spaces without updating the XML content. The experimental formatter categorizes each element as :
  
  * `ignore space`
  *  `normalize space`
  *  `mixed content` 
  * and `preserve space`. Also, you can use `xml:space="preserve"` to preserve spaces in some elements or use `xml.format.preserveSpace` to add a given tag element which must preserve spaces.
  
Once the element is categorized, the element content is formatted according the category:

 * `ignore space` : 

```xml
<foo>
                <bar></bar>         </foo>
```

Here `foo` is categorized as `ignore space`, because all children are tag elements and only spaces. it means that it removes all spaces . After formatting you should see this result:

```xml
<foo>
    <bar></bar>
</foo>
```

 * `normalize space` : 
 
```xml
<foo>
  abc 
  def
</foo>
```

Here `foo` is categorized as `normalize space`, it means that it removes all spaces with one space. After formatting you should see this result:

```xml
<foo> abc def </foo>
```

 * `preserve space`
 
If you want to preserve space, you can use `xml:space="preserve"` to preserve spaces in some elements or use `xml.format.preserveSpace`

```xml
<foo xml:space="preserve" >
  abc 
  def
</foo>
```

Here `foo` is categorized as `preserve space`, after formatting you should see this result:

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

Here `foo` is categorized as `mixed content` (it contains text and tag element), it means that it removes all spaces with one space. After formatting you should see this result:

```xml
<foo>
    <bar></bar> abc def </foo>
```

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

**Not supported by the experimental formatter.**

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

**Not supported by the experimental formatter.**

***

### xml.format.preserveAttributeLineBreaks

Preserve line breaks that appear before and after attributes. This setting is overridden if [xml.format.splitAttributes](#xmlformatsplitattributes) is set to `true`. Default is `false`.

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

**Not supported by the experimental formatter.**

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

**Not supported by the experimental formatter.**
  
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
***

**Not supported by the experimental formatter.**

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

**Not supported by the experimental formatter.**

***

### xml.format.joinContentLines

Normalize the whitespace of content inside an element. Newlines and excess whitespace are removed. Default is `false`.

For example, the following document doesn't change if it is set to `false`:

  ```xml
  <?xml version='1.0' encoding='UTF-8'?>
  <root>
    Interesting text      content



    values     and     1234 numbers

  </root>
  ```

If it is set to `true`, the above document becomes:

  ```xml
  <?xml version='1.0' encoding='UTF-8'?>
  <root>Interesting text content values and 1234 numbers</root>
  ```

**Not supported by the experimental formatter.**

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

**Not supported by the experimental formatter.**

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

  Set to `true` to trim final newlines at the end of the document.  Defaults to `false`
  ```xml
  <a><a/>




  ```
  becomes...
  ```xml
  <a><a/>
  ```

***
### xml.format.xsiSchemaLocationSplit

  Used to configure how to format the content of `xsi:schemaLocation`.

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

**Not supported by the experimental formatter.**

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

**Not supported by the experimental formatter.**

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

This settings is only available with experimental formatter.

### xml.format.maxLineWidth

Max line width. Default is `80`.

This settings is only available with experimental formatter.

### xml.format.grammarAwareFormatting

Use Schema/DTD grammar information while formatting. Default is `true`. 

This settings is only available with experimental formatter.