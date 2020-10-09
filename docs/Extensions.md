# Extensions

## Custom XML Extensions

The [LemMinX - XML Language Server](https://github.com/eclipse/lemminx) can be extended to support custom completion, hover, validation, rename, etc by using the [Java Service Provider Interface (SPI)](https://www.baeldung.com/java-spi) mechanism.
vscode-xml provides the ability to use your custom XML support provider, by adding external jars to the XML language server's classpath.

To do that:

 * create a Java project which provides a custom XML extension providing your custom completion, hover, validation, rename, etc:
 * create the XML extension like [MavenLemminxExtension](https://github.com/eclipse/lemminx-maven/blob/master/lemminx-maven/src/main/java/org/eclipse/lemminx/extensions/maven/MavenLemminxExtension.java).
 * register your custom completion participant in the XML extension like [MavenCompletionParticipant](https://github.com/eclipse/lemminx-maven/blob/master/lemminx-maven/src/main/java/org/eclipse/lemminx/extensions/maven/MavenCompletionParticipant.java#L75)
 * register your custom XML extension with [Java Service Provider Interface (SPI)](https://www.baeldung.com/java-spi) mechanism in the [/META-INF/services/org.eclipse.lemminx.services.extensions.IXMLExtension](https://github.com/eclipse/lemminx-maven/blob/master/lemminx-maven/src/main/resources/META-INF/services/org.eclipse.lemminx.services.extensions.IXMLExtension) file.
 * build a JAR `your-custom-xml-extension.jar`.
 * create a `vscode extension` which embeds the `your-custom-xml-extension.jar` JAR and declares this JAR path in the `package.json`:

```json
"contributes": {
  "xml.javaExtensions": [
    "./jar/your-custom-xml-extension.jar"
  ]
}
```

  * You can also list multiple jars or use glob patterns to specify the jars:

```json
"contributes": {
  "xml.javaExtensions": [
    "./jar/dependencies/*.jar",
    "./jar/my-xml-extension.jar"
  ]
}
```

You can see the [vscode-xml-maven](https://github.com/angelozerr/vscode-xml-maven) sample which registers custom maven completion [MavenCompletionParticipant](https://github.com/eclipse/lemminx-maven/blob/master/lemminx-maven/src/main/java/org/eclipse/lemminx/extensions/maven/MavenCompletionParticipant.java#L210) for scope:

![demo of vscode xml maven suggesting different scopes for a dependency](./images/vscode-xml-maven.gif)

## XML extension API (TypeScript)

See [PR 292](https://github.com/redhat-developer/vscode-xml/pull/292)

### Commands

`xml.workspace.executeCommand` - command registered on VSCode client (via **vscode-xml** extension) to let other extensions execute commands on XML Language server

`xml/executeClientCommand` - XML Language server LSP extension to let XML LS extenders execute commands on the client. The command is made available via `IXMLCommandService` on the server side. See [XML LS extensions docs](https://github.com/eclipse/lemminx/blob/master/docs/LemMinX-Extensions.md#xml-language-server-services-available-for-extensions)
