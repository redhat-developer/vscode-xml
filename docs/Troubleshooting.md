# Troubleshooting

## Issues

Please create [vscode-xml issues](https://github.com/redhat-developer/vscode-xml/issues) for any problem.

### No support on xml file.

Sometimes an old instance of the XML Language Server is still running.

You can check if the server is not working in VSCode by going to:
 1) Turning on `xml.trace.server` in the VSCode preferences
 2) `View -> Output -> XML Support` (drop down menu top right)
    If it is not working it will indicate the server has Shutdown.

You can kill the process by:

 1) Run `jps` command in terminal
 2) Check if multiple instances of `org.eclipse.lemminx-uber.jar` or `XMLServerLauncher`
 3) According to your OS:

  * on Windows OS: run `taskkill /F /PID ...` all instances
  * on other OS: run `kill -9 ...` all instances
