# XML Embedded Languages Features

XML embedded languages support provides syntax highlighting for embedded language content (e.g., Groovy, SQL, JavaScript) inside XML text and CDATA nodes using TextMate grammars.

This feature uses the `xml.embeddedLanguages` setting with XPath expressions to identify which XML nodes contain embedded code, and the `languageId` to specify which language grammar to use for tokenization.

## How it works

1. You define XPath expressions that match text/CDATA nodes containing embedded code
2. You specify the `languageId` (e.g., `groovy`, `sql`, `javascript`)
3. The TextMate grammar is automatically resolved from installed VS Code extensions
4. LSP semantic tokens are used to provide syntax highlighting

## Groovy in XML workflow files

Given this XML workflow file with Groovy code inside CDATA sections:

```xml
<workflow workflowId="demo.validationCheck">
    <scriptsInclude><![CDATA[
        def renderUiUrl() {
          return programContext.renderDefaultTaskUrl()
        }
    ]]></scriptsInclude>
    <start id="start">
        <handlerScript><![CDATA[
          programContext.setProjectState("ELIGIBILITY_CHECK", "VALIDATION")
          return true
        ]]></handlerScript>
    </start>
</workflow>
```

You can enable Groovy syntax highlighting in these CDATA sections with the following setting:

```json
"xml.embeddedLanguages": [
   {
      "pattern": "**/workflow.xml",
      "expressions": [
         {
            "xpath": "//scriptsInclude/text()",
            "languageId": "groovy"
         },
         {
            "xpath": "//handlerScript/text()",
            "languageId": "groovy"
         }
      ]
   }
]
```

## SQL in MyBatis mapper files

Given a MyBatis mapper XML file with SQL inside text nodes:

```xml
<mapper namespace="com.example.UserMapper">
    <select id="findUser" resultType="User">
        SELECT id, name, email
        FROM users
        WHERE id = #{id}
    </select>
    <insert id="insertUser">
        INSERT INTO users (name, email)
        VALUES (#{name}, #{email})
    </insert>
</mapper>
```

You can enable SQL syntax highlighting with:

```json
"xml.embeddedLanguages": [
   {
      "pattern": "**/*Mapper.xml",
      "expressions": [
         {
            "xpath": "mapper/select/text()",
            "languageId": "sql"
         },
         {
            "xpath": "mapper/insert/text()",
            "languageId": "sql"
         },
         {
            "xpath": "mapper/update/text()",
            "languageId": "sql"
         },
         {
            "xpath": "mapper/delete/text()",
            "languageId": "sql"
         }
      ]
   }
]
```

## JavaScript and CSS in XHTML

Given an XHTML file with embedded JavaScript and CSS:

```xml
<html xmlns="http://www.w3.org/1999/xhtml">
   <head>
      <style type="text/css">
         body { color: red; }
      </style>
   </head>
   <body>
      <script type="text/javascript">
         var x = document.getElementById("demo");
      </script>
   </body>
</html>
```

You can enable syntax highlighting for both languages:

```json
"xml.embeddedLanguages": [
   {
      "pattern": "**/*.xhtml",
      "expressions": [
         {
            "xpath": "//script/text()",
            "languageId": "javascript"
         },
         {
            "xpath": "//style/text()",
            "languageId": "css"
         }
      ]
   }
]
```

## Using Document Matcher

Like `xml.colors` and `xml.references`, the `xml.embeddedLanguages` setting supports [Document Matcher](../DocumentMatcher.md) criteria for more precise document matching beyond file patterns:

```json
"xml.embeddedLanguages": [
   {
      "pattern": "**/*.xml",
      "rootElement": ["workflow"],
      "expressions": [
         {
            "xpath": "//handlerScript/text()",
            "languageId": "groovy"
         }
      ]
   }
]
```

Available Document Matcher properties:

| Property | Description |
|---|---|
| `pattern` | File name pattern (glob syntax) |
| `namespaceURI` | Root element namespace URI patterns |
| `rootElement` | Root element name patterns |
| `publicId` | DOCTYPE public ID patterns |
| `systemId` | DOCTYPE system ID patterns |
| `grammarURI` | Resolved grammar URI patterns |

## Custom TextMate grammar

By default, the TextMate grammar is automatically resolved from installed VS Code extensions based on the `languageId`. If a language is not available as a VS Code extension, you can specify the grammar path manually:

```json
"xml.embeddedLanguages": [
   {
      "pattern": "**/*.xml",
      "expressions": [
         {
            "xpath": "//code/text()",
            "languageId": "mylang",
            "grammarPath": "/path/to/mylang.tmLanguage.json"
         }
      ]
   }
]
```

## Supported token types

The following LSP semantic token types are used for embedded language highlighting:

| Token Type | TextMate Scope |
|---|---|
| Comment | `comment.*` |
| Keyword | `keyword.*`, `storage.type`, `storage.modifier` |
| String | `string.*` |
| Number | `constant.numeric` |
| Function | `entity.name.function`, `support.function` |
| Class | `entity.name.type`, `entity.name.class`, `support.class` |
| Variable | `variable.*`, `constant.character`, `constant.language` |
| Operator | `keyword.operator`, `punctuation.*` |
| Namespace | `entity.name.namespace`, `entity.name.module` |
| Parameter | `variable.parameter` |
| Regexp | `string.regexp` |
