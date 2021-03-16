import { window } from "vscode";
import { CloseAction, ErrorAction, ErrorHandler, Message } from "vscode-languageclient";

/**
 * An error handler that restarts the language server,
 * unless it has been restarted 5 times in the last 3 minutes
 *
 * Adapted from [vscode-java](https://github.com/redhat-developer/vscode-java)
 */
export class ClientErrorHandler implements ErrorHandler {

  private restarts: number[];
  private name: string;

  constructor(name: string) {
    this.name = name;
    this.restarts = [];
  }

  error(_error: Error, _message: Message, _count: number): ErrorAction {
    return ErrorAction.Continue;
  }

  closed(): CloseAction {
    this.restarts.push(Date.now());
    if (this.restarts.length < 5) {
      return CloseAction.Restart;
    } else {
      const diff = this.restarts[this.restarts.length - 1] - this.restarts[0];
      if (diff <= 3 * 60 * 1000) {
        window.showErrorMessage(`The ${this.name} language server crashed 5 times in the last 3 minutes. The server will not be restarted.`);
        return CloseAction.DoNotRestart;
      }
      this.restarts.shift();
      return CloseAction.Restart;
    }
  }

}
