/**
 * Chat manager for handling conversation flow
 * 
 * Orchestrates chat operations: sending messages, managing history,
 * and coordinating with backend
 */

import { ChatMessage, ChatCompletionRequest, ChatCompletionResponse } from '../types';
import { BackendClient } from '../backend/client';
import { MemoryStore } from './memory';
import { generateId } from '../utils/helpers';
import { logger } from '../utils/logger';

export class ChatManager {
	private backend: BackendClient;
	private memory: MemoryStore;
	private isProcessing = false;

	constructor(backend: BackendClient, memoryStore: MemoryStore) {
		this.backend = backend;
		this.memory = memoryStore;
	}

	/**
	 * Send a message and get response
	 */
	async sendMessage(
		message: string,
		options?: {
			useMemory?: boolean;
			enableInternet?: boolean;
			maxTokens?: number;
		}
	): Promise<ChatCompletionResponse | null> {
		if (this.isProcessing) {
			logger.warn('Chat manager is already processing a message');
			return null;
		}

		this.isProcessing = true;

		try {
			// Add user message to memory
			const userMessage: ChatMessage = {
				id: generateId(),
				role: 'user',
				content: message,
				timestamp: Date.now(),
			};

			this.memory.add(userMessage);

			// Prepare request
			const request: ChatCompletionRequest = {
				message,
				conversationHistory: this.memory.getAll(),
				useMemory: options?.useMemory ?? true,
				enableInternetTools: options?.enableInternet ?? false,
				maxTokens: options?.maxTokens ?? 256,
			};

			// Send to backend
			const response = await this.backend.chat(request);

			// Add assistant response to memory
			if (response) {
				const assistantMessage: ChatMessage = {
					id: response.id,
					role: 'assistant',
					content: response.content,
					timestamp: response.timestamp,
					tokensUsed: response.tokensUsed,
				};

				this.memory.add(assistantMessage);
			}

			return response;
		} catch (error) {
			logger.error('Failed to send message', error);
			return null;
		} finally {
			this.isProcessing = false;
		}
	}

	/**
	 * Get conversation history
	 */
	getHistory(): ChatMessage[] {
		return this.memory.getAll();
	}

	/**
	 * Clear conversation
	 */
	clearHistory(): void {
		this.memory.clear();
		logger.info('Conversation history cleared');
	}

	/**
	 * Check if processing
	 */
	isProcessingMessage(): boolean {
		return this.isProcessing;
	}
}
