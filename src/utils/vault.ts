/**
 * Utility functions for vault integration
 * Handles file operations, searching, and note manipulation
 */

import { TFile, TFolder, App } from 'obsidian';

/**
 * Get all markdown files in vault
 */
export async function getAllMarkdownFiles(app: App): Promise<TFile[]> {
	const files: TFile[] = [];
	const markdownFiles = app.vault.getMarkdownFiles();
	return markdownFiles;
}

/**
 * Search vault for files containing text
 */
export async function searchVault(
	app: App,
	query: string
): Promise<TFile[]> {
	const results: TFile[] = [];
	const files = app.vault.getMarkdownFiles();

	for (const file of files) {
		try {
			const content = await app.vault.cachedRead(file);
			if (content.toLowerCase().includes(query.toLowerCase())) {
				results.push(file);
			}
		} catch (error) {
			console.error(`EverAI: Failed to read file ${file.path}`, error);
		}
	}

	return results;
}

/**
 * Get currently active file
 */
export function getActiveFile(app: App): TFile | null {
	const activeView = app.workspace.getActiveViewOfType(null);
	if (activeView && activeView.file instanceof TFile) {
		return activeView.file;
	}
	return null;
}

/**
 * Read file content
 */
export async function readFile(app: App, path: string): Promise<string | null> {
	try {
		const file = app.vault.getAbstractFileByPath(path);
		if (file instanceof TFile) {
			return await app.vault.cachedRead(file);
		}
		return null;
	} catch (error) {
		console.error(`EverAI: Failed to read file ${path}`, error);
		return null;
	}
}

/**
 * Write content to file
 */
export async function writeFile(
	app: App,
	path: string,
	content: string
): Promise<boolean> {
	try {
		const file = app.vault.getAbstractFileByPath(path);
		if (file instanceof TFile) {
			await app.vault.modify(file, content);
			return true;
		}
		return false;
	} catch (error) {
		console.error(`EverAI: Failed to write file ${path}`, error);
		return false;
	}
}

/**
 * Create new note
 */
export async function createNote(
	app: App,
	name: string,
	content: string = ''
): Promise<TFile | null> {
	try {
		const file = await app.vault.create(name, content);
		if (file instanceof TFile) {
			return file;
		}
		return null;
	} catch (error) {
		console.error(`EverAI: Failed to create file ${name}`, error);
		return null;
	}
}

/**
 * Get file size in bytes
 */
export function getFileSize(file: TFile): number {
	return file.stat.size;
}

/**
 * Check if file is markdown
 */
export function isMarkdownFile(file: TFile): boolean {
	return file.extension === 'md';
}
