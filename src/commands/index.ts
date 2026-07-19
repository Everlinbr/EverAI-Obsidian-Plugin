import { Notice } from "obsidian";
import EverAIPlugin from "../main";

/**
 * Register all plugin commands.
 */
export function registerCommands(plugin: EverAIPlugin): void {

	plugin.addCommand({
		id: "everai-open-chat",
		name: "Open EverAI Chat",
		callback: async () => {
			await plugin.activateChatView();
		},
	});

	plugin.addCommand({
		id: "everai-test-backend",
		name: "Test Backend Connection",
		callback: async () => {
			await testBackendConnection(plugin);
		},
	});

	plugin.addCommand({
		id: "everai-clear-chat",
		name: "Clear Chat History",
		callback: () => {

			if (!plugin.chatManager) {
				new Notice("EverAI is not initialized.");
				return;
			}

			plugin.chatManager.clearHistory();
			new Notice("EverAI chat history cleared.");

		},
	});

}

/**
 * Test backend connection.
 */
async function testBackendConnection(plugin: EverAIPlugin): Promise<void> {

	try {

		const status = await plugin.backendClient.getStatus();

		if (status.isHealthy) {

			new Notice(
				`Connected to ${status.modelName}`
			);

			console.log(
				"[EverAI] Backend OK",
				status
			);

		} else {

			new Notice(
				"Backend is running but not healthy."
			);

		}

	} catch (error) {

		console.error(
			"[EverAI]",
			error
		);

		new Notice(
			"Failed to connect to backend."
		);

	}

}
