/**
 *  Copyright (c) 2025 Red Hat, Inc. and others.
 *  All rights reserved. This program and the accompanying materials
 *  are made available under the terms of the Eclipse Public License v2.0
 *  which accompanies this distribution, and is available at
 *  https://www.eclipse.org/legal/epl-v20.html
 *
 *  Contributors:
 *  Red Hat Inc. - initial API and implementation
 */
import * as assert from 'assert';
import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import { tmpdir } from 'os';
import * as path from 'path';

suite('Smoke tests', function () {

  this.timeout(10_000);

  // diagnostics take some time to appear; the language server must be started and respond to file open event
  const DIAGNOSTICS_DELAY = 6_000;

  const SCHEMA = `<?xml version="1.0" encoding="UTF-8"?>
    <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
      elementFormDefault="qualified" attributeFormDefault="unqualified">

      <xs:simpleType name="SizeType">
        <xs:union memberTypes="DressSizeType">
          <xs:annotation>
            <xs:documentation>Size Type documentation</xs:documentation>
          </xs:annotation>
          <xs:simpleType>
            <xs:restriction base="xs:token">
              <xs:enumeration value="small">
                <xs:annotation>
                  <xs:documentation>Small documentation</xs:documentation>
                </xs:annotation>
              </xs:enumeration>
              <xs:enumeration value="medium">
                <xs:annotation>
                  <xs:documentation>Medium documentation</xs:documentation>
                </xs:annotation>
              </xs:enumeration>
              <xs:enumeration value="large" />
              <xs:enumeration value="x-large">
                <xs:annotation>
                  <xs:documentation></xs:documentation>
                </xs:annotation>
              </xs:enumeration>
            </xs:restriction>
          </xs:simpleType>
        </xs:union>
      </xs:simpleType>
      <xs:simpleType name="DressSizeType">
        <xs:restriction base="xs:integer">
          <xs:minInclusive value="2" />
          <xs:maxInclusive value="18" />
        </xs:restriction>
      </xs:simpleType>

      <xs:element name="dresssize" type="SizeType" />

      <xs:element name="dress">
        <xs:complexType>
          <xs:attribute name="size" type="SizeType" />
        </xs:complexType>
      </xs:element>

    </xs:schema>
    `;

  const SCHEMA_INSTANCE = `<?xml version="1.0" encoding="UTF-8"?>
    <?xml-model href="dressSize.xsd" type="application/xml" schematypens="http://www.w3.org/2001/XMLSchema"?>
    <dresssize>purple</dresssize>
    `;

  const SCHEMA_FILENAME = "dressSize.xsd";
  const SCHEMA_INSTANCE_NAME = "references-schema.xml";

  let tempDir: string;
  let schemaPath: string;
  let schemaInstancePath: string;

  this.beforeAll(async function () {
    tempDir = tmpdir();
    schemaPath = path.join(tempDir, SCHEMA_FILENAME);
    schemaInstancePath = path.join(tempDir, SCHEMA_INSTANCE_NAME);
    await fs.appendFile(schemaPath, SCHEMA);
    await fs.appendFile(schemaInstancePath, SCHEMA_INSTANCE);
  });

  this.afterAll(async function () {
    await fs.rm(schemaPath);
    await fs.rm(schemaInstancePath);
  });

  test("instance has right diagnostics", async function () {
    const textDocument = await vscode.workspace.openTextDocument(schemaInstancePath);
    await vscode.window.showTextDocument(textDocument);
    await new Promise(resolve => setTimeout(resolve, DIAGNOSTICS_DELAY));
    const diagnostics = vscode.languages.getDiagnostics(vscode.Uri.file(schemaInstancePath));

    assert.strictEqual(diagnostics.length, 2);
    assert.strictEqual(diagnostics[0].message, "cvc-datatype-valid.1.2.3: 'purple' is not a valid value of union type 'SizeType'.", );
    assert.strictEqual(diagnostics[1].message, "cvc-type.3.1.3: The value 'purple' of element 'dresssize' is not valid.");
  });
});
