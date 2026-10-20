# Writing Documentation for Hover Tooltips

LemMinX renders documentation from XSD (`xs:documentation`), DTD (comments), and other grammar sources as **Markdown** in hover tooltips and completion details. HTML content in the documentation is automatically converted to Markdown.

This page describes what HTML formatting is supported and how to write documentation that renders well in hover tooltips.

## CDATA vs Entity Escaping

To include HTML tags as documentation text in `xs:documentation`, you must either wrap the content in `<![CDATA[...]]>` or escape the angle brackets with entities. Without one of these approaches, the XML parser treats tags like `<b>`, `<br/>`, or `<table>` as XML elements rather than documentation content — they become part of the document structure instead of being passed to the hover renderer.

### Using CDATA (recommended for complex HTML)

Given this XSD:

```xml
<xs:element name="server">
    <xs:annotation>
        <xs:documentation><![CDATA[
            <p>Configures the <b>server</b> connection.</p>
            <br/>
            <p>See <a href="https://example.com">documentation</a>.</p>
        ]]></xs:documentation>
    </xs:annotation>
</xs:element>
```

### Using entity escaping (for simple inline HTML)

Given this XSD:

```xml
<xs:element name="server">
    <xs:annotation>
        <xs:documentation>
            Configures the &lt;b&gt;server&lt;/b&gt; connection.
        </xs:documentation>
    </xs:annotation>
</xs:element>
```

Both render the same in the hover:

> Configures the **server** connection.

### Common mistake

Without CDATA or escaping, the XML parser treats HTML-like tags as markup rather than documentation text. Well-formed tags like `<br/>` or `<b>...</b>` are valid XML, but they become XML elements in the document tree instead of being rendered in the hover tooltip. Truly malformed tags like `<br>` (without a closing slash or end tag) will also cause a parse error:

```xml
<!-- The <br/> is well-formed XML but parsed as an element, not documentation text -->
<xs:documentation>
    Line 1<br/>Line 2
</xs:documentation>

<!-- The <br> without closing tag is malformed XML and causes a parse error -->
<xs:documentation>
    Line 1<br>Line 2
</xs:documentation>
```

Correct alternatives:

```xml
<!-- OK: CDATA wrapping -->
<xs:documentation><![CDATA[Line 1<br>Line 2]]></xs:documentation>

<!-- OK: entity escaping -->
<xs:documentation>Line 1&lt;br&gt;Line 2</xs:documentation>
```

### DTD comments

In DTD files, documentation is written as XML comments. CDATA is not available inside comments, so HTML tags must always be entity-escaped:

```dtd
<!-- Configures the &lt;b&gt;server&lt;/b&gt; connection. -->
<!ELEMENT server (#PCDATA)>
```

## Inline Formatting

Given this XSD:

```xml
<xs:documentation><![CDATA[
    Use <b>bold</b> and <i>italic</i> for emphasis.
    The <code>name</code> attribute is <del>deprecated</del>.
]]></xs:documentation>
```

Hover renders:

> Use **bold** and *italic* for emphasis. The `name` attribute is ~~deprecated~~.

Supported inline tags:

| HTML | Rendered as |
| --- | --- |
| `<b>`, `<strong>` | **bold** |
| `<i>`, `<em>` | *italic* |
| `<code>`, `<tt>` | `code` |
| `<del>`, `<s>` | ~~strikethrough~~ |
| `<br/>` | line break |

## Links

Given this XSD:

```xml
<xs:documentation><![CDATA[
    See <a href="https://www.w3.org/TR/xmlschema-1/">XML Schema specification</a>
    for details.
]]></xs:documentation>
```

Hover renders:

> See [XML Schema specification](https://www.w3.org/TR/xmlschema-1/) for details.

For URLs containing `&`, use `&amp;` inside CDATA:

```xml
<xs:documentation><![CDATA[
    <a href="https://example.com/search?a=1&amp;b=2">search</a>
]]></xs:documentation>
```

## Images

Given this XSD:

```xml
<xs:documentation><![CDATA[
    <p>Architecture overview:</p>
    <img src="https://example.com/arch.png" alt="Architecture diagram"/>
]]></xs:documentation>
```

Hover renders:

> Architecture overview:
>
> ![Architecture diagram](https://example.com/arch.png)

## Headings

Given this XSD:

```xml
<xs:documentation><![CDATA[
    <h2>Overview</h2>
    <p>This element configures the application.</p>
    <h3>Required attributes</h3>
    <p>The <code>name</code> attribute must be specified.</p>
]]></xs:documentation>
```

Hover renders:

> ## Overview
>
> This element configures the application.
>
> ### Required attributes
>
> The `name` attribute must be specified.

## Lists

Given this XSD:

```xml
<xs:documentation><![CDATA[
    Available options:
    <ul>
        <li>Option A - the default</li>
        <li>Option B - for advanced usage</li>
    </ul>
    Processing steps:
    <ol>
        <li>Parse the input</li>
        <li>Validate against schema</li>
        <li>Transform output</li>
    </ol>
]]></xs:documentation>
```

Hover renders:

> Available options:
> - Option A - the default
> - Option B - for advanced usage
>
> Processing steps:
> 1. Parse the input
> 2. Validate against schema
> 3. Transform output

Nested lists are also supported:

```xml
<xs:documentation><![CDATA[
    <ul>
        <li>Category A
            <ul>
                <li>Sub-item A.1</li>
                <li>Sub-item A.2</li>
            </ul>
        </li>
        <li>Category B</li>
    </ul>
]]></xs:documentation>
```

## Definition Lists

Given this XSD:

```xml
<xs:documentation><![CDATA[
    <dl>
        <dt>timeout</dt>
        <dd>Connection timeout in seconds</dd>
        <dt>retries</dt>
        <dd>Number of retry attempts</dd>
    </dl>
]]></xs:documentation>
```

Hover renders:

> **timeout**
>
> Connection timeout in seconds
>
> **retries**
>
> Number of retry attempts

## Tables

Given this XSD:

```xml
<xs:documentation><![CDATA[
    <table>
        <tr><th>Attribute</th><th>Type</th><th>Description</th></tr>
        <tr><td>name</td><td>string</td><td>The element name</td></tr>
        <tr><td>type</td><td>QName</td><td>The element type</td></tr>
    </table>
]]></xs:documentation>
```

Hover renders:

> | Attribute | Type | Description |
> | --- | --- | --- |
> | name | string | The element name |
> | type | QName | The element type |

The `colspan` attribute is supported for spanning columns.

## Blockquotes

Given this XSD:

```xml
<xs:documentation><![CDATA[
    <blockquote>
        Note: This element is deprecated since version 2.0.
        Use <code>new-element</code> instead.
    </blockquote>
]]></xs:documentation>
```

Hover renders:

> > Note: This element is deprecated since version 2.0. Use `new-element` instead.

## Pre-formatted Code Blocks

Given this XSD:

```xml
<xs:documentation><![CDATA[
    Example usage:
    <pre>
&lt;server&gt;
    &lt;host&gt;localhost&lt;/host&gt;
&lt;/server&gt;
    </pre>
]]></xs:documentation>
```

Hover renders:

> Example usage:
>
> ```
> <server>
>     <host>localhost</host>
> </server>
> ```

Inside `<pre>`, HTML formatting tags (`<b>`, `<i>`, etc.) are ignored and content is preserved verbatim.

## Markdown Fenced Code Blocks

Documentation can use Markdown-style fenced code blocks directly. This is the natural way to show XML examples because tags inside the fence are **not** parsed as HTML.

Given this XSD:

````xml
<xs:documentation><![CDATA[
Example configuration:

```xml
<server>
    <host>localhost</host>
    <port>8080</port>
</server>
```

The above shows the default settings.
]]></xs:documentation>
````

Hover renders:

> Example configuration:
>
> ```xml
> <server>
>     <host>localhost</host>
>     <port>8080</port>
> </server>
> ```
>
> The above shows the default settings.

Both `` ``` `` (backtick) and `~~~` (tilde) fence styles are supported. A closing fence must use the same character as the opening fence.

## Mixing HTML and Fenced Code Blocks

Given this XSD:

````xml
<xs:documentation><![CDATA[
    <p>This element supports the following <b>configuration</b>:</p>

```xml
<config mode="strict">
    <rule pattern="*.xml"/>
</config>
```

    <table>
        <tr><th>Mode</th><th>Description</th></tr>
        <tr><td>strict</td><td>Validates all rules</td></tr>
        <tr><td>lenient</td><td>Ignores unknown rules</td></tr>
    </table>
]]></xs:documentation>
````

Hover renders:

> This element supports the following **configuration**:
>
> ```xml
> <config mode="strict">
>     <rule pattern="*.xml"/>
> </config>
> ```
>
> | Mode | Description |
> | --- | --- |
> | strict | Validates all rules |
> | lenient | Ignores unknown rules |

## Unknown HTML Tags

Tags that have no Markdown equivalent (such as `<beans>`, `<property>`) are rendered contextually.

Given this XSD:

```xml
<xs:documentation><![CDATA[
    The <beans> element is the root of Spring configuration.
    Use <property name="x" value="y"/> to set properties.
]]></xs:documentation>
```

Hover renders:

> The `<beans>` element is the root of Spring configuration. Use `<property name="x" value="y"/>` to set properties.

Tags inline with text are rendered as inline code. Tags alone on a line are rendered as fenced code blocks.

## Transparent HTML Tags

The following tags are recognized but produce no Markdown markers. Their content is rendered normally:

`<span>`, `<div>`, `<font>`, `<u>`, `<sub>`, `<sup>`, `<section>`, `<article>`, `<aside>`, `<details>`, `<summary>`, `<nav>`, `<figure>`, `<figcaption>`, `<fieldset>`, `<legend>`, `<main>`, `<address>`, `<form>`, `<header>`, `<footer>`

## HTML Entities

| Entity | Character |
| --- | --- |
| `&lt;` | `<` |
| `&gt;` | `>` |
| `&amp;` | `&` |
| `&quot;` | `"` |
| `&apos;` | `'` |
| `&nbsp;` | (non-breaking space) |

Numeric entities (`&#60;`, `&#x3C;`) are also supported.

## Security

URLs in `<a href="...">` and `<img src="...">` are sanitized. The `javascript:`, `vbscript:`, and `data:` schemes are blocked to prevent script injection. A link with a blocked URL renders with an empty href: `[text]()`.
