/**
 *  Copyright (c) 2019 Red Hat, Inc. and others.
 *  All rights reserved. This program and the accompanying materials
 *  are made available under the terms of the Eclipse Public License v1.0
 *  which accompanies this distribution, and is available at
 *  http://www.eclipse.org/legal/epl-v10.html
 *
 *  Contributors:
 *  Red Hat Inc. - initial API and implementation
 */
'use strict';

/**
 * Commonly used commands
 */
export namespace Commands {
 
    /**
     * Auto close tags
     */
    export const AUTO_CLOSE_TAGS= 'xml.completion.autoCloseTags';

    /**
     * Show XML references
     */
    export const SHOW_REFERENCES = 'xml.show.references';

    /**
     * Show editor references
     */
    export const EDITOR_SHOW_REFERENCES = 'editor.action.showReferences';

    /**
     * Reload VS Code window
     */
    export const RELOAD_WINDOW = 'workbench.action.reloadWindow';

}