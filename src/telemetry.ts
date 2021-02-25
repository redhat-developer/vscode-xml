import { getTelemetryService, TelemetryEvent, TelemetryService } from "@redhat-developer/vscode-redhat-telemetry/lib";

/**
 * Wrap vscode-redhat-telemetry to suit vscode-xml
 */
export namespace Telemetry {

  export const OPEN_JAVA_DOWNLOAD_LINK_EVT: string = "open_java_download_link";
  export const SETTINGS_EVT: string = "settings";
  export const BINARY_DOWNLOAD_SUCCEEDED_EVT: string = "binary_download_succeeded";
  export const BINARY_DOWNLOAD_FAILED_EVT: string = "binary_download_failed";

  let _telemetryManager: TelemetryService = null;

  /**
   * Starts the telemetry service
   *
   * @returns when the telemetry service has been started
   * @throws Error if the telemetry service has already been started
   */
  export async function startTelemetry(): Promise<void> {
    if (!!_telemetryManager) {
      throw new Error("The telemetry service for vscode-xml has already been started")
    }
    _telemetryManager = await getTelemetryService("redhat.vscode-xml");
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