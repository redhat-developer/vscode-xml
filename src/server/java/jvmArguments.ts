/**
 *  Copyright (c) 2021 Red Hat, Inc. and others.
 *  All rights reserved. This program and the accompanying materials
 *  are made available under the terms of the Eclipse Public License v2.0
 *  which accompanies this distribution, and is available at
 *  https://www.eclipse.org/legal/epl-v20.html
 *
 *  Contributors:
 *  Red Hat Inc. - initial API and implementation
 */

/**
 * Argument that tells the program where to generate the heap dump that is created when an OutOfMemoryError is raised and `HEAP_DUMP` has been passed
 */
export const HEAP_DUMP_LOCATION = '-XX:HeapDumpPath=';

/**
 * Argument that tells the program to crash when an OutOfMemoryError is raised
 */
export const CRASH_ON_OOM = '-XX:+ExitOnOutOfMemoryError';

/**
 * Argument that tells the program to generate a heap dump file when an OutOfMemoryError is raised
 */
export const HEAP_DUMP = '-XX:+HeapDumpOnOutOfMemoryError';
