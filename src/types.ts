/**
 * EverAI Type Definitions
 * 
 * Core types used throughout the plugin for type safety and consistency.
 */

/**
 * Chat message structure for conversation history
 */
export interface ChatMessage {
	id: string;
	role: 'user' | 'assistant' | 'system';
	content: string;
	timestamp: number;
	tokensUsed?: number;
}

/**
 * Backend API response wrapper
 */
export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
	code?: string;
}

/**
 * Chat completion request to backend
 */
export interface ChatCompletionRequest {
	message: string;
	conversationHistory: ChatMessage[];
	useMemory: boolean;
	enableInternetTools: boolean;
	maxTokens: number;
}

/**
 * Chat completion response from backend
 */
export interface ChatCompletionResponse {
	id: string;
	content: string;
	tokensUsed: number;
	finishReason: 'stop' | 'length' | 'error';
	timestamp: number;
}

/**
 * File operation request
 */
export interface FileOperationRequest {
	type: 'create' | 'edit' | 'read' | 'delete';
	path: string;
	content?: string;
	requiresConfirmation: boolean;
}

/**
 * File operation response
 */
export interface FileOperationResponse {
	success: boolean;
	path: string;
	content?: string;
	error?: string;
}

/**
 * Vault search result
 */
export interface VaultSearchResult {
	path: string;
	title: string;
	excerpt: string;
	relevance: number;
}

/**
 * Memory item for conversation context
 */
export interface MemoryItem {
	id: string;
	title: string;
	content: string;
	createdAt: number;
	updatedAt: number;
}

/**
 * Backend health status
 */
export interface BackendStatus {
	isHealthy: boolean;
	modelLoaded: boolean;
	modelName: string;
	uptime: number;
	memoryUsage: number;
}
