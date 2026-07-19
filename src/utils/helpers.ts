/**
 * Helper functions for common operations
 */

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
export function getBackoffDelay(
	attempt: number,
	baseDelay: number,
	maxDelay: number
): number {
	const delay = baseDelay * Math.pow(2, attempt);
	return Math.min(delay, maxDelay);
}

/**
 * Format error message for logging
 */
export function formatError(error: unknown): string {
	if (error instanceof Error) {
		return `${error.name}: ${error.message}`;
	}
	return String(error);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
	if (text.length <= maxLength) {
		return text;
	}
	return text.substring(0, maxLength - 3) + '...';
}

/**
 * Create a unique ID
 */
export function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Parse JSON safely
 */
export function safeParse<T>(json: string, defaultValue: T): T {
	try {
		return JSON.parse(json) as T;
	} catch {
		return defaultValue;
	}
}

/**
 * Check if object is empty
 */
export function isEmpty(obj: Record<string, any>): boolean {
	return Object.keys(obj).length === 0;
}
