import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import React from 'react';

interface Props {
  storageProviderDisplayName: string;
}

class AuthPromptView extends React.Component<Props> {
  render() {
    const {storageProviderDisplayName} = this.props;
    return (
      <>
        <DialogTitle>Log in to {storageProviderDisplayName}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Waiting for {storageProviderDisplayName}...
          </DialogContentText>
        </DialogContent>
      </>
    );
  }
}

export default AuthPromptView;
