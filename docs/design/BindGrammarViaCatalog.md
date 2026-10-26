# Design: Bind Grammar via XML Catalog

Issue: https://github.com/redhat-developer/vscode-xml/issues/838

## 1. XML Catalog Spec Overview (OASIS XML Catalogs)

An XML Catalog is a mapping file that redirects XML identifiers (public IDs, system IDs, URIs) to local resources. The catalog file itself is XML with namespace `urn:oasis:names:tc:entity:xmlns:xml:catalog`.

### 1.1 Catalog File Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<catalog xmlns="urn:oasis:names:tc:entity:xmlns:xml:catalog"
         prefer="public">

  <!-- Direct mapping entries -->
  <public publicId="-//OASIS//DTD DITA 2.0 Base Topic//EN" uri="basetopic.dtd"/>
  <system systemId="http://example.com/schema.dtd" uri="local/schema.dtd"/>
  <uri name="http://maven.apache.org/POM/4.0.0" uri="maven-4.0.0.xsd"/>

  <!-- Prefix rewriting -->
  <rewriteSystem systemIdStartString="http://www.oasis-open.org/"
                 rewritePrefix="file:///share/oasis/"/>
  <rewriteURI uriStartString="http://example.com/old/"
              rewritePrefix="http://example.com/new/"/>

  <!-- Suffix matching -->
  <systemSuffix systemIdSuffix=".dtd" uri="dtds/"/>
  <uriSuffix uriSuffix=".xsd" uri="schemas/"/>

  <!-- Delegation to other catalogs -->
  <delegatePublic publicIdStartString="-//OASIS//"
                  catalog="oasis-catalog.xml"/>
  <delegateSystem systemIdStartString="http://www.oasis-open.org/"
                  catalog="oasis-catalog.xml"/>
  <delegateURI uriStartString="http://example.com/"
               catalog="example-catalog.xml"/>

  <!-- Chaining -->
  <nextCatalog catalog="more-entries.xml"/>

  <!-- Grouping (shared prefer/xml:base) -->
  <group xml:base="http://www.oasis-open.org/docbook/xml/4.1.2/">
    <public publicId="-//OASIS//DTD DocBook XML V4.1.2//EN" uri="docbookx.dtd"/>
  </group>
</catalog>
```

### 1.2 Entry Types Summary

| Entry Type | Key Attribute(s) | Target | Use Case |
|---|---|---|---|
| `public` | `publicId` | `uri` | Map a PUBLIC identifier to a local DTD |
| `system` | `systemId` | `uri` | Map a SYSTEM identifier to a local resource |
| `uri` | `name` | `uri` | Map a namespace URI or schema location to a local file |
| `rewriteSystem` | `systemIdStartString` | `rewritePrefix` | Redirect a URL prefix (system IDs) |
| `rewriteURI` | `uriStartString` | `rewritePrefix` | Redirect a URL prefix (URIs) |
| `systemSuffix` | `systemIdSuffix` | `uri` | Match system IDs by suffix |
| `uriSuffix` | `uriSuffix` | `uri` | Match URIs by suffix |
| `delegatePublic` | `publicIdStartString` | `catalog` | Delegate to another catalog by public ID prefix |
| `delegateSystem` | `systemIdStartString` | `catalog` | Delegate to another catalog by system ID prefix |
| `delegateURI` | `uriStartString` | `catalog` | Delegate to another catalog by URI prefix |
| `nextCatalog` | — | `catalog` | Chain another catalog after this one |
| `group` | `prefer`, `xml:base` | (children) | Group entries with shared settings |

### 1.3 Resolution Algorithm

When an XML parser encounters an external identifier (e.g. a DOCTYPE), the catalog resolves it in this order:

1. **system** — exact match on system ID
2. **rewriteSystem** — longest matching prefix on system ID
3. **delegateSystem** — longest matching prefix, delegate to sub-catalog
4. **public** — exact match on public ID (if `prefer="public"` or no system ID)
5. **delegatePublic** — longest matching prefix on public ID
6. **nextCatalog** — try chained catalogs
7. No match → use original identifier

For URI resolution (`uri`, `rewriteURI`, `delegateURI`), a similar algorithm applies.

### 1.4 The `prefer` Attribute

Controls whether public or system identifiers take priority when both exist:
- `prefer="public"` (default): public ID lookup happens even when system ID exists
- `prefer="system"`: system ID lookup takes precedence; public ID used only as fallback

### 1.5 Relevant Entry Types for Binding

For the "Bind to grammar" wizard, only **direct mapping entries** are useful to present to users:

| Entry Type | Relevant? | Why |
|---|---|---|
| `public` | **Yes** | User picks a PUBLIC ID → generates `<!DOCTYPE root PUBLIC "..." "...">` |
| `system` | **Yes** | User picks a SYSTEM ID → generates `<!DOCTYPE root SYSTEM "...">` |
| `uri` | **Yes** | User picks a URI/namespace → generates `xsi:schemaLocation` or `xsi:noNamespaceSchemaLocation` |
| `rewriteSystem/URI` | No | Infrastructure-level, not user-facing identifiers |
| `systemSuffix/uriSuffix` | No | Pattern-based, not specific entries |
| `delegate*` | No | Points to other catalogs, not to grammars |
| `nextCatalog` | **Indirect** | Must be followed to discover entries in chained catalogs |
| `group` | **Indirect** | Contains entries that should be included |

## 2. Current Architecture

### 2.1 Current "Bind to grammar/schema" Flow

```
User clicks CodeLens "Bind to grammar/schema..."
    │
    ▼
[Client] xml.open.binding.wizard command
    │
    ▼
Step 1: QuickPick "Local" or "Remote"
    │
    ▼
Step 2: File picker (local) or InputBox (remote URL)
    │
    ▼
Step 3: QuickPick binding type:
    ├── "Standard (xsi, DOCTYPE)" → bindingType = "standard"
    ├── "XML Model association"   → bindingType = "xml-model"
    └── "File association"        → bindingType = "fileAssociation"
    │
    ▼
[Client → Server] xml.associate.grammar.insert(docURI, grammarURI, bindingType)
    │
    ▼
[Server] Generates TextDocumentEdit based on grammar type:
    ├── XSD + targetNamespace → xmlns + xsi:schemaLocation
    ├── XSD (no namespace)   → xsi:noNamespaceSchemaLocation
    ├── DTD                  → <!DOCTYPE root SYSTEM "...">
    └── xml-model            → <?xml-model href="..."?>
    │
    ▼
[Client] Applies edit to document
```

### 2.2 Key Gap: No PUBLIC DOCTYPE Support

The current `AssociateGrammarCommand` only generates `<!DOCTYPE root SYSTEM "...">`. There is no support for `<!DOCTYPE root PUBLIC "publicId" "systemId">`.

### 2.3 Catalog Entry Model Gap

`CatalogEntry` / `URICatalogEntry` only exposes the `uri` attribute (the target). The `publicId`, `systemId`, and `name` attributes are NOT exposed in the model. They'd need to be extracted from the `DOMElement` via `getEntryElement()`.

### 2.4 No Catalog Entry Enumeration

The Xerces `XMLCatalogResolver` provides resolution (`resolvePublic`, `resolveSystem`, `resolveURI`) but cannot enumerate all entries. To list entries, we must parse catalog files directly via `CatalogUtils.getCatalogEntries()` and follow `nextCatalog` chains.

## 3. Use Cases

### UC1: Bind from existing catalog entry
**Precondition**: One or more catalogs are registered in `xml.catalogs` with entries.
**User**: Clicks "Bind to grammar/schema...", selects "Catalog entry", picks an entry from the list.
**Result**: Appropriate DOCTYPE/namespace is generated in the XML.

### UC2: Bind with new catalog entry (catalog exists)
**Precondition**: A catalog is registered but doesn't have the desired entry.
**User**: Clicks "Bind to grammar/schema...", selects "Catalog entry", then "Add new entry...", picks a grammar file, specifies identifier, selects target catalog.
**Result**: Entry is added to catalog, XML is bound.

### UC3: Bind with new catalog (no catalog exists)
**Precondition**: No catalog is registered.
**User**: Clicks "Bind to grammar/schema...", selects "Catalog entry", creates a new catalog, adds an entry.
**Result**: Catalog file is created, registered in settings, entry added, XML is bound.

### UC4: Large catalogs (DITA, DocBook)
**Precondition**: Catalogs with hundreds of entries (e.g. DITA-OT has 200+ public entries).
**User**: Needs to find the right entry quickly.
**Requirement**: Searchable/filterable list with meaningful labels.

## 4. Proposed Wizard Flow

### 4.1 Modified Step 1: Grammar Source

Add "Catalog entry" as a third option alongside local/remote:

```
How do you want to bind the grammar?

  Local file...
  Remote URL...
  Catalog entry...        ← NEW
```

### 4.2 Catalog Entry Flow

```
"Catalog entry" selected
        │
        ▼
  ┌─ Catalogs registered with entries? ──┐
  │ YES                                   │ NO
  ▼                                       ▼
Select entry (QuickPick)              "No catalog registered"
  │                                       │
  │ entries listed +                  ┌───┴────┐
  │ "Add new entry..."               │        │
  │                                Create   Select existing
  │                                catalog  catalog file
  │                                   │        │
  │                                   ▼        ▼
  │                              File save   File open
  │                              dialog      dialog
  │                                   │        │
  │                                   └───┬────┘
  │                                       │
  │                                  Register in
  │                                  xml.catalogs
  │                                       │
  │              ┌────────────────────────┘
  │              ▼
  │         "Add new entry" flow
  │              │
  │              ▼
  │         Select grammar file
  │         (local or remote)
  │              │
  │              ▼
  │         Select entry type
  │         (auto-suggested based on grammar type)
  │              │
  │              ▼
  │         Enter identifier
  │         (publicId / systemId / name)
  │              │
  │              ▼
  │         Select target catalog
  │         (if multiple registered)
  │              │
  │              ▼
  │         Add entry to catalog
  │              │
  ├──────────────┘
  ▼
Generate XML binding
based on entry type + grammar type
```

### 4.3 Entry Selection UI (UC4 - Large Catalogs)

For catalogs with many entries, use a QuickPick with:
- **Type-to-filter** search (built-in VS Code QuickPick feature)
- **Grouping** by catalog file (using QuickPick separators)
- **Labels** showing: entry type icon + identifier
- **Description** showing: resolved URI (grammar file)
- **Detail** showing: catalog file path

```
Select a catalog entry to bind

  ── catalog.xml ──────────────────────────────────────
  PUBLIC  -//OASIS//DTD DITA 2.0 Base Topic//EN          basetopic.dtd
  PUBLIC  -//OASIS//DTD DITA 2.0 Base Map//EN            basemap.dtd
  PUBLIC  -//OASIS//DTD DITA 2.0 Subject Scheme//EN      subjectScheme.dtd
  ...

  ── schemas/catalog.xml ──────────────────────────────
  URI     http://maven.apache.org/POM/4.0.0              maven-4.0.0.xsd
  SYSTEM  http://example.com/config.xsd                  config.xsd
  ...

  ── Add new catalog entry... ─────────────────────────
```

### 4.4 Entry Type Auto-Suggestion

When creating a new entry, suggest the entry type based on grammar:

| Grammar Type | Suggested Entry Type | Reason |
|---|---|---|
| DTD (`.dtd`) | `public` | DTDs traditionally use PUBLIC identifiers |
| XSD (`.xsd`) | `uri` | XSD uses namespace URIs, mapped via `<uri>` |
| RNG (`.rng`, `.rnc`) | `uri` | Similar to XSD |

### 4.5 Generated XML Binding

| Entry Type | Grammar | Generated XML |
|---|---|---|
| `public` | DTD | `<!DOCTYPE {root} PUBLIC "{publicId}" "{uri}">` |
| `system` | DTD | `<!DOCTYPE {root} SYSTEM "{systemId}">` |
| `uri` | XSD (with ns) | `xmlns="{name}" xmlns:xsi="..." xsi:schemaLocation="{name} {name}"` |
| `uri` | XSD (no ns) | `xsi:noNamespaceSchemaLocation="{name}"` |
| `uri` | RNG | `<?xml-model href="{name}"?>` |
| `system` | XSD | `xsi:noNamespaceSchemaLocation="{systemId}"` |

> **Note on PUBLIC DOCTYPE**: The `uri` attribute from the catalog entry is used as the SYSTEM identifier in the DOCTYPE. This mirrors how standards like DITA reference their DTDs:
> ```xml
> <!DOCTYPE topic PUBLIC "-//OASIS//DTD DITA 2.0 Base Topic//EN" "basetopic.dtd">
> ```
> The catalog entry `<public publicId="..." uri="basetopic.dtd"/>` provides both the publicId and the system ID fallback.

## 5. Implementation Plan

### 5.1 Server-Side Changes (lemminx)

#### 5.1.1 Extend CatalogEntry Model

Expose identifier attributes from catalog entries:

```java
// New class or extension of URICatalogEntry
public class BindableCatalogEntry {
    private String catalogURI;      // which catalog file
    private String entryType;       // "public", "system", "uri"
    private String identifier;      // publicId, systemId, or name
    private String targetURI;       // resolved uri
    private String grammarType;     // "xsd", "dtd", "rng" (detected from uri extension)
}
```

#### 5.1.2 New Command: `xml.catalog.entries.bindable`

Returns all bindable catalog entries across all registered catalogs.

**Parameters**: none (uses registered catalogs from settings)

**Algorithm**:
1. For each catalog in `xml.catalogs`:
   a. Parse the catalog XML file
   b. For each `public`, `system`, `uri` entry: extract identifier + target URI
   c. For each `group`: recurse into children
   d. For each `nextCatalog`: follow chain and recurse (with cycle detection)
2. Detect grammar type from resolved URI extension
3. Return as `BindableCatalogEntry[]`

**Response** (JSON):
```json
[
  {
    "catalogURI": "file:///path/to/catalog.xml",
    "entryType": "public",
    "identifier": "-//OASIS//DTD DITA 2.0 Base Topic//EN",
    "targetURI": "file:///path/to/basetopic.dtd",
    "grammarType": "dtd"
  },
  {
    "catalogURI": "file:///path/to/schemas/catalog.xml",
    "entryType": "uri",
    "identifier": "http://maven.apache.org/POM/4.0.0",
    "targetURI": "file:///path/to/maven-4.0.0.xsd",
    "grammarType": "xsd"
  }
]
```

#### 5.1.3 New Command: `xml.catalog.entry.add`

Adds a new entry to an existing catalog file.

**Parameters**: `[catalogURI, entryType, identifier, grammarURI]`

**Returns**: `TextDocumentEdit` that inserts the new entry element into the catalog.

Example: `xml.catalog.entry.add("file:///catalog.xml", "public", "-//My//DTD//EN", "file:///my.dtd")` would insert `<public publicId="-//My//DTD//EN" uri="my.dtd"/>` into catalog.xml.

#### 5.1.4 New Command: `xml.catalog.create`

Creates a new empty catalog file.

**Parameters**: `[catalogURI]`

**Returns**: `CreateFile` + `TextDocumentEdit` with the catalog skeleton:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<catalog xmlns="urn:oasis:names:tc:entity:xmlns:xml:catalog">
</catalog>
```

#### 5.1.5 Extend `xml.associate.grammar.insert`

Add support for catalog-based binding.

**New parameter variant**: `[documentURI, bindingType, entryType, identifier, systemId?]`

Where `bindingType = "catalog"`.

**New generated edits**:
- `public` entry → `<!DOCTYPE {root} PUBLIC "{identifier}" "{systemId}">`
- `system` entry → `<!DOCTYPE {root} SYSTEM "{identifier}">`
- `uri` entry (XSD with ns) → `xmlns="{identifier}"` + `xsi:schemaLocation`
- `uri` entry (XSD no ns) → `xsi:noNamespaceSchemaLocation="{identifier}"`
- `uri` entry (RNG) → `<?xml-model href="{identifier}"?>`

### 5.2 Client-Side Changes (vscode-xml)

#### 5.2.1 Modify `grammarAssociationCommand()`

Add "Catalog entry" to the first QuickPick step.

#### 5.2.2 New: `showCatalogEntryPicker()`

Calls `xml.catalog.entries.bindable`, displays results in a QuickPick with:
- Separators per catalog file
- Type icon + identifier as label
- Resolved URI as description
- "Add new catalog entry..." at the bottom

#### 5.2.3 New: `createCatalogEntryFlow()`

Sub-wizard for creating a new catalog entry:
1. Pick grammar file (reuse existing local/remote picker)
2. Pick entry type (with auto-suggestion)
3. Input identifier
4. Pick target catalog (if multiple) or create new
5. Call `xml.catalog.entry.add`
6. Call `xml.associate.grammar.insert` with catalog binding

#### 5.2.4 New: `createCatalogFlow()`

Sub-wizard for creating a new catalog:
1. File save dialog for catalog location
2. Call `xml.catalog.create`
3. Update `xml.catalogs` setting (via `ConfigurationItemEdit` or direct VS Code API)

## 6. Design Decisions

### D1: Root Element for DOCTYPE
**Decision**: Use the current root element name from the XML document. The CodeLens appears on the root element, so it always exists. For empty XML files (issue #819), use a placeholder.

### D2: System ID in PUBLIC DOCTYPE
**Decision**: Use the `uri` attribute from the catalog entry (e.g. `"basetopic.dtd"`) as the SYSTEM identifier in `<!DOCTYPE root PUBLIC "publicId" "systemId">`. This mirrors how DITA and DocBook DOCTYPEs work.

### D3: `nextCatalog` Chain Depth
**Decision**: Follow all `nextCatalog` chains recursively with cycle detection. DITA-OT has deep chains and users expect to see all entries regardless of catalog organization.

### D4: `rewriteSystem` / `rewriteURI` Entries
**Decision**: Not exposed in the wizard. These are infrastructure-level prefix rewriting rules, not user-facing identifiers for specific grammars.

### D5: Entry Type Selection for New Entries
**Decision**: Auto-detect based on grammar type (DTD → `public`, XSD/RNG → `uri`) with option to override. Most users won't know the difference between entry types.

### D6: Multiple Catalogs - Where to Add Entry?
**Decision**: Ask which catalog if more than one is registered. Skip the step if only one catalog exists.

### D7: Catalog Entry URI - Relative or Absolute?
**Decision**: Relative to the catalog file (e.g. `"schemas/my.xsd"`). Relative paths are more portable and follow standard practice.

## 7. Phased Implementation

### Phase 1: Pick from Existing Catalog Entries (UC1)
- Server: `xml.catalog.entries.bindable` command
- Server: Extend `xml.associate.grammar.insert` for PUBLIC DOCTYPE
- Client: Add "Catalog entry" to wizard, entry picker UI
- **Scope**: Read-only — no catalog creation or modification

### Phase 2: Create New Catalog Entry (UC2)
- Server: `xml.catalog.entry.add` command
- Client: "Add new entry" sub-flow
- **Scope**: Modifies existing catalogs

### Phase 3: Create New Catalog (UC3)
- Server: `xml.catalog.create` command
- Client: "Create catalog" sub-flow, settings registration
- **Scope**: Creates new files, modifies settings

### Phase 4: UX Polish (UC4)
- Improve QuickPick for large catalogs (grouping, icons)
- Add "recently used" entries
- Add catalog entry preview (show what will be generated)
