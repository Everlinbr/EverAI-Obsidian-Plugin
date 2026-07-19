/**
 * Memory management for conversation context
 * 
 * Stores and retrieves conversation history with size limits
 * optimized for Android devices with limited RAM
 */

import { ChatMessage } from '../types';
import { MEMORY_CONFIG } from '../utils/constants';

/**
 * Memory store for managing conversation history
 */
export class MemoryStore {
	private messages: ChatMessage[] = [];
	private maxItems: number = MEMORY_CONFIG.DEFAULT_MEMORY_ITEMS;

	constructor(maxItems?: number) {
		if (maxItems) {
			this.setMaxItems(maxItems);
		}
	}

	/**
	 * Add a message to memory
	 */
	add(message: ChatMessage): void {
		this.messages.push(message);
		this.pruneIfNeeded();
	}

	/**
	 * Get all messages
	 */
	getAll(): ChatMessage[] {
		return [...this.messages];
	}

	/**
	 * Get last N messages
	 */
	getLast(count: number): ChatMessage[] {
		const start = Math.max(0, this.messages.length - count);
		return this.messages.slice(start);
	}

	/**
	 * Clear all messages
	 */
	clear(): void {
		this.messages = [];
	}

	/**
	 * Get message count
	 */
	getCount(): number {
		return this.messages.length;
	}

	/**
	 * Set maximum items
	 */
	setMaxItems(max: number): void {
		if (max < MEMORY_CONFIG.MIN_MEMORY_ITEMS) {
			this.maxItems = MEMORY_CONFIG.MIN_MEMORY_ITEMS;
		} else if (max > MEMORY_CONFIG.MAX_MEMORY_ITEMS) {
			this.maxItems = MEMORY_CONFIG.MAX_MEMORY_ITEMS;
		} else {
			this.maxItems = max;
		}
	}

	/**
	 * Prune messages if over limit
	 */
	private pruneIfNeeded(): void {
		while (this.messages.length > this.maxItems) {
			this.messages.shift(); // Remove oldest message
		}
	}

	/**
	 * Estimate memory usage
	 */
	getEstimatedSize(): number {
		return this.messages.reduce(
			(sum, msg) => sum + msg.content.length,
			0
		);
	}
}
