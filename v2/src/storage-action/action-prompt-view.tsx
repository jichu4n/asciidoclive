import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import React from 'react';

interface Props {
  storageProviderDisplayName: string;
  actionLabel: string;
  onCancel: () => void;
  onStartAction: () => void;
}

class ActionPromptView extends React.Component<Props> {
  render() {
    const {
      storageProviderDisplayName,
      actionLabel,
      onCancel,
      onStartAction,
    } = this.props;
    return (
      <>
        <DialogTitle>Logged in to {storageProviderDisplayName}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have successfully logged in to your {storageProviderDisplayName}{' '}
            account.
          </DialogContentText>
          <DialogContentText>
            Press CONTINUE to {actionLabel}.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={onStartAction} color="primary">
            Continue
          </Button>
        </DialogActions>
      </>
    );
  }
}

export default ActionPromptView;
