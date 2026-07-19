/**
 * Chat Manager
 *
 * Central coordinator for all EverAI conversations.
 *
 * Responsibilities:
 * - Validate user input
 * - Manage conversation history
 * - Build backend requests
 * - Coordinate with BackendClient
 * - Support cancellation
 * - Emit events (future)
 */

import {
	ChatMessage,
	ChatCompletionRequest,
	ChatCompletionResponse,
} from "../types";

import { BackendClient } from "../backend/client";
import { MemoryStore } from "./memory";
import { generateId } from "../utils/helpers";
import { logger } from "../utils/logger";

export class ChatManager {
	private readonly backend: BackendClient;
	private readonly memory: MemoryStore;

	constructor(
		backend: BackendClient,
		memory: MemoryStore
	) {
		this.backend = backend;
		this.memory = memory;
	}

	/**
	 * Send a message to the backend.
	 */
	public async sendMessage(
		message: string,
		options?: {
			useMemory?: boolean;
			enableInternet?: boolean;
			maxTokens?: number;
		}
	): Promise<ChatCompletionResponse> {

		const cleanedMessage = this.validateMessage(message);

		const userMessage = this.createUserMessage(cleanedMessage);

		this.memory.add(userMessage);

		const request = this.buildRequest(
			cleanedMessage,
			options
		);

		logger.info("Sending request to backend...");

		try {

			const response = await this.backend.chat(request);

			this.storeAssistantMessage(response);

			logger.info("Assistant response received.");

			return response;

		} catch (error) {

			logger.error("Chat request failed", error);

			throw error;

		}
	}

	/**
	 * Cancel current generation.
	 */
	public cancelGeneration(): void {
		logger.info("Cancelling generation...");
		this.backend.cancel();
	}

	/**
	 * Get conversation history.
	 */
	public getHistory(): ChatMessage[] {
		return this.memory.getAll();
	}

	/**
	 * Clear all messages.
	 */
	public clearHistory(): void {
		this.memory.clear();
		logger.info("Conversation cleared.");
	}

	/**
	 * Validate incoming message.
	 */
	private validateMessage(message: string): string {

		const trimmed = message.trim();

		if (trimmed.length === 0) {
			throw new Error("Message cannot be empty.");
		}

		if (trimmed.length > 10000) {
			throw new Error("Message is too long.");
		}

		return trimmed;
	}

	/**
	 * Create user message object.
	 */
	private createUserMessage(
		content: string
	): ChatMessage {

		return {
			id: generateId(),
			role: "user",
			content,
			timestamp: Date.now(),
		};
	}

	/**
	 * Build backend request.
	 *
	 * NOTE:
	 * Later this function will also attach:
	 * - Current note
	 * - Vault context
	 * - Memories
	 * - Tool results
	 */
	private buildRequest(
		message: string,
		options?: {
			useMemory?: boolean;
			enableInternet?: boolean;
			maxTokens?: number;
		}
	): ChatCompletionRequest {

		return {

			message,

			conversationHistory: this.memory.getLast(25),

			useMemory:
				options?.useMemory ?? true,

			enableInternetTools:
				options?.enableInternet ?? false,

			maxTokens:
				options?.maxTokens ?? 256,
		};
	}

	/**
	 * Store assistant reply.
	 */
	private storeAssistantMessage(
		response: ChatCompletionResponse
	): void {

		const assistantMessage: ChatMessage = {

			id: response.id,

			role: "assistant",

			content: response.content,

			timestamp: response.timestamp,

			tokensUsed: response.tokensUsed,
		};

		this.memory.add(assistantMessage);
	}
}
