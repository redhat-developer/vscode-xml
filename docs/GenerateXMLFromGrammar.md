# Generate XML from Grammar

[vscode-xml](https://github.com/redhat-developer/vscode-xml) can generate a complete, well-formed XML document from a grammar file (XSD, DTD, RelaxNG, or RNC). The generated XML includes proper grammar binding, all declared elements and attributes, and type-aware default values.

## How to use

### From the Command Palette

Open the command palette with `Ctrl+Shift+P` and run:

**XML: Generate XML from Grammar**

This opens a wizard that lets you:

1. **Select a grammar file** (`.xsd`, `.dtd`, `.rng`, or `.rnc`)
2. **Choose a root element** from the grammar's declared elements
3. A new XML document is generated and opened in the editor

### From the Context Menu

Right-click on a grammar file in the **Explorer** or in the **Editor** and select **Generate XML from Grammar**. This skips the grammar selection step and goes directly to root element selection.

## Supported Grammar Types

### XSD (XML Schema)

Generates XML with `xsi:schemaLocation` or `xsi:noNamespaceSchemaLocation` binding:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<invoice xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="invoice.xsd">
  <date>2026-01-01</date>
  <number>0</number>
  <products>
    <product price="0" description="" />
  </products>
</invoice>
```

### DTD

Generates XML with `<!DOCTYPE>` binding:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE note SYSTEM "note.dtd">
<note>
  <to></to>
  <from></from>
  <body></body>
</note>
```

### RelaxNG (.rng)

Generates XML with `<?xml-model?>` processing instruction:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<?xml-model href="addressBook.rng"?>
<addressBook>
  <card>
    <name></name>
    <email></email>
  </card>
</addressBook>
```

### RelaxNG Compact (.rnc)

Same as RelaxNG, using the compact syntax file:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<?xml-model href="addressBook.rnc"?>
<addressBook>
  <card>
    <name></name>
    <email></email>
  </card>
</addressBook>
```

## Type-Aware Default Values

For XSD grammars, the generator produces valid default values based on the declared type, so the generated XML passes validation without manual edits:

| XSD Type | Generated Value |
|----------|----------------|
| `xs:string` | *(empty)* |
| `xs:boolean` | `true` |
| `xs:date` | `2026-01-01` |
| `xs:dateTime` | `2026-01-01T00:00:00` |
| `xs:time` | `00:00:00` |
| `xs:integer`, `xs:int`, `xs:long`, `xs:short` | `0` |
| `xs:decimal`, `xs:float`, `xs:double` | `0` |
| `xs:positiveInteger` | `1` |
| `xs:negativeInteger` | `-1` |
| `xs:duration` | `P1D` |
| `xs:gYear` | `2026` |
| Enumeration types | First enumeration value |

## Settings

Generation behavior can be configured through VS Code settings:

| Setting | Default | Description |
|---------|---------|-------------|
| `xml.generation.maxDepth` | `10` | Maximum depth for nested element generation |
| `xml.generation.optionalElements` | `true` | Generate optional elements (minOccurs=0) |
| `xml.generation.typeDefaults` | `true` | Generate type-aware default values (e.g. `0` for `xs:integer`, `2026-01-01` for `xs:date`) |

The following examples use `maven-4.0.0.xsd` (the Maven POM schema) to illustrate each setting.

### `xml.generation.maxDepth`

Controls the maximum depth for nested element generation. The Maven POM schema is deeply nested (`project` → `build` → `plugins` → `plugin` → `executions` → ...).

With `maxDepth: 10` (default), all levels are generated, producing a very large file:

```xml
<project>
  <modelVersion></modelVersion>
  <parent>
    <groupId></groupId>
    <artifactId></artifactId>
    <version></version>
    <relativePath></relativePath>
  </parent>
  <groupId></groupId>
  <artifactId></artifactId>
  <version></version>
  <packaging></packaging>
  <name></name>
  <description></description>
  <url></url>
  <dependencies>
    <dependency>
      <groupId></groupId>
      <artifactId></artifactId>
      <version></version>
      <scope></scope>
      <exclusions>
        <exclusion>
          <groupId></groupId>
          <artifactId></artifactId>
        </exclusion>
      </exclusions>
    </dependency>
  </dependencies>
  <build>
    <plugins>
      <plugin>
        <groupId></groupId>
        <artifactId></artifactId>
        <!-- ... continues deeply ... -->
      </plugin>
    </plugins>
  </build>
  <!-- ... hundreds more lines ... -->
</project>
```

With `maxDepth: 2`, only the first two levels are generated — a much more manageable starting point:

```xml
<project>
  <modelVersion></modelVersion>
  <parent></parent>
  <groupId></groupId>
  <artifactId></artifactId>
  <version></version>
  <packaging></packaging>
  <name></name>
  <description></description>
  <url></url>
  <dependencies></dependencies>
  <build></build>
</project>
```

### `xml.generation.optionalElements`

Controls whether optional elements (`minOccurs="0"`) are generated. In the Maven POM schema, most elements are optional — only `modelVersion` is required.

With `optionalElements: true` (default) — all elements are generated (parent, groupId, dependencies, build, etc.):

```xml
<project>
  <modelVersion></modelVersion>
  <parent>
    <!-- ... -->
  </parent>
  <groupId></groupId>
  <artifactId></artifactId>
  <version></version>
  <packaging></packaging>
  <name></name>
  <description></description>
  <url></url>
  <dependencies>
    <!-- ... -->
  </dependencies>
  <build>
    <!-- ... -->
  </build>
  <!-- ... many more optional elements ... -->
</project>
```

With `optionalElements: false` — only the required `modelVersion` is generated:

```xml
<project>
  <modelVersion></modelVersion>
</project>
```

### `xml.generation.typeDefaults`

Controls whether type-aware default values are generated (e.g., `true` for `xs:boolean`, `0` for `xs:integer`, `2026-01-01` for `xs:date`).

With `typeDefaults: true` (default) — typed elements and attributes get valid defaults:

```xml
<record id="0">
  <name></name>
  <count>0</count>
  <birthDate>2026-01-01</birthDate>
</record>
```

With `typeDefaults: false` — all values are left empty:

```xml
<record id="">
  <name></name>
  <count></count>
  <birthDate></birthDate>
</record>
```

> **Note:** The Maven POM schema uses mostly `xs:string` types, so `typeDefaults` has minimal effect on it. This setting is most useful for schemas with numeric, date, or boolean types.

### Example in `settings.json`

```json
{
  "xml.generation.maxDepth": 5,
  "xml.generation.optionalElements": false,
  "xml.generation.typeDefaults": false
}
```

## Profiles

Generation profiles let you customize settings per grammar. Each profile has a `pattern` (glob matched against the grammar URI) and overrides the global settings. The first matching profile wins.

| Property | Type | Description |
|----------|------|-------------|
| `pattern` | string | Glob pattern matched against the grammar URI (required) |
| `maxDepth` | integer | Override maximum depth |
| `optionalElements` | boolean | Override optional elements generation |
| `typeDefaults` | boolean | Override type-aware default values generation |

Example: generating from `spring-beans-3.0.xsd` with a profile that limits depth and skips optional elements:

```json
{
  "xml.generation.profiles": [
    {
      "pattern": "**/*spring-beans*.xsd",
      "maxDepth": 3,
      "optionalElements": false,
      "typeDefaults": false
    },
    {
      "pattern": "**/*maven*.xsd",
      "maxDepth": 2
    }
  ]
}
```

When generating from a grammar whose URI matches `**/*spring-beans*.xsd`, the profile settings override the global defaults. Other grammars use the global settings unless they match another profile.

## Features

- Generates **all elements** (required and optional) with proper nesting
- Generates **required attributes** with type-appropriate default values
- Handles **namespace prefixes** for elements from imported schemas
- Generates **enumeration defaults** (first value) for both elements and attributes
- Handles **xs:choice** content models: single choice generates the first alternative, repeatable choice (`maxOccurs > 1`) generates all alternatives
- Supports **abstract types** with `xsi:type` attribute
- Respects **formatting settings** (tab size, spaces vs tabs, split attributes, etc.)
- **Path relativization**: grammar paths are converted to relative paths when saving the generated document
