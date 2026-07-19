/**
 * EverAI Chat View
 *
 * Modern Obsidian side panel.
 *
 * Android-first.
 * Local AI first.
 */

import {
	App,
	ItemView,
	MarkdownRenderer,
	Notice,
	TFile,
	WorkspaceLeaf
} from "obsidian";

import { ChatManager } from "../core/chat-manager";
import { ChatMessage } from "../types";

export const VIEW_TYPE = "everai-chat";

export class ChatView extends ItemView {

	private chatManager!: ChatManager;

	private header!: HTMLElement;
	private status!: HTMLElement;

	private currentNote!: HTMLElement;

	private messages!: HTMLElement;

	private input!: HTMLTextAreaElement;

	private sendButton!: HTMLButtonElement;

	private stopButton!: HTMLButtonElement;

	private isGenerating = false;

	constructor(
		leaf: WorkspaceLeaf,
		chatManager: ChatManager
	) {
		super(leaf);

		this.chatManager = chatManager;
	}

	getViewType(): string {
		return VIEW_TYPE;
	}

	getDisplayText(): string {
		return "EverAI";
	}

	getIcon(): string {
		return "bot";
	}

	async onOpen(): Promise<void> {

		const root = this.containerEl.children[1];

		root.empty();

		root.addClass("everai-root");

		this.createLayout(root);

		await this.refreshCurrentNote();

		await this.refreshMessages();

		this.input.focus();
	}

	async onClose(): Promise<void> {

	}

	private createLayout(root: Element): void {

		/* ---------------- Header ---------------- */

		this.header = root.createDiv({
			cls: "everai-header"
		});

		const title = this.header.createDiv({
			cls: "everai-title"
		});

		title.createEl("h2", {
			text: "🤖 EverAI"
		});

		this.status = title.createDiv({
			cls: "everai-status"
		});

		this.status.setText("🟢 Local");

		/* -------------- Current Note ----------- */

		const noteCard = root.createDiv({
			cls: "everai-note-card"
		});

		noteCard.createEl("small", {
			text: "Current Note"
		});

		this.currentNote = noteCard.createDiv({
			cls: "everai-current-note"
		});

		this.currentNote.setText("None");

		/* --------------- Messages -------------- */

		this.messages = root.createDiv({
			cls: "everai-messages"
		});

		/* ---------------- Footer --------------- */

		const footer = root.createDiv({
			cls: "everai-footer"
		});

		this.input = footer.createEl("textarea");

		this.input.placeholder = "Ask EverAI...";

		this.input.rows = 3;

		const buttonRow = footer.createDiv({
			cls: "everai-buttons"
		});

		this.sendButton = buttonRow.createEl("button");

		this.sendButton.setText("Send");

		this.stopButton = buttonRow.createEl("button");

		this.stopButton.setText("Stop");

		this.stopButton.disabled = true;

		this.sendButton.onclick = () => {
			this.handleSend();
		};

		this.stopButton.onclick = () => {
			this.handleStop();
		};

		this.input.addEventListener("keydown", async (e) => {

			if (
				e.key === "Enter" &&
				!e.shiftKey
			) {

				e.preventDefault();

				await this.handleSend();
			}

		});


		
	}
		/**
	 * Refresh current note card.
	 */
	private async refreshCurrentNote(): Promise<void> {

		const file = this.app.workspace.getActiveFile();

		if (!file) {
			this.currentNote.setText("None");
			return;
		}

		this.currentNote.setText(file.path);
	}

	/**
	 * Reload conversation.
	 */
	private async refreshMessages(): Promise<void> {

		this.messages.empty();

		const history = this.chatManager.getHistory();

		if (history.length === 0) {

			const empty = this.messages.createDiv({
				cls: "everai-empty"
			});

			empty.setText("Start chatting with EverAI.");

			return;
		}

		for (const message of history) {
			await this.renderMessage(message);
		}

		this.scrollToBottom();
	}

	/**
	 * Render one message.
	 */
	private async renderMessage(
		message: ChatMessage
	): Promise<void> {

		const bubble = this.messages.createDiv({
			cls: `everai-bubble everai-${message.role}`
		});

		const header = bubble.createDiv({
			cls: "everai-bubble-header"
		});

		header.setText(
			message.role === "user"
				? "👤 You"
				: message.role === "assistant"
				? "🤖 EverAI"
				: "⚙️ System"
		);

		const body = bubble.createDiv({
			cls: "everai-bubble-body"
		});

		await MarkdownRenderer.render(
			this.app,
			message.content,
			body,
			"",
			this
		);
	}

	/**
	 * Scroll chat to bottom.
	 */
	private scrollToBottom(): void {

		requestAnimationFrame(() => {

			this.messages.scrollTop =
				this.messages.scrollHeight;

		});
	}

	/**
	 * Typing indicator.
	 */
	private showTyping(): void {

		const typing = this.messages.createDiv({
			cls: "everai-typing"
		});

		typing.setText("🤖 EverAI is thinking...");

		this.scrollToBottom();
	}
		/**
	 * Send a message.
	 */
	private async handleSend(): Promise<void> {

		if (this.isGenerating) {
			return;
		}

		const text = this.input.value.trim();

		if (!text) {
			return;
		}

		this.isGenerating = true;

		this.sendButton.disabled = true;
		this.stopButton.disabled = false;
		this.input.disabled = true;

		this.input.value = "";

		try {

			this.showTyping();

			await this.chatManager.sendMessage(text);

			await this.refreshMessages();

		} catch (error) {

			console.error(error);

			new Notice(
				error instanceof Error
					? error.message
					: "Failed to send message."
			);

		} finally {

			this.isGenerating = false;

			this.sendButton.disabled = false;
			this.stopButton.disabled = true;
			this.input.disabled = false;

			this.input.focus();

		}
	}

	/**
	 * Stop current generation.
	 */
	private handleStop(): void {

		if (!this.isGenerating) {
			return;
		}

		this.chatManager.cancelGeneration();

		this.isGenerating = false;

		this.sendButton.disabled = false;
		this.stopButton.disabled = true;
		this.input.disabled = false;

		new Notice("Generation cancelled.");
	}

	/**
	 * Refresh backend status.
	 */
	public async updateStatus(
		connected: boolean
	): Promise<void> {

		this.status.setText(
			connected
				? "🟢 Local"
				: "🔴 Offline"
		);

	}

	/**
	 * Called when this view becomes active.
	 */
	async onPaneMenu(): Promise<void> {

		await this.refreshCurrentNote();

	}

	async onClose(): Promise<void> {

		this.chatManager.cancelGeneration();

	}
	}
