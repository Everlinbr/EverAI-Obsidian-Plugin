import EverAIPlugin from '../main';

/**
 * Register all plugin commands
 * 
 * @param plugin - The EverAI plugin instance
 */
export function registerCommands(plugin: EverAIPlugin): void {
	// Test command to verify plugin is working
	plugin.addCommand({
		id: 'everai-test-connection',
		name: 'Test backend connection',
		callback: async () => {
			await testBackendConnection(plugin);
		},
	});

	// Open chat sidebar command
	plugin.addCommand({
		id: 'everai-open-chat',
		name: 'Open chat sidebar',
		callback: async () => {
			await openChatSidebar(plugin);
		},
	});
}

/**
 * Test connection to backend
 * 
 * @param plugin - The EverAI plugin instance
 */
async function testBackendConnection(plugin: EverAIPlugin): Promise<void> {
	try {
		const status = await plugin.backendClient.getStatus();
		if (status.isHealthy) {
			console.log('EverAI: Backend connection successful');
			console.log(`Model: ${status.modelName}, Memory: ${status.memoryUsage}MB`);
		} else {
			console.error('EverAI: Backend is not healthy');
		}
	} catch (error) {
		console.error('EverAI: Failed to connect to backend', error);
	}
}

/**
 * Open the chat sidebar
 * 
 * @param plugin - The EverAI plugin instance
 */
async function openChatSidebar(plugin: EverAIPlugin): Promise<void> {
	if (!plugin.settings.showChatSidebar) {
		console.log('EverAI: Chat sidebar is disabled in settings');
		return;
	}
	console.log('EverAI: Opening chat sidebar');
	// Chat sidebar view will be implemented in future milestone
}
