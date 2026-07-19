/**
 * Constants used throughout the plugin
 */

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
	HEALTH: '/api/health',
	CHAT: '/api/chat',
	MEMORY: '/api/memory',
	MODEL_INFO: '/api/model/info',
} as const;

/**
 * Default timeouts (milliseconds)
 */
export const TIMEOUTS = {
	CHAT_REQUEST: 60000, // 60 seconds for chat
	HEALTH_CHECK: 10000, // 10 seconds for health
	CONNECTION: 5000, // 5 seconds for initial connection
} as const;

/**
 * Retry configuration
 */
export const RETRY_CONFIG = {
	MAX_ATTEMPTS: 3,
	BASE_DELAY_MS: 1000,
	MAX_DELAY_MS: 5000,
} as const;

/**
 * Chat configuration limits
 */
export const CHAT_CONFIG = {
	MIN_CONTEXT_WINDOW: 128,
	MAX_CONTEXT_WINDOW: 4096,
	DEFAULT_CONTEXT_WINDOW: 512,
	MIN_MAX_TOKENS: 32,
	MAX_MAX_TOKENS: 2048,
	DEFAULT_MAX_TOKENS: 256,
} as const;

/**
 * Memory configuration
 */
export const MEMORY_CONFIG = {
	MIN_MEMORY_ITEMS: 1,
	MAX_MEMORY_ITEMS: 1000,
	DEFAULT_MEMORY_ITEMS: 50,
} as const;

/**
 * UI configuration
 */
export const UI_CONFIG = {
	DEFAULT_CHAT_PANEL_WIDTH: 350,
	MIN_CHAT_PANEL_WIDTH: 250,
	MAX_CHAT_PANEL_WIDTH: 800,
} as const;

/**
 * Android-specific settings
 */
export const ANDROID_CONFIG = {
	AVERAGE_RAM_MB: 3072, // 3GB
	RECOMMENDED_CONTEXT_WINDOW: 512,
	RECOMMENDED_MAX_TOKENS: 256,
	MODEL_QUANTIZATION: 'Q4_K_M',
} as const;
