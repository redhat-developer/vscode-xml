/**
 * Interface for APIs exposed from the extension.
 *
 * @remarks
 * A sample code to use these APIs are as following:
 * const ext = await vscode.extensions.getExtension('redhat.vscode-xml').activate();
 * ext.addXMLCatalogs(...);
 * ext.removeXMLCatalogs(...);
 * ext.addXMLFileAssociations(...);
 * ext.removeXMLFileAssociations(...);
 */
export interface XMLExtensionApi {
  /**
   * Adds XML Catalogs in addition to the catalogs defined in the settings.json file.
   *
   * @remarks
   * An example is to call this API:
   * ```ts
   * addXMLCatalogs(['path/to/catalog.xml', 'path/to/anotherCatalog.xml'])
   * ```
   * @param catalogs - A list of path to XML catalogs
   * @returns None
   */
  addXMLCatalogs(catalogs: string[]): void;
  /**
   * Removes XML Catalogs from the extension.
   *
   * @remarks
   * An example is to call this API:
   * ```ts
   * removeXMLCatalogs(['path/to/catalog.xml', 'path/to/anotherCatalog.xml'])
   * ```
   * @param catalogs - A list of path to XML catalogs
   * @returns None
   */
  removeXMLCatalogs(catalogs: string[]): void;
  /**
   * Adds XML File Associations in addition to the catalogs defined in the settings.json file.
   *
   * @remarks
   * An example is to call this API:
   * ```ts
   * addXMLFileAssociations([{
   *    "systemId": "path/to/file.xsd",
   *    "pattern": "file1.xml"
   *  },{
   *    "systemId": "http://www.w3.org/2001/XMLSchema.xsd",
   *    "pattern": "file2.xml"
   *  }])
   * ```
   * @param fileAssociations - A list of file association
   * @returns None
   */
  addXMLFileAssociations(fileAssociations: XMLFileAssociation[]): void;
  /**
   * Removes XML File Associations from the extension.
   *
   * @remarks
   * An example is to call this API:
   * ```ts
   * removeXMLFileAssociations([{
   *    "systemId": "path/to/file.xsd",
   *    "pattern": "file1.xml"
   *  },{
   *    "systemId": "http://www.w3.org/2001/XMLSchema.xsd",
   *    "pattern": "file2.xml"
   *  }])
   * ```
   * @param fileAssociations - A list of file association
   * @returns None
   */
  removeXMLFileAssociations(fileAssociations: XMLFileAssociation[]): void;

}

/**
 * Interface for the FileAssociation shape.
 * @param systemId - The path to a valid XSD.
 * @param pattern - The file pattern associated with the XSD.
 *
 * @returns None
 */
export interface XMLFileAssociation {
  systemId: string,
  pattern: string;
}