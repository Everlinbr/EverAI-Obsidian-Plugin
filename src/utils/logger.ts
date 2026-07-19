/**
 * Logger utility for consistent logging across the plugin
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
	private prefix = '[EverAI]';
	private debugMode = false;

	setDebugMode(enabled: boolean): void {
		this.debugMode = enabled;
	}

	private formatMessage(level: LogLevel, message: string): string {
		return `${this.prefix}[${level.toUpperCase()}] ${message}`;
	}

	debug(message: string, data?: any): void {
		if (!this.debugMode) return;
		console.log(this.formatMessage('debug', message), data);
	}

	info(message: string, data?: any): void {
		console.log(this.formatMessage('info', message), data);
	}

	warn(message: string, data?: any): void {
		console.warn(this.formatMessage('warn', message), data);
	}

	error(message: string, error?: Error | unknown): void {
		console.error(this.formatMessage('error', message), error);
	}
}

export const logger = new Logger();
