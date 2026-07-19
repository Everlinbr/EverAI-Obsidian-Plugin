/**
 * Event bus for plugin communication
 * 
 * Allows decoupled communication between different plugin components
 */

type EventCallback<T> = (data: T) => void;

interface EventMap {
	'chat:message-sent': { message: string; timestamp: number };
	'chat:response-received': { content: string; tokensUsed: number };
	'chat:error': { error: string; timestamp: number };
	'backend:connected': { status: string };
	'backend:disconnected': { reason: string };
	'settings:changed': { setting: string; value: any };
}

/**
 * Simple event bus implementation
 */
class EventBus {
	private listeners: Map<keyof EventMap, EventCallback<any>[]> = new Map();

	on<E extends keyof EventMap>(
		event: E,
		callback: EventCallback<EventMap[E]>
	): () => void {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, []);
		}

		const callbacks = this.listeners.get(event)!;
		callbacks.push(callback);

		// Return unsubscribe function
		return () => {
			const index = callbacks.indexOf(callback);
			if (index > -1) {
				callbacks.splice(index, 1);
			}
		};
	}

	emit<E extends keyof EventMap>(event: E, data: EventMap[E]): void {
		const callbacks = this.listeners.get(event);
		if (callbacks) {
			callbacks.forEach(callback => {
				try {
					callback(data);
				} catch (error) {
					console.error(`Error in event listener for ${String(event)}:`, error);
				}
			});
		}
	}
}

export const eventBus = new EventBus();
