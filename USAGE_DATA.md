# Data collection

vscode-xml has opt-in telemetry collection, provided by [vscode-commons](https://github.com/redhat-developer/vscode-commons).

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
 * A telemetry event is sent every time the binary server download succeeds
 * A telemetry event is sent every time the binary server download fails
 * A telemetry event is sent every time you click the "Download Java" link that appears when you have [LemMinX extensions](./docs/Extensions.md) installed but don't have Java installed.

## What's included in the general telemetry data

Please see the
[vscode-commons data collection information](https://github.com/redhat-developer/vscode-commons/blob/master/USAGE_DATA.md#other-extensions)
for information on what data it collects.

## How to opt in or out

Use the `redhat.telemetry.enabled` setting in order to enable or disable telemetry collection.