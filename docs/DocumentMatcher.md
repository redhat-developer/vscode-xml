# Document Matcher

Several settings in vscode-xml use **document matching** to apply configuration only to documents that meet specific criteria. Document matching is available in the following settings:

| Setting | Description |
|---------|-------------|
| `xml.format.profiles` | [Formatting profiles](Formatting.md#formatting-profiles) |
| `xml.colors` | [XML Colors](Features/XMLColorsFeatures.md) |
| `xml.references` | [XML References](Features/XMLReferencesFeatures.md) |
| `xml.symbols.filters` | [Symbol filters](Symbols.md#xmlsymbolsfilters) |
| `xml.filePathSupport.mappings` | [File path support](Features/XMLFilePathSupport.md) |

## Matching criteria

A document matcher supports 6 optional matching criteria. When multiple criteria are specified, they are combined with **AND** logic: all specified criteria must match. Within each criterion that accepts an array, values are combined with **OR** logic: at least one value must match.

A matcher with no criteria never matches any document.

### pattern

Matches the document URI using a Java NIO file glob pattern.

| Type | Example |
|------|---------|
| `string` | `**/pom.xml` |

```json
{
  "pattern": "**/pom.xml"
}
```

More information on the glob syntax: https://docs.oracle.com/javase/tutorial/essential/io/fileOps.html#glob

### namespaceURI

Matches the root element namespace URI of the document. Supports glob patterns where `*` matches any sequence of characters (including empty) and `?` matches exactly one character.

| Type | Example |
|------|---------|
| `string[]` | `["http://docbook.org/ns/docbook*"]` |

```json
{
  "namespaceURI": ["http://docbook.org/ns/docbook*"]
}
```

This matches DocBook 5.x documents whose root element has a namespace URI starting with `http://docbook.org/ns/docbook`.

Another example, matching [TEI](https://tei-c.org/) documents:

```json
{
  "namespaceURI": ["http://www.tei-c.org/ns/1.0"]
}
```

### rootElement

Matches the root element local name (without namespace prefix). Supports glob patterns.

| Type | Example |
|------|---------|
| `string[]` | `["mapper"]` |

```json
{
  "rootElement": ["mapper"]
}
```

This matches documents whose root element is `<mapper>`, regardless of namespace. Useful for XML files that have a distinctive root element but no namespace or DOCTYPE declaration.

To disambiguate elements with the same name (e.g., Maven `<project>` vs Ant `<project>`), combine with another criterion:

```json
{
  "rootElement": ["project"],
  "namespaceURI": ["http://maven.apache.org/POM/4.0.0"]
}
```

### publicId

Matches the DOCTYPE public ID of the document. Supports glob patterns.

| Type | Example |
|------|---------|
| `string[]` | `["-//mybatis.org//DTD Mapper*"]` |

Given this XML document:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="...">
  ...
</mapper>
```

The following matcher targets all MyBatis mapper documents:

```json
{
  "publicId": ["-//mybatis.org//DTD Mapper*"]
}
```

### systemId

Matches the DOCTYPE system ID of the document. Supports glob patterns.

| Type | Example |
|------|---------|
| `string[]` | `["http://mybatis.org/dtd/*"]` |

Given this XML document:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="...">
  ...
</mapper>
```

The following matcher targets documents with a MyBatis DTD system ID:

```json
{
  "systemId": ["http://mybatis.org/dtd/*"]
}
```

### grammarURI

Matches the resolved grammar URI associated with the document. The grammar URI is resolved from multiple sources:

- DOCTYPE `systemId` (resolved through XML catalog if applicable)
- `<?xml-model?>` processing instruction `href`
- `xml.fileAssociations` setting
- XML catalog entries

Supports glob patterns.

| Type | Example |
|------|---------|
| `string[]` | `["**/docbook.xsd"]` |

```json
{
  "grammarURI": ["**/docbook.xsd"]
}
```

## Combining criteria

When multiple criteria are specified, **all** of them must match (AND logic). This allows you to create precise matchers for specific documents.

For example, to match only DocBook 5.x XML files located under the `docs/` directory:

```json
{
  "pattern": "**/docs/**/*.xml",
  "namespaceURI": ["http://docbook.org/ns/docbook*"]
}
```

## Glob pattern syntax

The `namespaceURI`, `publicId`, `systemId`, and `grammarURI` criteria support a simple glob syntax:

| Pattern | Description |
|---------|-------------|
| `*` | Matches any sequence of characters (including empty) |
| `?` | Matches exactly one character |

For example:

- `http://docbook.org/ns/docbook*` matches `http://docbook.org/ns/docbook` and `http://docbook.org/ns/docbook5`
- `-//mybatis.org//DTD Mapper*` matches `-//mybatis.org//DTD Mapper 3.0//EN`
- `http://mybatis.org/dtd/mybatis-?-mapper.dtd` matches `http://mybatis.org/dtd/mybatis-3-mapper.dtd` but not `http://mybatis.org/dtd/mybatis-10-mapper.dtd`

The `pattern` criterion uses the Java NIO [glob syntax](https://docs.oracle.com/javase/tutorial/essential/io/fileOps.html#glob) which has additional features like `**` for directory crossing and `{a,b}` for alternatives.

## Use cases

### Formatting profiles

Override formatting settings for specific documents. See [Formatting Profiles](Formatting.md#formatting-profiles).

```json
"xml.format.profiles": [
  {
    "namespaceURI": ["http://docbook.org/ns/docbook*"],
    "mixedContent": "preserve"
  },
  {
    "pattern": "**/pom.xml",
    "splitAttributes": "force-expand-multiline"
  }
]
```

### Colors by root element

Apply color support to documents matching a root element name instead of a file path pattern:

```json
"xml.colors": [
  {
    "rootElement": ["resources"],
    "expressions": [
      { "xpath": "resources/color/text()" }
    ]
  }
]
```

### References by DOCTYPE

Apply XML references to all documents with a specific DOCTYPE:

```json
"xml.references": [
  {
    "publicId": ["-//OASIS//DTD DocBook XML V4.*"],
    "expressions": [
      { "from": "xref/@linkend", "to": "@id" }
    ]
  }
]
```

### Symbol filters by grammar

Apply symbol filters to documents resolved to a specific grammar:

```json
"xml.symbols.filters": [
  {
    "grammarURI": ["**/maven-4.0.0.xsd"],
    "expressions": [
      { "xpath": "//text()" }
    ]
  }
]
```
