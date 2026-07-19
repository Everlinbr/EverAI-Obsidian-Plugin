/**
 * Chat View - Side Panel Component
 * 
 * Displays the chat interface as a dockable side panel in Obsidian
 * with message history, input box, and action buttons
 */

import { ItemView, WorkspaceLeaf, App } from 'obsidian';
import { ChatManager } from '../../core/chat-manager';
import { eventBus } from '../../core/event-bus';
import { logger } from '../../utils/logger';
import { generateId, truncateText } from '../../utils/helpers';
import { ChatMessage } from '../../types';

const VIEW_TYPE_CHAT = 'everai-chat-view';
const VIEW_DISPLAY_TEXT = 'EverAI Chat';

/**
 * Chat View Component for side panel
 */
export class ChatView extends ItemView {
	private chatManager: ChatManager | null = null;
	private messagesContainer: HTMLElement | null = null;
	private inputElement: HTMLTextAreaElement | null = null;
	private sendButton: HTMLButtonElement | null = null;
	private clearButton: HTMLButtonElement | null = null;
	private isLoading = false;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType(): string {
		return VIEW_TYPE_CHAT;
	}

	getDisplayText(): string {
		return VIEW_DISPLAY_TEXT;
	}

	getIcon(): string {
		return 'message-circle';
	}

	/**
	 * Initialize the view with chat manager
	 */
	setChatManager(chatManager: ChatManager): void {
		this.chatManager = chatManager;
	}

	/**
	 * Render the view content
	 */
	async onOpen(): Promise<void> {
		const container = this.containerEl.children[1];
		container.empty();
		container.addClass('everai-chat-view');

		// Create header
		this.createHeader(container);

		// Create messages area
		this.messagesContainer = container.createDiv('everai-messages-container');
		this.messagesContainer.setAttribute('role', 'log');
		this.messagesContainer.setAttribute('aria-label', 'Chat messages');

		// Create input area
		this.createInputArea(container);

		// Load initial message history
		this.loadMessageHistory();

		// Subscribe to events
		this.subscribeToEvents();
	}

	/**
	 * Create header with title and buttons
	 */
	private createHeader(container: HTMLElement): void {
		const header = container.createDiv('everai-chat-header');
		header.createEl('h2', { text: 'EverAI Chat', cls: 'everai-chat-title' });

		const buttonGroup = header.createDiv('everai-button-group');

		// Clear history button
		this.clearButton = buttonGroup.createEl('button', {
			text: '🗑️',
			cls: 'everai-btn everai-btn-icon',
			attr: { title: 'Clear chat history' },
		});
		this.clearButton.addEventListener('click', () => this.clearChat());

		// Info button
		const infoButton = buttonGroup.createEl('button', {
			text: 'ℹ️',
			cls: 'everai-btn everai-btn-icon',
			attr: { title: 'Plugin information' },
		});
		infoButton.addEventListener('click', () => this.showInfo());
	}

	/**
	 * Create input area with text input and send button
	 */
	private createInputArea(container: HTMLElement): void {
		const inputArea = container.createDiv('everai-input-area');

		// Text input
		this.inputElement = inputArea.createEl('textarea', {
			cls: 'everai-input-field',
			attr: {
				placeholder: 'Type your message here...',
				rows: '3',
				ariaLabel: 'Chat message input',
			},
		}) as HTMLTextAreaElement;

		// Handle Enter key
		this.inputElement.addEventListener('keydown', (e: KeyboardEvent) => {
			if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
				e.preventDefault();
				this.sendMessage();
			}
		});

		// Send button
		const buttonArea = inputArea.createDiv('everai-button-area');
		this.sendButton = buttonArea.createEl('button', {
			text: 'Send',
			cls: 'everai-btn everai-btn-primary',
		});
		this.sendButton.addEventListener('click', () => this.sendMessage());
	}

	/**
	 * Send message to backend
	 */
	private async sendMessage(): Promise<void> {
		if (!this.inputElement || !this.chatManager) {
			return;
		}

		const message = this.inputElement.value.trim();
		if (!message) {
			return;
		}

		this.isLoading = true;
		this.updateUIState();

		try {
			// Clear input
			this.inputElement.value = '';

			// Send message
			const response = await this.chatManager.sendMessage(message);

			if (response) {
				eventBus.emit('chat:response-received', {
					content: response.content,
					tokensUsed: response.tokensUsed,
				});
			} else {
				eventBus.emit('chat:error', {
					error: 'Failed to get response from backend',
					timestamp: Date.now(),
				});
			}

			// Reload messages
			this.loadMessageHistory();
		} catch (error) {
			logger.error('Error sending message', error);
			eventBus.emit('chat:error', {
				error: String(error),
				timestamp: Date.now(),
			});
		} finally {
			this.isLoading = false;
			this.updateUIState();
		}
	}

	/**
	 * Load and display message history
	 */
	private loadMessageHistory(): void {
		if (!this.messagesContainer || !this.chatManager) {
			return;
		}

		this.messagesContainer.empty();

		const messages = this.chatManager.getHistory();

		if (messages.length === 0) {
			const emptyState = this.messagesContainer.createDiv('everai-empty-state');
			emptyState.createEl('p', {
				text: 'No messages yet. Start a conversation!',
				cls: 'everai-empty-text',
			});
			return;
		}

		messages.forEach((msg) => {
			this.renderMessage(msg);
		});

		// Scroll to bottom
		this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
	}

	/**
	 * Render a single message
	 */
	private renderMessage(message: ChatMessage): void {
		if (!this.messagesContainer) {
			return;
		}

		const messageEl = this.messagesContainer.createDiv(
			`everai-message everai-message-${message.role}`
		);

		// Message header
		const header = messageEl.createDiv('everai-message-header');
		const roleEl = header.createSpan('everai-message-role');
		roleEl.textContent =
			message.role === 'user' ? 'You' : message.role === 'assistant' ? 'EverAI' : 'System';

		const timeEl = header.createSpan('everai-message-time');
		const time = new Date(message.timestamp);
		timeEl.textContent = time.toLocaleTimeString();

		// Message content
		const contentEl = messageEl.createDiv('everai-message-content');
		contentEl.textContent = message.content;

		// Token info for assistant messages
		if (message.role === 'assistant' && message.tokensUsed) {
			const infoEl = messageEl.createDiv('everai-message-info');
			infoEl.textContent = `Tokens: ${message.tokensUsed}`;
		}
	}

	/**
	 * Clear chat history
	 */
	private clearChat(): void {
		if (this.chatManager) {
			this.chatManager.clearHistory();
			this.loadMessageHistory();
			logger.info('Chat cleared by user');
		}
	}

	/**
	 * Show plugin information
	 */
	private showInfo(): void {
		if (!this.messagesContainer) {
			return;
		}

		const infoBox = this.messagesContainer.createDiv('everai-info-box');
		infoBox.createEl('h3', { text: 'EverAI Plugin v0.1.0' });
		infoBox.createEl('p', {
			text: 'Offline-first AI assistant for Obsidian on Android',
		});
		infoBox.createEl('ul', {
			text: 'Features:\n• Local LLM execution\n• Conversation memory\n• Vault integration',
		});
	}

	/**
	 * Subscribe to event bus
	 */
	private subscribeToEvents(): void {
		eventBus.on('chat:error', (data) => {
			logger.error('Chat error:', data.error);
			if (this.messagesContainer) {
				const errorEl = this.messagesContainer.createDiv('everai-error');
				errorEl.textContent = `Error: ${truncateText(data.error, 100)}`;
			}
		});
	}

	/**
	 * Update UI state based on loading status
	 */
	private updateUIState(): void {
		if (!this.inputElement || !this.sendButton) {
			return;
		}

		if (this.isLoading) {
			this.inputElement.disabled = true;
			this.sendButton.disabled = true;
			this.sendButton.textContent = 'Sending...';
		} else {
			this.inputElement.disabled = false;
			this.sendButton.disabled = false;
			this.sendButton.textContent = 'Send';
		}
	}

	async onClose(): Promise<void> {
		// Cleanup
	}
}

export const VIEW_TYPE = VIEW_TYPE_CHAT;
