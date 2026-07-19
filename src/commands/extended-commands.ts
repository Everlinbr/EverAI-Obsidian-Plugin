/**
 * Extended command handlers for chat operations
 */

import { Plugin } from 'obsidian';
import { ChatManager } from '../core/chat-manager';
import { eventBus } from '../core/event-bus';
import { logger } from '../utils/logger';

/**
 * Register extended chat commands
 */
export function registerExtendedCommands(plugin: Plugin, chatManager: ChatManager): void {
	// Clear chat history command
	plugin.addCommand({
		id: 'everai-clear-chat',
		name: 'Clear chat history',
		callback: () => {
			chatManager.clearHistory();
			eventBus.emit('chat:error', {
				error: 'Chat history cleared',
				timestamp: Date.now(),
			});
			logger.info('Chat history cleared via command');
		},
	});

	// Copy last response command
	plugin.addCommand({
		id: 'everai-copy-response',
		name: 'Copy last AI response',
		callback: () => {
			const history = chatManager.getHistory();
			const lastResponse = history
				.reverse()
				.find((msg) => msg.role === 'assistant');

			if (lastResponse) {
				navigator.clipboard.writeText(lastResponse.content).then(() => {
					logger.info('Copied response to clipboard');
				});
			}
		},
	});

	// Export chat history command
	plugin.addCommand({
		id: 'everai-export-chat',
		name: 'Export chat history',
		callback: async () => {
			const history = chatManager.getHistory();
			const formatted = formatChatHistory(history);
			navigator.clipboard.writeText(formatted).then(() => {
				logger.info('Exported chat history to clipboard');
			});
		},
	});
}

/**
 * Format chat history for export
 */
function formatChatHistory(messages: any[]): string {
	const lines: string[] = ['# EverAI Chat History', '', `Exported: ${new Date().toISOString()}`, ''];

	messages.forEach((msg, index) => {
		const role = msg.role.toUpperCase();
		const time = new Date(msg.timestamp).toLocaleString();
		lines.push(`## ${index + 1}. ${role} (${time})`);
		lines.push('');
		lines.push(msg.content);
		lines.push('');

		if (msg.tokensUsed) {
			lines.push(`*Tokens: ${msg.tokensUsed}*`);
			lines.push('');
		}
	});

	return lines.join('\n');
}
