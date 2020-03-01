import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import React from 'react';
import environment from '../environment/environment';

interface Props {
  storageProviderDisplayName: string;
  onCancel: () => void;
  onStartAuth: () => void;
}

class AuthPromptView extends React.Component<Props> {
  render() {
    const {storageProviderDisplayName, onCancel, onStartAuth} = this.props;
    return (
      <>
        <DialogTitle>Log in to {storageProviderDisplayName}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To continue, you will need to log in to your{' '}
            {storageProviderDisplayName} account.
          </DialogContentText>
          <DialogContentText>
            Your account and document data will only be processed on this
            computer, and no data will be shared with{' '}
            {environment.siteDisplayName}.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={onStartAuth} color="primary">
            Log in to {storageProviderDisplayName}
          </Button>
        </DialogActions>
      </>
    );
  }
}

export default AuthPromptView;
