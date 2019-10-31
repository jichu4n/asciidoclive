import ComputerIcon from '@material-ui/icons/Computer';
import OpenIcon from '@material-ui/icons/FolderOpen';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import SaveIcon from '@material-ui/icons/Save';
import SettingsIcon from '@material-ui/icons/Settings';
import debug from 'debug';
import DropboxIcon from 'mdi-material-ui/Dropbox';
import GoogleDriveIcon from 'mdi-material-ui/GoogleDrive';
import {observable} from 'mobx';
import {observer} from 'mobx-react';
import {fromPromise, IPromiseBasedObservable} from 'mobx-utils';
import * as React from 'react';
import {Helmet} from 'react-helmet';
import {DocData, getTitleOrDefault} from '..//document/doc';
import AceEditorView, {Size} from '../ace-editor-view/ace-editor-view';
import DocManager from '../document/doc-manager';
import environment from '../environment/environment';
import HeaderView from '../header-view/header-view';
import PreviewView from '../preview-view/preview-view';
import SplitLayoutView from '../split-layout-view/split-layout-view';
import storageManager from '../storage/storage-manager';
import StorageProvider from '../storage/storage-provider';
import StorageType from '../storage/storage-type';
import MenuIconView, {MenuItemSpec} from './menu-icon-view';
import StorageActionView, {Stage} from './storage-action-view';
import TitleView from '../title-view/title-view';
import HelpMenuView from './help-menu-view';

interface State {
  storageActionViewState: {
    isOpen: boolean;
    storageType: StorageType | null;
    action: (() => Promise<void>) | null;
    actionLabel: string | null;
    actionTitle: string | null;
    initialStage: Stage | null;
    actionResultPromise: Promise<any> | null;
  };
}

@observer
class EditView extends React.Component<{}, State> {
  state: State = {
    storageActionViewState: {
      isOpen: false,
      storageType: null,
      action: null,
      actionLabel: null,
      actionTitle: null,
      initialStage: null,
      actionResultPromise: null,
    },
  };

  render() {
    let {storageActionViewState} = this.state;
    return this.docManager.case({
      pending: () => <div />,
      rejected: (e) => {
        console.error(e);
        return <div />;
      },
      fulfilled: (docManager) => (
        <>
          {(docManager.doc.title || docManager.doc.isDirty) && (
            <Helmet>
              <title>
                {`${docManager.doc.isDirty ? '*' : ''}${getTitleOrDefault(
                  docManager.doc
                )} - ${environment.siteTitle}`}
              </title>
            </Helmet>
          )}
          <HeaderView right={this.renderHeaderRight(docManager)} />
          <TitleView docManager={docManager} className="edit-title" />
          <SplitLayoutView
            left={
              <AceEditorView
                size={this.aceEditorSize}
                body={docManager.doc.body}
                onBodyChange={this.onBodyChange.bind(this, docManager)}
              />
            }
            right={<PreviewView compiledBody={docManager.doc.compiledBody} />}
            className="edit-split-layout"
            onResize={(d) => {
              this.aceEditorSize.width = d.leftPaneWidth;
              this.aceEditorSize.height = d.height;
            }}
          />
          <StorageActionView
            isOpen={storageActionViewState.isOpen}
            onClose={this.onStorageActionViewClose.bind(this)}
            storageType={storageActionViewState.storageType}
            action={storageActionViewState.action}
            actionLabel={storageActionViewState.actionLabel}
            actionTitle={storageActionViewState.actionTitle}
            initialStage={storageActionViewState.initialStage}
            actionResultPromise={storageActionViewState.actionResultPromise}
          />
        </>
      ),
    });
  }

  private renderHeaderRight(docManager: DocManager) {
    let {doc} = docManager;
    let docStorageProvider =
      doc.source && doc.source.storageType
        ? storageManager.getStorageProvider(doc.source.storageType)
        : null;
    let DocStorageProviderIcon = docStorageProvider
      ? docStorageProvider.storageTypeIcon
      : null;
    return (
      <>
        <MenuIconView
          tooltipLabel="Open"
          icon={<OpenIcon />}
          menuItems={[
            {
              item: 'New Document',
              icon: <InsertDriveFileIcon />,
              onClick: this.onNewDocClick.bind(this),
            },
            'divider',
            {subheader: 'Open from'},
            ...storageManager.storageProviders.map(
              ({storageType, displayName, storageTypeIcon: Icon}) => ({
                item: displayName,
                icon: <Icon />,
                onClick: this.onOpenClick.bind(this, storageType),
              })
            ),
            {item: 'Local file', icon: <ComputerIcon />},
          ]}
        />
        <MenuIconView
          tooltipLabel="Save"
          icon={<SaveIcon />}
          menuItems={[
            ...(docStorageProvider && DocStorageProviderIcon
              ? ([
                  {
                    item: doc.title,
                    icon: <DocStorageProviderIcon />,
                    onClick: this.doSave.bind(this, docStorageProvider),
                  },
                  'divider',
                ] as Array<MenuItemSpec>)
              : []),
            {subheader: 'Save to'},
            {
              item: 'Dropbox',
              icon: <DropboxIcon />,
              onClick: this.onSaveAsClick.bind(this, StorageType.DROPBOX),
            },
            {
              item: 'Google Drive',
              icon: <GoogleDriveIcon />,
              onClick: this.onSaveAsClick.bind(this, StorageType.GOOGLE_DRIVE),
            },
            {item: 'Local file', icon: <ComputerIcon />},
          ]}
        />
        <MenuIconView tooltipLabel="Settings" icon={<SettingsIcon />} />
        <HelpMenuView/>
      </>
    );
  }

  private async doInitialLoad() {
    try {
      this.scratchText = await (await fetch('/assets/scratch.txt')).text();
    } catch (e) {
      console.error(`Error fetching initial document body`, e);
    }
    let docManager = new DocManager();
    docManager.setBody(this.scratchText);
    return docManager;
  }

  private onBodyChange(docManager: DocManager, newBody: string) {
    docManager.setBody(newBody).setIsDirty(true);
  }

  private async onNewDocClick() {
    let docData: DocData = {
      title: '',
      body: this.scratchText,
      source: undefined,
    };
    (await this.docManager).setDocData(docData).setIsDirty(false);
  }

  private onOpenClick(storageType: StorageType) {
    let storageProvider = storageManager.getStorageProvider(storageType);
    if (storageProvider.isAuthenticated) {
      this.doOpen(storageProvider);
    } else {
      this.setState({
        storageActionViewState: {
          isOpen: true,
          storageType: storageType,
          action: () => this.doOpen(storageProvider),
          actionLabel: `select a document from ${storageProvider.displayName}`,
          actionTitle: `Open from ${storageProvider.displayName}`,
          initialStage: 'auth-prompt',
          actionResultPromise: null,
        },
      });
    }
  }

  private async doOpen(storageProvider: StorageProvider) {
    let resultPromise = storageProvider.open();
    this.setState({
      storageActionViewState: {
        isOpen: true,
        storageType: storageProvider.storageType,
        action: null,
        actionLabel: null,
        actionTitle: `Open from ${storageProvider.displayName}`,
        initialStage: 'action-pending',
        actionResultPromise: resultPromise,
      },
    });
    let docData = await resultPromise;
    if (docData) {
      this.log('Loading new doc data', docData);
      (await this.docManager).setDocData(docData).setIsDirty(false);
    }
  }

  private onSaveAsClick(storageType: StorageType) {
    let storageProvider = storageManager.getStorageProvider(storageType);
    if (storageProvider.isAuthenticated) {
      this.doSaveAs(storageProvider);
    } else {
      this.setState({
        storageActionViewState: {
          isOpen: true,
          storageType: storageType,
          action: () => this.doSaveAs(storageProvider),
          actionLabel: `save this document to ${storageProvider.displayName}`,
          actionTitle: `Save to ${storageProvider.displayName}`,
          initialStage: 'auth-prompt',
          actionResultPromise: null,
        },
      });
    }
  }

  private async doSaveAs(storageProvider: StorageProvider) {
    let resultPromise = storageProvider.saveAs((await this.docManager).doc);
    this.setState({
      storageActionViewState: {
        isOpen: true,
        storageType: storageProvider.storageType,
        action: null,
        actionLabel: null,
        actionTitle: `Save to ${storageProvider.displayName}`,
        initialStage: 'action-pending',
        actionResultPromise: resultPromise,
      },
    });
    let docData = await resultPromise;
    if (docData) {
      this.log('Switching to saved doc data', docData);
      (await this.docManager).setDocData(docData).setIsDirty(false);
    }
  }

  private async doSave(storageProvider: StorageProvider) {
    let resultPromise = storageProvider.save((await this.docManager).doc);
    this.setState({
      storageActionViewState: {
        isOpen: true,
        storageType: storageProvider.storageType,
        action: null,
        actionLabel: null,
        actionTitle: `Save to ${storageProvider.displayName}`,
        initialStage: 'action-pending',
        actionResultPromise: resultPromise,
      },
    });
    if (await resultPromise) {
      (await this.docManager).setIsDirty(false);
    }
  }

  private onStorageActionViewClose() {
    this.setState({
      storageActionViewState: {
        ...this.state.storageActionViewState,
        isOpen: false,
      },
    });
  }

  private readonly log = debug('EditView');
  @observable
  private aceEditorSize: Size = {
    width: 0,
    height: 0,
  };
  private docManager: IPromiseBasedObservable<DocManager> = fromPromise(
    this.doInitialLoad()
  );
  private scratchText: string;
}

export default EditView;
