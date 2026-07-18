import { Plugin } from 'obsidian';
import { EverAISettings, DEFAULT_SETTINGS } from './settings';
import { registerCommands } from './commands';
import { EverAISettingTab } from './ui/settings-tab';
import { BackendClient } from './backend/client';

/**
 * EverAI Plugin - Main entry point
 * 
 * Responsibilities:
 * - Plugin lifecycle management (onload, onunload)
 * - Settings initialization and persistence
 * - Command registration
 * - Backend client initialization
 */
export default class EverAIPlugin extends Plugin {
	settings!: EverAISettings;
	backendClient!: BackendClient;

	/**
	 * Plugin load hook - called when Obsidian loads the plugin
	 */
	async onload(): Promise<void> {
		console.log('EverAI: Loading plugin...');

		// Initialize settings from saved data or use defaults
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<EverAISettings>,
		);

		// Initialize backend client
		this.backendClient = new BackendClient(this.settings.backendUrl);

		// Register all commands
		registerCommands(this);

		// Register settings tab
		this.addSettingTab(new EverAISettingTab(this.app, this));

		console.log('EverAI: Plugin loaded successfully');
	}

	/**
	 * Plugin unload hook - called when Obsidian unloads the plugin
	 * Cleanup all listeners and resources
	 */
	async onunload(): Promise<void> {
		console.log('EverAI: Unloading plugin...');
		// All registered event listeners and DOM listeners are automatically cleaned up
		// by Obsidian's plugin system via register* helpers
	}

	/**
	 * Save settings to persistent storage
	 */
	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
