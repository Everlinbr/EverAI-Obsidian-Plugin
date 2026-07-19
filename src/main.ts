import {
	App,
	Plugin,
	WorkspaceLeaf,
} from "obsidian";

import { EverAISettings, DEFAULT_SETTINGS } from "./settings";
import { registerCommands } from "./commands";
import { EverAISettingTab } from "./ui/settings-tab";

import { BackendClient } from "./backend/client";
import { MemoryStore } from "./core/memory";
import { ChatManager } from "./core/chat-manager";

import { ChatView, VIEW_TYPE } from "./ui/chat-view";

export default class EverAIPlugin extends Plugin {

	settings!: EverAISettings;

	backendClient!: BackendClient;

	memoryStore!: MemoryStore;

	chatManager!: ChatManager;

	async onload(): Promise<void> {

		console.log("EverAI loading...");

		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);

		this.backendClient = new BackendClient(
			this.settings.backendUrl,
			this.settings.backendPort
		);

		this.memoryStore = new MemoryStore();

		this.chatManager = new ChatManager(
			this.backendClient,
			this.memoryStore
		);

		this.registerView(
			VIEW_TYPE,
			(leaf: WorkspaceLeaf) => {

				const view = new ChatView(leaf);

				view.setChatManager(this.chatManager);

				return view;

			}
		);

		registerCommands(this);

		this.addSettingTab(
			new EverAISettingTab(
				this.app,
				this
			)
		);

		if (this.settings.showChatSidebar) {
			await this.activateChatView();
		}

		console.log("EverAI loaded.");
	}

	async onunload(): Promise<void> {

		await this.app.workspace.detachLeavesOfType(VIEW_TYPE);

		console.log("EverAI unloaded.");

	}

	async saveSettings(): Promise<void> {

		await this.saveData(this.settings);

	}

	async activateChatView(): Promise<void> {

		let leaf = this.app.workspace
			.getLeavesOfType(VIEW_TYPE)[0];

		if (!leaf) {

			leaf = this.app.workspace.getRightLeaf(false);

			if (!leaf) return;

			await leaf.setViewState({
				type: VIEW_TYPE,
				active: true,
			});

		}

		this.app.workspace.revealLeaf(leaf);

	}
}
