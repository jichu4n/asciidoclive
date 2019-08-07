import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import * as React from 'react';
import StorageType from '../storage/storage-type';
import storageManager from '../storage/storage-manager';
import environment from '../environment/environment';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  storageType: StorageType | null;
  authSuccessAction: (() => void) | null;
  authSuccessActionLabel: string | null;
}

interface State {
  stage: 'auth-prompt' | 'auth-pending' | 'action';
}

class StorageAuthView extends React.Component<Props, State> {
  state: State = {
    stage: 'auth-prompt',
  };

  render() {
    if (!this.storageProvider) {
      return null;
    }
    let {displayName} = this.storageProvider;
    return (
      <Dialog
        open={this.props.isOpen}
        onClose={this.onClose.bind(this)}
        fullWidth={true}
      >
        {this.state.stage == 'auth-prompt' && (
          <>
            <DialogTitle>Log in to {displayName}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                To continue, you will need to log in to your {displayName}{' '}
                account.
              </DialogContentText>
              <DialogContentText>
                Your account and document data will only be processed on this
                computer, and no data will be shared with{' '}
                {environment.siteDisplayName}.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.onClose.bind(this)} color="primary">
                Cancel
              </Button>
              <Button onClick={this.onAuthClick.bind(this)} color="primary">
                Log in to {displayName}
              </Button>
            </DialogActions>
          </>
        )}
        {this.state.stage == 'auth-pending' && (
          <>
            <DialogTitle>Log in to {displayName}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Waiting for {displayName}...
              </DialogContentText>
            </DialogContent>
          </>
        )}
        {this.state.stage == 'action' && (
          <>
            <DialogTitle>Logged in to {displayName}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                You have successfully logged in to your {displayName} account.
              </DialogContentText>
              <DialogContentText>
                Press CONTINUE to {this.props.authSuccessActionLabel}.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.onActionClick.bind(this)} color="primary">
                Continue
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    );
  }

  private onClose() {
    this.props.onClose();
    setTimeout(() => {
      this.setState({stage: 'auth-prompt'});
    }, 1000);
  }

  private async onAuthClick() {
    this.setState({stage: 'auth-pending'});
    let authResult = await this.storageProvider!.auth();
    if (authResult) {
      this.setState({stage: 'action'});
    } else {
      this.onClose();
    }
  }

  private async onActionClick() {
    this.onClose();
    this.props.authSuccessAction && this.props.authSuccessAction();
  }

  private get storageProvider() {
    if (this.props.storageType == null) {
      return null;
    }
    return storageManager.getStorageProvider(this.props.storageType);
  }
}

export default StorageAuthView;
