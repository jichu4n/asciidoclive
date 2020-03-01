import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import React from 'react';

interface Props {
  storageProviderDisplayName: string;
  actionTitle: string;
  actionErrorMessage?: string;
  onClose: () => void;
}

class ActionErrorView extends React.Component<Props> {
  render() {
    const {
      storageProviderDisplayName,
      actionTitle,
      actionErrorMessage,
      onClose,
    } = this.props;
    return (
      <>
        <DialogTitle>{actionTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            An error occurred while communicating with{' '}
            {storageProviderDisplayName}. Please try again or report the error.
          </DialogContentText>
          {actionErrorMessage && (
            <DialogContentText>
              Error message: {actionErrorMessage}
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            OK
          </Button>
        </DialogActions>
      </>
    );
  }
}

export default ActionErrorView;
