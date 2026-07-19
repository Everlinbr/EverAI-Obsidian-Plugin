import { App, PluginSettingTab, Setting } from 'obsidian';
import EverAIPlugin from '../../main';
import { validateSettings } from '../../settings';

/**
 * EverAI Settings Tab
 * 
 * Displays plugin settings in Obsidian's settings panel.
 * Handles all user configuration for the plugin.
 */
export class EverAISettingTab extends PluginSettingTab {
	plugin: EverAIPlugin;

	constructor(app: App, plugin: EverAIPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		this.displayBackendSettings();
		this.displayModelSettings();
		this.displayFeatureSettings();
		this.displayPerformanceSettings();
		this.displayDebugSettings();
	}

	private displayBackendSettings(): void {
		const { containerEl } = this;

		const backendSection = containerEl.createEl('h2', { text: 'Backend Configuration' });

		new Setting(containerEl)
			.setName('Backend URL')
			.setDesc('HTTP address of the EverAI Python backend')
			.addText(text =>
				text
					.setPlaceholder('http://localhost')
					.setValue(this.plugin.settings.backendUrl)
					.onChange(async (value) => {
						this.plugin.settings.backendUrl = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Backend Port')
			.setDesc('Port number for the backend server')
			.addText(text =>
				text
					.setPlaceholder('8000')
					.setValue(String(this.plugin.settings.backendPort))
					.onChange(async (value) => {
						const port = parseInt(value, 10);
						if (!isNaN(port)) {
							this.plugin.settings.backendPort = port;
							await this.plugin.saveSettings();
						}
					})
			);
	}

	private displayModelSettings(): void {
		const { containerEl } = this;

		const modelSection = containerEl.createEl('h2', { text: 'Model Settings' });

		new Setting(containerEl)
			.setName('Model Name')
			.setDesc('Name of the language model')
			.addText(text =>
				text
					.setValue(this.plugin.settings.modelName)
					.onChange(async (value) => {
						this.plugin.settings.modelName = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Model Path')
			.setDesc('File path to the GGUF model on Android storage')
			.addText(text =>
				text
					.setValue(this.plugin.settings.modelPath)
					.onChange(async (value) => {
						this.plugin.settings.modelPath = value;
						await this.plugin.saveSettings();
					})
			);
	}

	private displayFeatureSettings(): void {
		const { containerEl } = this;

		const featureSection = containerEl.createEl('h2', { text: 'Features' });

		new Setting(containerEl)
			.setName('Enable memory')
			.setDesc('Save conversation context for better responses')
			.addToggle(toggle =>
				toggle
					.setValue(this.plugin.settings.enableMemory)
					.onChange(async (value) => {
						this.plugin.settings.enableMemory = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Enable internet tools')
			.setDesc('Allow AI to search the internet (requires explicit user action)')
			.addToggle(toggle =>
				toggle
					.setValue(this.plugin.settings.enableInternetTools)
					.onChange(async (value) => {
						this.plugin.settings.enableInternetTools = value;
						await this.plugin.saveSettings();
					})
			);
	}

	private displayPerformanceSettings(): void {
		const { containerEl } = this;

		const perfSection = containerEl.createEl('h2', { text: 'Performance (Android optimized)' });

		new Setting(containerEl)
			.setName('Context window size')
			.setDesc('Number of tokens for context (128-4096, lower = less RAM)')
			.addText(text =>
				text
					.setPlaceholder('512')
					.setValue(String(this.plugin.settings.contextWindowSize))
					.onChange(async (value) => {
						const size = parseInt(value, 10);
						if (!isNaN(size) && size >= 128 && size <= 4096) {
							this.plugin.settings.contextWindowSize = size;
							await this.plugin.saveSettings();
						}
					})
			);

		new Setting(containerEl)
			.setName('Max tokens per response')
			.setDesc('Maximum tokens in each response (32-2048, lower = faster)')
			.addText(text =>
				text
					.setPlaceholder('256')
					.setValue(String(this.plugin.settings.maxTokens))
					.onChange(async (value) => {
						const tokens = parseInt(value, 10);
						if (!isNaN(tokens) && tokens >= 32 && tokens <= 2048) {
							this.plugin.settings.maxTokens = tokens;
							await this.plugin.saveSettings();
						}
					})
			);
	}

	private displayDebugSettings(): void {
		const { containerEl } = this;

		const debugSection = containerEl.createEl('h2', { text: 'Debug' });

		new Setting(containerEl)
			.setName('Debug mode')
			.setDesc('Enable verbose logging for troubleshooting')
			.addToggle(toggle =>
				toggle
					.setValue(this.plugin.settings.debugMode)
					.onChange(async (value) => {
						this.plugin.settings.debugMode = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
