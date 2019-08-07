import ComputerIcon from '@material-ui/icons/Computer';
import OpenIcon from '@material-ui/icons/FolderOpen';
import HelpIcon from '@material-ui/icons/Help';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import SaveIcon from '@material-ui/icons/Save';
import SettingsIcon from '@material-ui/icons/Settings';
import DropboxIcon from 'mdi-material-ui/Dropbox';
import GoogleDriveIcon from 'mdi-material-ui/GoogleDrive';
import {observable} from 'mobx';
import {observer} from 'mobx-react';
import {fromPromise, IPromiseBasedObservable} from 'mobx-utils';
import * as React from 'react';
import DocManager from 'src/document/doc-manager';
import AceEditorView, {Size} from '../ace-editor-view/ace-editor-view';
import HeaderView from '../header-view/header-view';
import PreviewView from '../preview-view/preview-view';
import SplitLayoutView from '../split-layout-view/split-layout-view';
import storageManager from '../storage/storage-manager';
import StorageType from '../storage/storage-type';
import MenuIconView from './menu-icon-view';
import StorageAuthView from './storage-auth-view';

interface State {
  storageAuthViewIsOpen: boolean;
  storageAuthViewStorageType: StorageType | null;
  storageAuthViewAuthSuccessAction: (() => void) | null;
  storageAuthViewAuthSuccessActionLabel: string | null;
}

@observer
class EditView extends React.Component<{}, State> {
  state: State = {
    storageAuthViewIsOpen: false,
    storageAuthViewStorageType: null,
    storageAuthViewAuthSuccessAction: null,
    storageAuthViewAuthSuccessActionLabel: null,
  };

  render() {
    return this.docManager.case({
      pending: () => <div />,
      rejected: (e) => {
        console.error(e);
        return <div />;
      },
      fulfilled: (docManager) => (
        <>
          <HeaderView right={this.renderHeaderRight()} />
          <SplitLayoutView
            left={
              <AceEditorView
                size={this.aceEditorSize}
                initialBody={docManager.doc.body}
                onBodyChange={docManager.setBody.bind(docManager)}
              />
            }
            right={<PreviewView compiledBody={docManager.doc.compiledBody} />}
            className="edit-split-layout"
            onResize={(d) => {
              this.aceEditorSize.width = d.leftPaneWidth;
              this.aceEditorSize.height = d.height;
            }}
          />
          <StorageAuthView
            isOpen={this.state.storageAuthViewIsOpen}
            onClose={() => this.setState({storageAuthViewIsOpen: false})}
            storageType={this.state.storageAuthViewStorageType}
            authSuccessAction={this.state.storageAuthViewAuthSuccessAction}
            authSuccessActionLabel={
              this.state.storageAuthViewAuthSuccessActionLabel
            }
          />
        </>
      ),
    });
  }

  private renderHeaderRight() {
    return (
      <>
        <MenuIconView
          tooltipLabel="Open"
          icon={<OpenIcon />}
          menuItems={[
            {item: 'New Document', icon: <InsertDriveFileIcon />},
            'divider',
            {subheader: 'Open from'},
            {
              item: 'Dropbox',
              icon: <DropboxIcon />,
              onClick: this.onOpen.bind(this, StorageType.DROPBOX),
            },
            {item: 'Google Drive', icon: <GoogleDriveIcon />},
            {item: 'Local file', icon: <ComputerIcon />},
          ]}
        />
        <MenuIconView tooltipLabel="Save" icon={<SaveIcon />} />
        <MenuIconView tooltipLabel="Settings" icon={<SettingsIcon />} />
        <MenuIconView tooltipLabel="Help" icon={<HelpIcon />} />
      </>
    );
  }

  private async doInitialLoad() {
    let body = '';
    try {
      body = await (await fetch('/assets/scratch.txt')).text();
    } catch (e) {
      console.error(`Error fetching initial document body`, e);
    }
    let docManager = new DocManager();
    docManager.setBody(body);
    return docManager;
  }

  private onOpen(storageType: StorageType) {
    let storageProvider = storageManager.getStorageProvider(storageType);
    if (storageProvider.isAuthenticated) {
      storageProvider.open();
    } else {
      this.setState({
        storageAuthViewIsOpen: true,
        storageAuthViewStorageType: storageType,
        storageAuthViewAuthSuccessAction: () => storageProvider.open(),
        storageAuthViewAuthSuccessActionLabel: `select a document from ${
          storageProvider.displayName
        }`,
      });
    }
  }

  @observable
  private aceEditorSize: Size = {
    width: 0,
    height: 0,
  };

  private docManager: IPromiseBasedObservable<DocManager> = fromPromise(
    this.doInitialLoad()
  );
}

export default EditView;
