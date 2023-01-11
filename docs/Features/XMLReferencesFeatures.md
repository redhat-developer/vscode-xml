# XML References Features

XML References support provides the capability to reference a DOM node (attribute or text) to an another DOM node (attribute or text) with the `xml.references` settings by using XPath expression : 

 * `foo/@attr` defines the `attr` attribute node of the `foo` element.
 * `foo/text()` defines the text node of the `foo` element.
 
Once you have declared those reference, you will benefit with completion, definition, highlight, validation, rename, find references, and show references count with codelens:

![XML References with TEI](../images/Features/XMLReferencesWithTEI.gif)

## Attribute node references (foo/@attr)

Given this [docbook](https://docbook.org/) XML file sample:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE book PUBLIC "-//OASIS//DTD DocBook XML V4.4//EN" "http://www.docbook.org/xml/4.4/docbookx.dtd">
<book>
    <chapter id="chapter-1">

        <xref linkend="chapter-1" />

    </chapter>

    <chapter id="chapter-2">

    </chapter>
</book>
```

At first, please note that [resolve external entities](https://github.com/redhat-developer/vscode-xml/blob/main/docs/Validation.md#resolve-external-entities) must be enabled for this DTD to work.

In this sample, `linkend` attribute in `<xref linkend="chapter-1" />` references the `chapter-1` declared in `<chapter id="chapter-1">`. [vscode-xml](https://github.com/redhat-developer/vscode-xml) provides a completion, definition, highlighting support to support this kind of references easily with the `xml.references` settings. For docbook case, you can declare this settings:

```json
  "xml.references": [
    {
      "pattern": "**/*.xml",
      "expressions": [
        {
          "from": "xref/@linkend",
          "to": "@id"
        }
      ]
    }
  ]
```

After saving this setting, you will get completion, go to definition, and highlighting for `xref` in the docbook file:

![XML References with docbook](../images/Features/XMLReferencesWithDocbook.gif)

The `xml.references` settings is an array of objects with the following properties:

 * `pattern`:  matches the files that reference declared with `expressions` applies to. See [glob syntax](https://docs.oracle.com/javase/tutorial/essential/io/fileOps.html#glob) for more information about the pattern syntax.
 * `prefix (optional)`: the prefix to use (ex : '#')  for from for all the declared reference expressions.
 * `multiple (optional)`: true if the from attribute, text can declare several from references and false otherwise for all the declared reference expressions. 
 * `expressions`: array of reference expression:
    * `prefix (optional)`: the prefix to use (ex : '#')  for from.
    * `multiple (optional)`: true if the from attribute, text can declare several from references and false otherwise.    
    * `from`: the from reference DOM node (attribute, text) declared with XPath (ex: `foo/@attr`, `foo/text()`).
    * `to`: the to reference DOM node (attribute, text) declared with XPath (ex: `foo/@attr`, `foo/text()`).
 
### prefix

Given this [TEI](https://tei-c.org/) XML file sample:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<?xml-model href="http://www.tei-c.org/release/xml/tei/custom/schema/relaxng/tei_lite.rng" type="application/xml" schematypens="http://relaxng.org/ns/structure/1.0"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <teiHeader>  
    <fileDesc>
      <titleStmt>
        <title>Title</title>
      </titleStmt>
      <publicationStmt>
        <p>Publication information</p>  
      </publicationStmt>
      <sourceDesc>
        <p>Information about the source</p>
      </sourceDesc>
    </fileDesc>
  </teiHeader>
  <text>
    <body xml:id="body-id">
      <p xml:id="p-id" >Some text here.</p>
      <anchor corresp="#body-id"></anchor>
    </body>
  </text>
</TEI>
```

In this sample, `corresp` attribute in `<anchor corresp="#body-id"></anchor>` references the `body-id` (without `#`) declared in `<body xml:id="body-id">`. It means that the `corresp` attribute value (with `#`) reference `@xml:id` attribute (without `#`). To support that, you can configure settings by using `prefix`:

```json
"xml.references": [
    {
      "pattern": "**/*.xml",
      "prefix": "#",      
      "expressions": [
        {
          "from": "@resp",
          "to": "persName/@xml:id"
        },
        {
          "from": "@corresp",
          "to": "@xml:id"
        }
      ]
    }
  ]
```
## Multiple target

 If the `origin` attribute (which matches the `from` reference path) declares multiple targets  (which matches the `to` reference path), you can use `multiple` 
 
 Given this XML file where `target` attribute defines several targets separated with whitespace (#body-id #p-id):
 
 ```xml
 <body xml:id="body-id">
   <p xml:id="p-id" >Some text here.</p>
   <link target="#body-id #p-id"></link>
 </body>
 ```

In this sample, `target` attribute in `<link target="#body-id #p-id"></link>` references the `body-id` and `p-id` (without `#`) declared in `<body xml:id="body-id">` and `<p xml:id="p-id" >`. It means that the `target` attribute value (with `#`) reference `@xml:id` attribute (without `#`). To support that, you can configure settings by using `multiple`:

```json
"xml.references": [
    {
      "pattern": "**/*.xml",
      "prefix": "#",
      "multiple": true,
      "expressions": [
        {
          "from": "link/@target",
          "to": "@xml:id"
        }
      ]
    }
  ]
```

## Text node references (foo/text())

Given this *web.xml* sample:

```xml
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee http://xmlns.jcp.org/xml/ns/javaee/web-app_3_1.xsd"
  version="3.1">
  <servlet>
    <servlet-name>comingsoon</servlet-name>
    <servlet-class>mysite.server.ComingSoonServlet</servlet-class>
  </servlet>
  <servlet-mapping>
    <servlet-name>comingsoon</servlet-name>
    <url-pattern>/*</url-pattern>
  </servlet-mapping>
</web-app>
```

In this sample, `servlet-mapping/servlet-name` text in `<servlet-name>comingsoon</servlet-name>` references the `comingsoon` declared in ``servlet/servlet-name` text. To support that, you can configure settings like this:

```json
  "xml.references": [
    {
      "pattern": "**/web.xml",
      "expressions": [
        {
          "from": "servlet-mapping/servlet-name/text()",
          "to": "servlet/servlet-name/text()"
        }
      ]
    }
  ]
```

![XML References with web.xml](../images/Features/XMLReferencesWithWebXML.gif)

### Limitation

XML references have some limitation:

 * *references works only for a given XML file*: it is not possible to reference some DOM nodes coming from another XML files. However if the file uses include (like xi:include) the reference will only work in the file which has the include statement, and not in the file being included.
 
 If you need those support, please [create an issue](https://github.com/redhat-developer/vscode-xml/issues)