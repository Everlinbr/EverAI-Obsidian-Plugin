/**
 * EverAI Plugin Settings
 * 
 * Defines all configurable settings for the EverAI plugin,
 * including backend connection, model settings, and UI preferences.
 */

export interface EverAISettings {
	// Backend configuration
	backendUrl: string;
	backendPort: number;
	backendApiKey: string;

	// Model configuration
	modelName: string;
	modelPath: string;
	quantization: string;

	// Feature toggles
	enableInternetTools: boolean;
	enableMemory: boolean;
	maxMemoryItems: number;

	// Performance settings
	contextWindowSize: number;
	maxTokens: number;

	// UI settings
	showChatSidebar: boolean;
	chatPanelWidth: number;

	// Development
	debugMode: boolean;
}

/**
 * Default settings - used on first plugin load
 * All values are conservative and Android-friendly
 */
export const DEFAULT_SETTINGS: EverAISettings = {
	// Backend configuration
	backendUrl: 'http://localhost',
	backendPort: 8000,
	backendApiKey: '',

	// Model configuration
	modelName: 'Qwen2.5-1.5B-Instruct',
	modelPath: '/storage/emulated/0/EverAI/models/qwen2.5-1.5b.gguf',
	quantization: 'Q4_K_M',

	// Feature toggles
	enableInternetTools: false,
	enableMemory: true,
	maxMemoryItems: 50,

	// Performance settings (optimized for 3GB RAM)
	contextWindowSize: 512,
	maxTokens: 256,

	// UI settings
	showChatSidebar: true,
	chatPanelWidth: 350,

	// Development
	debugMode: false,
};

/**
 * Validate settings for correctness and consistency
 * @param settings - Settings to validate
 * @returns true if settings are valid, false otherwise
 */
export function validateSettings(settings: EverAISettings): boolean {
	if (!settings.backendUrl || settings.backendUrl.trim() === '') {
		return false;
	}

	if (settings.backendPort < 1 || settings.backendPort > 65535) {
		return false;
	}

	if (settings.contextWindowSize < 128 || settings.contextWindowSize > 4096) {
		return false;
	}

	if (settings.maxTokens < 32 || settings.maxTokens > 2048) {
		return false;
	}

	if (settings.maxMemoryItems < 1 || settings.maxMemoryItems > 1000) {
		return false;
	}

	return true;
}
