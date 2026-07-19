/**
 * Backend Client
 *
 * Handles communication with the local EverAI Python backend.
 * Supports:
 * - Health checks
 * - Chat requests
 * - Automatic retries
 * - Request cancellation
 * - Proper request timeouts
 */

import {
	ApiResponse,
	BackendStatus,
	ChatCompletionRequest,
	ChatCompletionResponse
} from "../types";

export class BackendClient {
	private readonly baseUrl: string;

	private readonly retryAttempts = 3;
	private readonly retryDelay = 1000;
	private readonly timeout = 30000;

	private controller?: AbortController;

	constructor(host: string, port = 8000) {
		this.baseUrl = `${host}:${port}`;
	}

	/**
	 * Cancel the current request.
	 */
	public cancel(): void {
		this.controller?.abort();
	}

	/**
	 * Check whether the backend is alive.
	 */
	public async getStatus(): Promise<BackendStatus> {
		try {
			const response = await this.fetchWithRetry("/api/health");

			const json =
				(await response.json()) as ApiResponse<BackendStatus>;

			if (!json.success || !json.data) {
				throw new Error("Invalid backend response.");
			}

			return json.data;
		} catch {
			return {
				isHealthy: false,
				modelLoaded: false,
				modelName: "",
				uptime: 0,
				memoryUsage: 0
			};
		}
	}

	/**
	 * Send a chat request.
	 */
	public async chat(
		request: ChatCompletionRequest
	): Promise<ChatCompletionResponse> {
		const response = await this.fetchWithRetry("/api/chat", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(request)
		});

		const json =
			(await response.json()) as ApiResponse<ChatCompletionResponse>;

		if (!json.success || !json.data) {
			throw new Error(json.error ?? "Unknown backend error.");
		}

		return json.data;
	}

	/**
	 * Shared fetch implementation with retries and timeout.
	 */
	private async fetchWithRetry(
		path: string,
		options: RequestInit = {}
	): Promise<Response> {

		let lastError: unknown;

		for (let attempt = 0; attempt < this.retryAttempts; attempt++) {

			this.controller = new AbortController();

			const timer = setTimeout(() => {
				this.controller?.abort();
			}, this.timeout);

			try {

				const response = await fetch(
					`${this.baseUrl}${path}`,
					{
						...options,
						signal: this.controller.signal
					}
				);

				clearTimeout(timer);

				if (!response.ok) {
					throw new Error(
						`HTTP ${response.status} ${response.statusText}`
					);
				}

				return response;

			} catch (error) {

				clearTimeout(timer);

				lastError = error;

				if (attempt < this.retryAttempts - 1) {
					await this.sleep(
						this.retryDelay * Math.pow(2, attempt)
					);
				}
			}
		}

		throw lastError instanceof Error
			? lastError
			: new Error("Backend request failed.");
	}

	private sleep(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
}
