import debug from 'debug';
import {when} from 'mobx';
import * as React from 'react';
import GoogleDriveStorageProvider from './google-drive-storage-provider';

class GoogleDrivePickerView extends React.Component {
  constructor(props: {}) {
    super(props);
    if (!window.opener) {
      this.log('No parent window!');
      window.close();
      return;
    }
    if (!this.googleDriveStorageProvider.isEnabled) {
      this.log('Google Drive is not enabled!');
      return;
    }
    when(
      () => this.googleDriveStorageProvider.isReady,
      this.onGoogleDriveStorageProviderReady.bind(this)
    );
  }

  render() {
    return <div />;
  }

  private async onGoogleDriveStorageProviderReady() {
    if (!this.googleDriveStorageProvider.isAuthenticated) {
      this.log('Not authenticated!');
      return;
    }
    this.googleDriveStorageProvider.openWithPickerInPopup();
  }

  private readonly log = debug('GoogleDriveStorageProvider');
  private readonly googleDriveStorageProvider = new GoogleDriveStorageProvider();
}

export default GoogleDrivePickerView;
