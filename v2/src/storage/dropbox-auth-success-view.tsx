import * as React from 'react';
import Typography from '@material-ui/core/Typography';
import storageManager from './storage-manager';
import StorageType from './storage-type';
import DropboxStorageProvider from './dropbox-storage-provider';

interface State {
  isSuccessful: boolean | null;
}

class DropboxAuthSuccessView extends React.Component<{}, State> {
  state: State = {
    isSuccessful: null,
  };

  render() {
    return (
      <div className="auth-message-container">
        <Typography variant="h5">
          {this.state.isSuccessful === null
            ? ''
            : this.state.isSuccessful
            ? 'Authentication successful'
            : 'Authentication error'}
        </Typography>
      </div>
    );
  }

  componentDidMount() {
    this.processOauthRedirectUrl();
  }

  private async processOauthRedirectUrl() {
    let dropboxStorageProvider = storageManager.getStorageProvider<
      DropboxStorageProvider
    >(StorageType.DROPBOX);
    if (await dropboxStorageProvider.processOauthRedirectUrl(window.location)) {
      this.setState({isSuccessful: true});
    } else {
      this.setState({isSuccessful: false});
    }
    setTimeout(() => window.close(), 2000);
  }
}

export default DropboxAuthSuccessView;
