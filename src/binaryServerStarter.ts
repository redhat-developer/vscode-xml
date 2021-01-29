import { createHash, Hash } from 'crypto';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as os from 'os';
import * as path from 'path';
import { Readable } from 'stream';
import { commands, ExtensionContext, extensions, window, WorkspaceConfiguration } from "vscode";
import { Executable } from "vscode-languageclient";
import * as yauzl from 'yauzl';
import { addTrustedHash, getTrustedHashes } from './binaryHashManager';
import { getXMLConfiguration } from "./settings";
const glob = require('glob');

const HTTPS_PATTERN: RegExp = /^https:\/\//;
const JAR_ZIP_AND_HASH_REJECTOR: RegExp = /(?:\.jar)|(?:\.zip)|(?:\.sha256)$/;

/**
 * Returns the executable to launch LemMinX (the XML Language Server) as a binary
 *
 * @param context the extension context
 * @throws if the binary doesn't exist and can't be downloaded, or if the binary is not trusted
 * @returns Returns the executable to launch LemMinX (the XML Language Server) as a binary
 */
export async function prepareBinaryExecutable(context: ExtensionContext): Promise<Executable> {
  const binaryOptions: string = getXMLConfiguration().get("server.binary.args");
  let binaryExecutable: Executable;
  return getServerBinaryPath()
    .then((binaryPath: string) => {
      binaryExecutable = {
        args: [binaryOptions],
        command: binaryPath
      } as Executable;
      return binaryPath;
    })
    .then(checkBinaryHash)
    .then((hashOk: boolean) => {
      if (hashOk) {
        return binaryExecutable;
      } else {
        throw new Error("The binary XML language server is not trusted");
      }
    });
}

/**
 * Returns the path to the LemMinX binary
 *
 * Downloads it if it is missing
 *
 * @returns The path to the LemMinX binary
 * @throws If the LemMinX binary can't be located or downloaded
 */
async function getServerBinaryPath(): Promise<string> {
  const config: WorkspaceConfiguration = getXMLConfiguration();
  let binaryPath: string = config.get("server.binary.path");
  if (binaryPath) {
    if (fs.existsSync(binaryPath)) {
      return Promise.resolve(binaryPath);
    }
    window.showErrorMessage('The specified XML language server binary could not be found. Using the default binary...');
  }
  let server_home: string = path.resolve(__dirname, '../server');
  let binaries: Array<string> = glob.sync(`**/${getServerBinaryNameWithoutExtension()}*`, { cwd: server_home });
  binaries = binaries.filter((path) => { return !JAR_ZIP_AND_HASH_REJECTOR.test(path) });
  if (binaries.length) {
    return Promise.resolve(path.resolve(server_home, binaries[0]));
  }
  // Download it, then return the downloaded binary's location
  return downloadBinary();
}

/**
 * Downloads LemMinX binary under the `server` directory and returns the path to the binary as a Promise
 *
 * @returns The path to the LemMinX binary
 * @throws If the LemMinX binary download fails
 */
async function downloadBinary(): Promise<string> {
  const downloadPromise: Promise<string> = new Promise((resolve, reject) => {
    const handleResponse = (response: http.IncomingMessage) => {
      const statusCode = response.statusCode;
      if (statusCode === 303) {
        httpHttpsGet(response.headers.location, handleResponse)
          .on('error', (e) => {
            reject(`Server binary download failed: ${e.message}`);
          });
      } else if (statusCode === 200) {
        if (/^application\/zip$/.test(response.headers['content-type'])) {
          acceptZipDownloadResponse(response).then(resolve, reject);
        } else {
          // Not a ZIP, assume its a binary
          acceptBinaryDownloadResponse(response).then(resolve, reject);
        }
      } else {
        reject(`Server binary download failed: status code ${statusCode}`);
      }
    }
    httpHttpsGet(`${getServerBinaryDownloadUrl()}`, handleResponse)
      .on('error', (e) => {
        reject(`Server binary download failed: ${e.message}`);
      });
  });
  window.setStatusBarMessage('Downloading XML language server binary...', downloadPromise);
  return downloadPromise;
}

/**
 * Returns true if the hash of the binary matches the expected hash and false otherwise
 *
 * @param binaryPath the path to the binary to check
 * @returns true if the hash of the binary matches the expected hash and false otherwise
 */
async function checkBinaryHash(binaryPath: string): Promise<boolean> {
  const hash: Hash = createHash('sha256');
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(binaryPath), (err, fileContents) => {
      if (err) {
        reject(err)
      };
      resolve(fileContents);
    });
  })
    .then((fileContents: string) => {
      hash.update(fileContents);
      const hashDigest: string = hash.digest('hex').toLowerCase();
      let expectedHashPath: string = path.resolve(path.dirname(binaryPath), `${getServerBinaryNameWithoutExtension()}.sha256`);
      if (!fs.existsSync(expectedHashPath)) {
        expectedHashPath = path.resolve(__dirname, `../${getServerBinaryNameWithoutExtension()}.sha256`);
      }
      if (getTrustedHashes().includes(hashDigest)) {
        return true;
      }
      if (!fs.existsSync(expectedHashPath)) {
        return askIfTrustsUnrecognizedBinary(hashDigest, binaryPath);
      }
      const expectedHash = fs.readFileSync(expectedHashPath).toString('utf-8').toLowerCase().split(' ')[0].trim();
      if (hashDigest === expectedHash) {
        return true;
      }
      return askIfTrustsUnrecognizedBinary(hashDigest, binaryPath);
    })
    .catch((err: any) => {
      return false;
    });
}

/**
 * Returns the name of the server binary file for the current OS and architecture
 *
 * @return the name of the server binary file for the current OS and architecture
 */
function getServerBinaryNameWithoutExtension(): string {
  switch (os.platform()) {
    case 'darwin':
      // FIXME: once we support Apple ARM, incorporate the architecture into this string
      return 'lemminx-osx-x86_64';
    default:
      return `lemminx-${os.platform}`;
  }
}

/**
 * Returns the extension of the binary server for the current OS
 *
 * @return the extension of the binary server for the current OS
 */
function getServerBinaryExtension(): string {
  switch (os.platform()) {
    case 'win32':
      return '.exe';
    default:
      return '';
  }
}

/**
 * Returns the URL of the server where the binary version of LemMinX should be downloaded from
 *
 * @return the URL of the server where the binary version of LemMinX should be downloaded from
 */
function getServerBinaryDownloadUrl(): string {
  return extensions.getExtension("redhat.vscode-xml").packageJSON['binaryServerDownloadUrl'][getServerBinaryNameWithoutExtension().substring(8)] as string;
}

/**
 * Returns true if the user decides to trust the binary, and false if they ignore the message or don't trust the binary
 *
 * @returns true if the user decides to trust the binary, and false if they ignore the message or don't trust the binary
 */
async function askIfTrustsUnrecognizedBinary(hash: string, path: string): Promise<boolean> {
  const YES: string = 'Yes';
  const NO: string = 'No';
  return window.showErrorMessage(`The server binary ${path} is not trusted. `
      + 'Running the file poses a threat to your system\'s security. '
      + 'Do you want to add this binary to the list of trusted binaries and run it?', YES, NO)
    .then((val: string) => {
      if (val === YES) {
        addTrustedHash(hash);
        return true;
      }
      return false;
    });
}

/**
 * Performs https.get if the url begins with "https://", and performs http.get otherwise
 *
 * @param url The url get
 * @param callback The callback function to handle the URL request
 * @return the client request generated by https.get or http.get
 */
function httpHttpsGet(url: string, callback: (response: http.IncomingMessage) => void): http.ClientRequest {
  if (HTTPS_PATTERN.test(url)) {
    return https.get(url, callback);
  }
  return http.get(url, callback);
}

/**
 * Unzips the contents of the response and writes the contained file to a local file, marks the file as executable, and returns the path to the file
 *
 * @param response The response to write to file
 * @returns the path to the extracted file
 * @throws error if there are multiple files in the zip archive or if the file can't be extracted
 */
async function acceptZipDownloadResponse(response: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const serverBinaryPath: string = path.resolve(__dirname, '../server', getServerBinaryNameWithoutExtension() + getServerBinaryExtension());
    const serverBinaryZipPath: string = serverBinaryPath + '.zip';
    const serverBinaryZipWriteStream: fs.WriteStream = fs.createWriteStream(serverBinaryZipPath);
    serverBinaryZipWriteStream.on('finish', () => {
      serverBinaryZipWriteStream.close();
    });
    serverBinaryZipWriteStream.on('close', () => {
      const serverBinaryWriteStream: fs.WriteStream = fs.createWriteStream(serverBinaryPath);
      yauzl.open(serverBinaryZipPath, { lazyEntries: true }, (err: Error, zipFile: yauzl.ZipFile) => {
        if (!!err) {
          reject(err);
        }
        zipFile.readEntry();
        if (zipFile.entryCount !== 1) {
          reject(new Error('More than 1 file in the downloaded zip of the binary server'));
        };
        zipFile.on('entry', (entry: yauzl.Entry) => {
          zipFile.openReadStream(entry, (err: Error, stream: Readable) => {
            if (!!err) {
              reject(err);
            }
            stream.pipe(serverBinaryWriteStream);
          });
        });
      });
      serverBinaryWriteStream.on('finish', () => {
        serverBinaryWriteStream.close();
      });
      serverBinaryWriteStream.on('close', () => {
        fs.chmodSync(serverBinaryPath, "766");
        fs.unlinkSync(serverBinaryZipPath);
        resolve(serverBinaryPath);
      });
    });
    response.pipe(serverBinaryZipWriteStream);
  });
}

/**
 * Writes the contents of the response to a file, marks it as executable, and returns the path to the file
 *
 * @param response The response to write to file
 * @returns the path to the file
 */
async function acceptBinaryDownloadResponse(response: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const serverBinaryPath: string = path.resolve(__dirname, '../server', getServerBinaryNameWithoutExtension() + getServerBinaryExtension());
    const serverBinaryFileStream = fs.createWriteStream(serverBinaryPath);
    serverBinaryFileStream.on('finish', () => {
      serverBinaryFileStream.close();
    });
    serverBinaryFileStream.on('close', () => {
      fs.chmodSync(serverBinaryPath, "766");
      resolve(serverBinaryPath);
    });
    response.pipe(serverBinaryFileStream);
  })
}