import debug from 'debug';
import React from 'react';
import ReactDOM from 'react-dom';
import {DocData} from '../document/doc';
import storageManager from '../storage/storage-manager';
import StorageProvider from '../storage/storage-provider';
import StorageType from '../storage/storage-type';
import ActionErrorView from './action-error-view';
import ActionPendingView from './action-pending-view';
import ActionPromptView from './action-prompt-view';
import AuthPendingView from './auth-pending-view';
import AuthPromptView from './auth-prompt-view';
import StorageActionDialogView from './storage-action-dialog-view';

/** Element ID of storage action dialog in DOM. */
const STORAGE_ACTION_DIALOG_ELEMENT_ID = 'storage-action-dialog';

/** Imperative interface to storage actions. */
class StorageActionController {
  async open(storageType: StorageType): Promise<DocData | null> {
    const storageProvider = storageManager.getStorageProvider(storageType);
    if (
      !(await this.doAuth(
        storageProvider,
        `select a document from ${storageProvider.displayName}`
      ))
    ) {
      return null;
    }

    const openPromise = storageProvider.open();
    this.showActionProgress(
      storageProvider,
      `Open from ${storageProvider.displayName}`,
      openPromise
    );
    return openPromise;
  }

  /*
  async saveAs(
    storageType: StorageType,
    docData: DocData
  ): Promise<DocData | null> {
    return null;
  }

  async save(docData: DocData): Promise<boolean> {
    return null;
  }
  */

  private async doAuth(
    storageProvider: StorageProvider,
    actionLabel: string
  ): Promise<boolean> {
    if (storageProvider.isAuthenticated) {
      this.log(`Skipping auth flow for ${storageProvider.displayName}`);
      return true;
    }
    const shouldStartAuth = await this.showAuthPrompt(storageProvider);
    if (!shouldStartAuth) {
      this.log(`Auth flow for ${storageProvider.displayName} cancelled`);
      this.dialogView!.hide();
      return false;
    }
    await this.showAuthPending(storageProvider);
    if (!(await storageProvider.auth())) {
      this.log(`Auth flow for ${storageProvider.displayName} aborted`);
      this.dialogView!.hide();
      return false;
    }
    this.log(`Completed auth flow for ${storageProvider.displayName}`);
    if (!(await this.showActionPrompt(storageProvider, actionLabel))) {
      this.log(`Dismissing action prompt for ${storageProvider.displayName}`);
      this.dialogView!.hide();
      return false;
    }
    this.dialogView!.hide();
    return true;
  }

  private showAuthPrompt(storageProvider: StorageProvider): Promise<boolean> {
    this.log(`Showing auth prompt for ${storageProvider.displayName}`);
    return new Promise<boolean>((resolve) => {
      this.showDialogView(
        <AuthPromptView
          storageProviderDisplayName={storageProvider.displayName}
          onCancel={() => resolve(false)}
          onStartAuth={() => resolve(true)}
        />
      );
    });
  }

  private showAuthPending(storageProvider: StorageProvider): Promise<void> {
    this.log(`Showing auth pending for ${storageProvider.displayName}`);
    return this.showDialogView(
      <AuthPendingView
        storageProviderDisplayName={storageProvider.displayName}
      />
    );
  }

  private showActionPrompt(
    storageProvider: StorageProvider,
    actionLabel: string
  ): Promise<boolean> {
    this.log(`Showing action prompt for ${storageProvider.displayName}`);
    return new Promise<boolean>((resolve) => {
      this.showDialogView(
        <ActionPromptView
          storageProviderDisplayName={storageProvider.displayName}
          actionLabel={actionLabel}
          onCancel={() => resolve(false)}
          onStartAction={() => resolve(true)}
        />
      );
    });
  }

  private async showActionProgress<ResultT>(
    storageProvider: StorageProvider,
    actionTitle: string,
    resultPromise: Promise<ResultT>
  ) {
    await this.showActionPending(storageProvider, actionTitle);
    try {
      await resultPromise;
      this.log(`Completed action for ${storageProvider.displayName}`);
    } catch (e) {
      const message = e && e.message;
      await this.showActionError(storageProvider, actionTitle, message);
      this.log(`Dismissing action error for ${storageProvider.displayName}`);
    }
    this.dialogView!.hide();
  }

  private showActionPending(
    storageProvider: StorageProvider,
    actionTitle: string
  ): Promise<void> {
    this.log(`Action pending for ${storageProvider.displayName}`);
    return this.showDialogView(
      <ActionPendingView
        storageProviderDisplayName={storageProvider.displayName}
        actionTitle={actionTitle}
      />
    );
  }

  private showActionError(
    storageProvider: StorageProvider,
    actionTitle: string,
    actionErrorMessage?: string
  ): Promise<void> {
    this.log(`Showing action error for ${storageProvider.displayName}`);
    return new Promise<void>((resolve) => {
      this.showDialogView(
        <ActionErrorView
          storageProviderDisplayName={storageProvider.displayName}
          actionTitle={actionTitle}
          actionErrorMessage={actionErrorMessage}
          onClose={resolve}
        />
      );
    });
  }

  private async showDialogView(content: React.ReactNode): Promise<void> {
    await this.renderDialogView();
    this.dialogView!.setContent(content).show();
  }

  private renderDialogView(): Promise<void> {
    if (this.renderDialogViewPromise) {
      return this.renderDialogViewPromise;
    }
    this.renderDialogViewPromise = new Promise<void>((resolve) => {
      ReactDOM.render(
        <StorageActionDialogView ref={this.dialogViewRef} />,
        this.getOrCreateDialogViewElement(),
        resolve
      );
    });
    return this.renderDialogViewPromise;
  }

  private getOrCreateDialogViewElement() {
    let dialogEl = document.getElementById(STORAGE_ACTION_DIALOG_ELEMENT_ID);
    if (!dialogEl) {
      dialogEl = document.createElement('div');
      dialogEl.setAttribute('id', STORAGE_ACTION_DIALOG_ELEMENT_ID);
      document.body.appendChild(dialogEl);
    }
    return dialogEl;
  }

  private get dialogView() {
    return this.dialogViewRef.current;
  }

  private readonly log = debug('StorageActionController');
  private dialogViewRef = React.createRef<StorageActionDialogView>();
  private renderDialogViewPromise: Promise<void> | undefined;
}

export default new StorageActionController();
