import { TelemetryService, getRedHatService } from "@redhat-developer/vscode-redhat-telemetry";
import { ExtensionContext } from "vscode";

/**
 * Wrap vscode-redhat-telemetry to suit vscode-xml
 */
export namespace Telemetry {

  export const OPEN_JAVA_DOWNLOAD_LINK_EVT = "xml.open.java.download.link";
  export const OPEN_PROXY_CONFIG_DOCS_EVT = "xml.open.proxy.config.docs.link";
  export const SETTINGS_EVT = "xml.settings";
  export const BINARY_DOWNLOAD_EVT = "xml.binary.download";

  export const BINARY_DOWNLOAD_STATUS_PROP = "status";

  export const BINARY_DOWNLOAD_SUCCEEDED = "succeeded";
  export const BINARY_DOWNLOAD_FAILED = "failed";
  export const BINARY_DOWNLOAD_ABORTED = "aborted";

  let _telemetryManager: TelemetryService = null;

  /**
   * Starts the telemetry service
   *
   * @returns when the telemetry service has been started
   * @throws Error if the telemetry service has already been started
   */
  export async function startTelemetry(context: ExtensionContext): Promise<void> {
    if (!!_telemetryManager) {
      throw new Error("The telemetry service for vscode-xml has already been started")
    }
    const redhatService =await getRedHatService(context);
    _telemetryManager = await redhatService.getTelemetryService();
    return _telemetryManager.sendStartupEvent();
  }

  /**
   * Send a telemetry event with the given name and data
   *
   * @param eventName the name of the telemetry event
   * @param data the telemetry data
   * @throws Error if the telemetry service has not been started yet
   */
  export async function sendTelemetry(eventName: string, data?: any): Promise<void> {
    if (!_telemetryManager) {
      throw new Error("The telemetry service for vscode-xml has not been started yet");
    }
    return _telemetryManager.send({
      name: eventName,
      properties: data
    });
  }

}
