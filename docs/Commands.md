# Commands

[vscode-xml](https://github.com/redhat-developer/vscode-xml) provides several vscode commands which are available with `Ctrl+Shift+P`.

![XML Commands](images/Commands/XMLCommands.png)

## Open XML Documentation

This command opens the `XML Documentation`

## Revalidate current XML file

This command re-triggers the [XML Validation](Validation.md#xml-validation) for the current file.

When the [Server Cache Path](Preferences.md#server-cache-path) is activated, the command removes the referenced XSD, DTD grammar from the local cache.

## Revalidate all open XML files

This command re-triggers the [XML Validation](Validation.md#xml-validation) for the all opened XML files.

When the [Server Cache Path](Preferences.md#server-cache-path) is activated, the command clear remote grammar cache and revalidate all opened files.