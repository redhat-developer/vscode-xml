# Data collection

vscode-xml has opt-in telemetry collection, provided by [vscode-redhat-telemetry](https://github.com/redhat-developer/vscode-redhat-telemetry).

## What's included in the vscode-xml telemetry data

 * JVM information:
    * Whether LemMinX is being run with Java or as a GraalVM native image (binary)
    * The name of the vm (`java.vm.name`)
    * The name of the runtime (`java.runtime.name`)
    * The version of the JVM (`java.version`)
    * The free, total, and max VM memory
 * LemMinX Version information:
    * The server version number
 * Does NOT include the `JAVA_HOME` environment variable for privacy reasons
 * The value of the `xml.server.preferBinary` setting
 * A telemetry event is sent every time the binary server download succeeds, fails, or is stopped by the user
    * If the download fails, the associated error is attached to the telemetry event
 * A telemetry event is sent every time you click the "Open Proxy Configuration Documentation" link that is provided when the language server binary download fails due to a proxy related issue.
 * A telemetry event is sent every time you click the "Download Java" link that appears when you have [LemMinX extensions](./docs/Extensions.md) installed but don't have Java installed.
 * A telemetry event is sent every time the Java XML language server crashes due to an Out Of Memory Error, which also contains the maximum heap space for the JVM (-Xmx) that you've set.
 * A telemetry event is sent every time you click on the link to the documentation that appears after the Java XML language server crashes due to an Out Of Memory Error.
 * Text Document Information
   * When a document is opened :
      * The file extension (eg. `xml`, `xsd`, `dtd`)
      * The associated grammar types (eg. `none`, `doctype`, `xml-model`, `xsi:schemaLocation`, `xsi:noNamespaceSchemaLocation`)
      * The resolver used to resolve the grammar identifier (eg. `catalog`, `file association`, `embedded catalog.xsd`, `embedded xml.xsd`, `embedded xslt.xsd`)

## What's included in the general telemetry data

Please see the
[vscode-redhat-telemetry data collection information](https://github.com/redhat-developer/vscode-redhat-telemetry/blob/HEAD/USAGE_DATA.md#usage-data-being-collected-by-red-hat-extensions)
for information on what data it collects.

## How to opt in or out

Use the `redhat.telemetry.enabled` setting in order to enable or disable telemetry collection.
