## Formatting

### Indentation

The standard `editor.insertSpaces` & `editor.tabSize` [format settings](https://code.visualstudio.com/docs/editor/codebasics#_indentation) are used for configuring spaces/tabs and their size. To indent XML differently, using language specific settings, add this to your `settings.json`:

```json
"[xml]": {
  "editor.defaultFormatter": "redhat.vscode-xml",
  "editor.tabSize": 2
},
```

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

The mixed content behavior can be configured with [`xml.format.mixedContent`](#xmlformatmixedcontent) and [`xml.format.blockElements`](#xmlformatblockelements).

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

Preserve line breaks that appear before and after attributes. This setting is overridden if [xml.format.splitAttributes](#xmlformatsplitattributes) is set to `splitNewLine` or `alignWithFirstAttr`. Default is `true`.

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

  Set to `splitNewLine` to split node attributes onto multiple lines during formatting and set to `alignWithFirstAttr` to split node attributes after the first attribute to align with it.

  Available values are `preserve`, `splitNewLine`, and `alignWithFirstAttr`. Defaults to `preserve`.

  Overrides the behaviour of [xml.format.preserveAttributeLineBreaks](#xmlformatpreserveattributelinebreaks).

  Please see [xml.format.splitAttributesIndentSize](#xmlformatsplitAttributesIndentSize) for information on configuring the indentation level of the attributes in the case of `splitNewLine`.

  The following xml:
  ```xml
  <project a="1" b="2" c="3"></project>
  ```

  Remains the same when set to `preserve`.

  When set to `splitNewLine`, becomes:
  ```xml
  <project
      a="1"
      b="2"
      c="3"></project>
  ```

  When set to `alignWithFirstAttr`, becomes:
  ```xml
  <project a="1"
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
  Note that it references two different external schemas. Additionally, the setting [`xml.format.splitAttributes`](#xmlformatsplitattributes) will be set to `splitNewLine` for the formatted examples in order to make the formatted result easier to see.

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

  Use to configure how many levels to indent the attributes by when [xml.format.splitAttributes](#xmlformatsplitAttributes) is set to `splitNewLine`.

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

Requires [splitAttributes](#xmlformatsplitattributes) to be set to `splitNewLine` or `alignWithFirstAttr`.

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

This setting affects the following formatting behaviors:

* **`normalize space` elements** — when text content exceeds the max line width, it wraps to a new line at word boundaries.
* **`xml.format.mixedContent` = `reflow`** — mixed content (text + child elements) soft-wraps at word and element boundaries when the line exceeds the max width. See [`xml.format.mixedContent`](#xmlformatmixedcontent) for details.
* **`xml.format.splitAttributes` = `preserve`** — when the start tag (element name + attributes) exceeds the max line width, attributes are moved to a new line.

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

### xml.format.mixedContent

Controls how mixed content (text + child elements) is formatted. Available values are `normalize`, `reflow`, `expand`, and `preserve`. Default is `normalize`.

#### `normalize` (default)

Collapse inline whitespace to a single space. Newlines within text nodes are collapsed to spaces. This is the backward-compatible default behavior. Note that [`xml.format.blockElements`](#xmlformatblockelements) has no effect in this mode — use `reflow` for block/inline element distinction.

```xml
<p>text   <b>bold</b>   more</p>
```
becomes:
```xml
<p>text <b>bold</b> more</p>
```

Newlines within text nodes are also collapsed:

```xml
<p>text
  <b>bold</b>
  more</p>
```
becomes:
```xml
<p>text <b>bold</b> more</p>
```

However, line breaks in whitespace-only gaps between sibling elements are preserved (with normalized indentation):

```xml
<root>
  <a>aaa</a>
  <b>bbb</b>
</root>
```
stays unchanged — the line breaks between `<a>` and `<b>` are not collapsed because they are whitespace-only gaps between elements, not text content.

#### `reflow`

Collapse inline whitespace to a single space, but **preserve newlines within text nodes** (unlike `normalize` which collapses them to spaces). When [`xml.format.maxLineWidth`](#xmlformatmaxlinewidth) is set, content **soft-wraps** at word and element boundaries when the line exceeds the available width.

```xml
<!-- Inline spaces collapsed -->
<p>text   <b>bold</b>   more</p>
```
becomes:
```xml
<p>text <b>bold</b> more</p>
```

```xml
<!-- Existing newline before end tag is preserved -->
<line>Foo (ref <b>bar</b>)
</line>
```
stays unchanged — the newline before `</line>` is not collapsed.

**Soft-wrap with `maxLineWidth`:**

If the content fits on one line, it stays flat:
```xml
<p>text <b>bold</b> more</p>
```

If it overflows `maxLineWidth`, content soft-wraps at the overflow point. Consider this input with `<b>` and `<div>` elements:

```xml
<p> Click <b>here</b> to see the <div>important details</div> and then <b>submit</b> the final <div>report</div> for review. </p>
```

By default (`blockElements` not set), all elements are inline. With `maxLineWidth` = `80`, content wraps at the overflow point:

```xml
<p> Click <b>here</b> to see the <div>important details</div> and then
  <b>submit</b> the final <div>report</div> for review.
</p>
```

Both `<b>` and `<div>` stay inline — they only move to a new line when they would exceed the line width.

With [`xml.format.blockElements`](#xmlformatblockelements) set to `["div"]`, `<div>` is a **block element** — it always starts on its own line, and text after it also starts on a new line. `<b>` stays inline (not listed):

```xml
<p> Click <b>here</b> to see the
  <div>important details</div>
  and then <b>submit</b> the final
  <div>report</div>
  for review.
</p>
```

With `blockElements` set to `["b", "div"]` (all elements are block), every element goes on its own line:

```xml
<p> Click
  <b>here</b>
  to see the
  <div>important details</div>
  and then
  <b>submit</b>
  the final
  <div>report</div>
  for review.
</p>
```

**MyBatis example** — `reflow` with `maxLineWidth` = `80`:

```xml
<update id="updateEmp"> update emp <set><if test="name != null">name=#{name},</if><if test="gender != null">gender=#{gender},</if></set> where id=#{id} </update>
```
becomes:
```xml
<update id="updateEmp"> update emp
  <set>
    <if test="name != null">name=#{name},</if>
    <if test="gender != null">gender=#{gender},</if>
  </set> where id=#{id}
</update>
```

Text-only elements like `<if>` have their content joined on one line. The `<set>` block is moved to its own line when it overflows the available width.

**How `maxLineWidth` affects wrapping:**

The `reflow` mode depends on `maxLineWidth` to decide where to wrap. Different values produce different results. Consider this input:

```xml
<root><bbbbbb>c<g>hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh</g><g>kkkkkkkkk</g></bbbbbb></root>
```

With `maxLineWidth` = `100`, the first `<g>` fits on the same line as `c`:

```xml
<root>
  <bbbbbb>c <g>hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh</g>
    <g>kkkkkkkkk</g>
  </bbbbbb>
</root>
```

With `maxLineWidth` = `80`, the first `<g>` exceeds the width and wraps to a new line:

```xml
<root>
  <bbbbbb>c
    <g>hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh</g>
    <g>kkkkkkkkk</g>
  </bbbbbb>
</root>
```

#### `expand`

Like `reflow` (whitespace normalization, text node newlines preserved), but each mixed content child is **always** put on its own line. Unlike `reflow`, `expand` does not depend on `maxLineWidth` — it always expands mixed content children to their own lines:

```xml
<p>text <b>bold</b> more</p>
```
always becomes:
```xml
<p>
  text
  <b>bold</b>
  more
</p>
```

This is useful when you always want expanded mixed content without configuring `maxLineWidth`:
```xml
<root><bbbbbb>c<g>hhhhhhhhhhhh</g><g>kkkkkkkkk</g></bbbbbb></root>
```
becomes:
```xml
<root>
  <bbbbbb>
    c
    <g>hhhhhhhhhhhh</g>
    <g>kkkkkkkkk</g>
  </bbbbbb>
</root>
```

**MyBatis example** — `expand`:

```xml
<update id="updateEmp"> update emp <set><if test="name != null">name=#{name},</if><if test="gender != null">gender=#{gender},</if></set> where id=#{id} </update>
```
becomes:
```xml
<update id="updateEmp">
  update emp
  <set>
    <if test="name != null">name=#{name},</if>
    <if test="gender != null">gender=#{gender},</if>
  </set>
  where id=#{id}
</update>
```

#### `preserve`

Don't reformat mixed content at all. Whitespace and line breaks are kept as-is:

```xml
<p>text   <b>bold</b>   more</p>
```
stays unchanged.

#### Notes

The [`xml.format.preserveSpace`](#xmlformatpreservespace) setting takes priority over `xml.format.mixedContent`. If an element is listed in `preserveSpace`, its content is always preserved regardless of the `mixedContent` setting.

**Not supported by the legacy formatter.**

***

### xml.format.blockElements

Element names to treat as block in mixed content. Default is `[]` (empty — no block elements).

This setting controls which child elements get their own line (block) and which stay on the same line as surrounding text (inline). Since XML is not HTML, there is no universal list of "block" elements — element names are specific to each XML vocabulary (XHTML, MyBatis, DocBook, etc.), so no default list is provided.

The two possible configurations:

* **`[]` (default)** — No elements are block. All elements stay inline with surrounding text, and only move to a new line when they overflow `maxLineWidth`. This is the backward-compatible behavior.

* **`["div", "section"]` (explicit list)** — Listed elements are block (always on their own line with indentation). All other elements stay inline. Use this for prose XML where you know which elements are structural blocks.

For example, with this input containing `<b>` (inline) and `<div>` (block) elements:

  ```xml
  <p> Click <b>here</b> to see the <div>important details</div> and then <b>submit</b> the final <div>report</div> for review. </p>
  ```

  With `blockElements` set to `["div"]` and `maxLineWidth` set to `80`, `<div>` is block but `<b>` stays inline (not listed):
  ```xml
  <p> Click <b>here</b> to see the
    <div>important details</div>
    and then <b>submit</b> the final
    <div>report</div>
    for review.
  </p>
  ```

Here `<div>` gets its own line (it is in the list), while `<b>` stays inline (it is not in the list). Text after a block element also starts on a new line.

#### Interaction with `xml.format.mixedContent`

`blockElements` only works with `reflow` mode:

* **Block elements** (listed) always start on their own line with indentation, regardless of `maxLineWidth`. Text following a block element also starts on a new line.

* **Inline elements** (not listed) stay on the same line as surrounding text. When `maxLineWidth` is set, they soft-wrap to a new line only when the element would exceed the available line width.

* With `normalize` (default): `blockElements` has no effect — newlines within text nodes are collapsed.

* With `expand`: all elements are expanded (each on its own line), regardless of `blockElements`.

* With `preserve`: `blockElements` has no effect — all content is kept as-is.

**Not supported by the legacy formatter.**

***

### @formatter:off / @formatter:on

You can disable formatting for specific sections of an XML document by surrounding them with `@formatter:off` and `@formatter:on` comments:

  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <root>
    <!-- @formatter:off -->
    <keep>
      <this    exactly="as"
        is />
    </keep>
    <!-- @formatter:on -->
    <format>
      <this />
    </format>
  </root>
  ```

After formatting, the content between `<!-- @formatter:off -->` and `<!-- @formatter:on -->` is preserved as-is, while the rest of the document is formatted normally.

You can also use the `Surround with @formatter:off/@formatter:on` command to quickly wrap selected content with these comments. Select the XML content you want to protect from formatting, then use the command palette or context menu to surround it.

**Not supported by the legacy formatter.**
