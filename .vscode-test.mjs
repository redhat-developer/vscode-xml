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
import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	files: 'out/src/test/**/*.test.js',
	workspaceFolder: 'test-workspace'
});
