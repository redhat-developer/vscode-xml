# XML Validation

## XML Syntax Errors

[vscode-xml](https://github.com/redhat-developer/vscode-xml) provides the capability to `report XML syntax errors` when the XML is not valid:

![XML Syntax Error](images/validation/XMLSyntaxError.png)

For many of the errors, you can use a `Quick Fix` (code action) to help you fix the XML:

![XML Syntax Error Code Action](images/validation/XMLSyntaxErrorCodeAction.gif)

## Validation with a given grammar

You can `validate your XML with a grammar` (XSD, DTD). In order to do so, you must associate your XML document with a grammar. Once you have done this, you will benefit from:

 * XML `validation` based on the grammar.
 * XML `completion` based on the grammar.
 * XML `hover` based on the grammar in order to show the documentation.

## Validation with XSD grammar

In the following sections, we would like to validate the XML `foo.xml` file:

```xml
<foo>
  <bar />
</foo>
```

with the XSD `foo.xsd` file (in the same folder as foo.xml) :

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xs:element name="foo">
    <xs:complexType>
      <xs:sequence>
        <xs:element name="bar" />
      </xs:sequence>
    </xs:complexType>
  </xs:element>
</xs:schema>
```

in order to benefit from validation, completion, and hover based on the XSD:

![XML Grammar Error](images/validation/XMLGrammarError.png)

To associate your XML document with an XSD grammar, you can use several strategies:

 * [xsi:noNamespaceSchemaLocation](#xsinonamespaceschemalocation)
 * [xsi:schemaLocation](#xsischemalocation)
 * [xml-model with XSD](#xml-model-with-XSD) processing instruction
 * [XML catalog with XSD](#XML-catalog-with-XSD)
 * [XML file association](#XML-file-association)

If you have an XML without an XSD, you can generate the XSD with a `Quick Fix` (code action):

![Generate XSD](images/validation/GenerateXSD.gif)

The Quick Fix will generate the XSD file and associate the XML with the XSD using the chosen strategy.

### xsi:noNamespaceSchemaLocation

To bind the XML file `foo.xml` with the XSD file `foo.xsd`, you can use the `xsi:noNamespaceSchemaLocation` strategy like this:

```xml
<foo
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:noNamespaceSchemaLocation="foo.xsd">
  <bar />
</foo>
```

### xsi:schemaLocation

The `xsi:schemaLocation` strategy is used when the XSD file defines a `targetNamespace="http://foo"` in the root element of the XSD:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xs:schema
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    elementFormDefault="qualified"
    targetNamespace="http://foo">
  <xs:element name="foo">
    <xs:complexType>
      <xs:sequence>
        <xs:element name="bar" />
      </xs:sequence>
    </xs:complexType>
  </xs:element>
</xs:schema>
```

You can bind the XSD like this:

```xml
<foo
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="htp://foo foo.xsd">
  <bar />
</foo>
```

### xml-model with XSD

To bind the XML file `foo.xml` to the XSD file `foo.xsd`, you can use [xml-model](https://www.w3.org/TR/xml-model/) processing instruction strategy like this:

```xml
<?xml-model href="foo.xsd" ?>
<foo>
  <bar />
</foo>
```

### XML catalog with XSD

Using an XML catalog can be helpful when you wish to use elements from a namespace but  don't want to set the real path of the XSD file for each XML document.

In other words you want to write this XML file:


```xml
<foo xmlns="http://foo" >
  <bar />
</foo>
```

and validate it with the `foo.xsd` XSD file:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xs:schema
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    elementFormDefault="qualified"
    targetNamespace="http://foo">
  <xs:element name="foo">
    <xs:complexType>
      <xs:sequence>
        <xs:element name="bar" />
      </xs:sequence>
    </xs:complexType>
  </xs:element>
</xs:schema>
```

To do this, you need to write an XML catalog, and an entry for the XSD. In this example, we'll name the catalog `catalog.xml`. The catalog looks like this:

```xml
<catalog xmlns="urn:oasis:names:tc:entity:xmlns:xml:catalog">

  <uri
      name="http://foo"
      uri="./foo.xsd" />

</catalog>
```

You must register your `catalog.xml` in the vscode `settings.json` like this:

```json
"xml.catalogs": [
   "catalog.xml"
]
```

You can also register the catalog using its absolute path:

| Windows                            | MacOS                        | Linux                       |
| ---------------------------------- | ---------------------------- | --------------------------- |
| `C:\\Users\\path\\to\\catalog.xml` | `/Users/path/to/catalog.xml` | `/home/path/to/catalog.xml` |

Please note that you can declare your catalog path with `file:///` if you need it.

### XML file association

You can use the XML file association strategy to bind the XML file `foo.xml` with the XSD file `foo.xsd` by adding the following into your vscode `settings.json`:

```json
"xml.fileAssociations": [
   {
       "pattern": "foo.xml",
       "systemId": "foo.xsd"
   }
]
```

Please note that you can use wildcards in the pattern (ex: `foo*.xml`):

```json
"xml.fileAssociations": [
   {
       "pattern": "foo*.xml",
       "systemId": "foo.xsd"
   }
]
```

In this case, all XML files that start with foo and end with .xml will be associated with the XSD (foo1.xml, foo2.xml, etc)

## Validation with DTD grammar

To associate your XML with a DTD grammar you can use several strategies:

 * [DOCTYPE](#DOCTYPE)
 * [xml-model with DTD](#xml-model-with-DTD) processing instruction
 * [XML catalog with DTD](#XML-catalog-with-DTD)
 * XML file association is not supported for DTD at the moment. Please see [issue 184](https://github.com/redhat-developer/vscode-xml/issues/184))

In the following sections we would like to validate the XML `foo.xml` file:

```xml
<foo>
  <bar />
</foo>
```

with the DTD `foo.dtd` file:

```xml
<!ELEMENT foo (bar)>
<!ELEMENT bar EMPTY>
```

Please note: this DTD file can be generated with the same Quick Fix which generates the XSD.

### DOCTYPE

To bind the XML file `foo.xml` with the DTD file `foo.dtd`, you can use the `DOCTYPE` strategy like this:

```xml
<!DOCTYPE foo SYSTEM "foo.dtd">
<foo>
  <bar />
</foo>
```

### xml-model with DTD

To bind XML file `foo.xml` with the DTD file `foo.dtd`, you can use [xml-model](https://www.w3.org/TR/xml-model/) processing instruction strategy like this:

```xml
<?xml-model href="foo.dtd" ?>
<foo>
  <bar />
</foo>
```

### XML catalog with DTD

Using an XML catalog can be helpful when you wish to associate to a DTD using a PUBLIC declaration, but don't want to set the real path of the DTD file (SYSTEM).

In other words you want to write this XML file:

```xml
<!DOCTYPE foo PUBLIC "-//FOO" "XXXXXXXXXXXXXXX.dtd">
<foo>
  <bar />
</foo>
```

and validate it with this `foo.dtd` DTD file:

```xml
<!ELEMENT foo (bar)>
<!ELEMENT bar EMPTY>
```

The declared `XXXXXXXXXXXXXXX.dtd` in the DOCTYPE is a file which doesn't exist. The `foo.dtd` will be retrieved using the PUBLIC `-//FOO`.

To do this, you need to write an XML catalog, and an entry for the DTD. In this example, we'll name the catalog `catalog.xml`. The catalog looks like this:

```xml
<catalog xmlns="urn:oasis:names:tc:entity:xmlns:xml:catalog">

  <public
      publicId="-//FOO"
      uri="./foo.dtd" />

</catalog>
```

and in vscode `settings.json` you must register your `catalog.xml` like this:

```json
"xml.catalogs": [
   "catalog.xml"
]
```

You can also register the catalog using its absolute path:

| Windows                            | MacOS                        | Linux                       |
| ---------------------------------- | ---------------------------- | --------------------------- |
| `C:\\Users\\path\\to\\catalog.xml` | `/Users/path/to/catalog.xml` | `/home/path/to/catalog.xml` |
