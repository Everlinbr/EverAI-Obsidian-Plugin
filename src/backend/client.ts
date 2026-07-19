/**
 * Backend Client
 * 
 * Handles all communication with the Python FastAPI backend.
 * Implements retry logic, error handling, and request/response validation.
 */

import { ApiResponse, ChatCompletionRequest, ChatCompletionResponse, BackendStatus } from '../types';

export class BackendClient {
	private baseUrl: string;
	private retryAttempts = 3;
	private retryDelayMs = 1000;

	constructor(baseUrl: string, port: number = 8000) {
		this.baseUrl = `${baseUrl}:${port}`;
	}

	/**
	 * Get backend health status
	 */
	async getStatus(): Promise<BackendStatus> {
		try {
			const response = await this.fetchWithRetry('/api/health');
			const data = await response.json() as ApiResponse<BackendStatus>;

			if (!data.success || !data.data) {
				throw new Error('Invalid health response from backend');
			}

			return data.data;
		} catch (error) {
			console.error('EverAI: Failed to get backend status', error);
			return {
				isHealthy: false,
				modelLoaded: false,
				modelName: '',
				uptime: 0,
				memoryUsage: 0,
			};
		}
	}

	/**
	 * Send a chat message to the backend
	 */
	async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
		try {
			const response = await this.fetchWithRetry('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(request),
			});

			const data = await response.json() as ApiResponse<ChatCompletionResponse>;

			if (!data.success || !data.data) {
				throw new Error(data.error || 'Unknown error from backend');
			}

			return data.data;
		} catch (error) {
			console.error('EverAI: Chat request failed', error);
			throw error;
		}
	}

	/**
	 * Fetch with automatic retry on network errors
	 */
	private async fetchWithRetry(
		path: string,
		options: RequestInit = {}
	): Promise<Response> {
		let lastError: Error | null = null;

		for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
			try {
				const url = `${this.baseUrl}${path}`;
				const response = await fetch(url, {
					...options,
					timeout: 30000, // 30 second timeout
				});

				if (!response.ok) {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}

				return response;
			} catch (error) {
				lastError = error instanceof Error ? error : new Error(String(error));

				if (attempt < this.retryAttempts - 1) {
					// Wait before retry with exponential backoff
					const delayMs = this.retryDelayMs * Math.pow(2, attempt);
					await this.sleep(delayMs);
				}
			}
		}

		throw lastError || new Error('Failed to fetch from backend');
	}

	/**
	 * Sleep utility
	 */
	private sleep(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
}
