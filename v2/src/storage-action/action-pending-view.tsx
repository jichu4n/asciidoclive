import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import React from 'react';

interface Props {
  storageProviderDisplayName: string;
  actionTitle: string;
}

class ActionPendingView extends React.Component<Props> {
  render() {
    const {storageProviderDisplayName, actionTitle} = this.props;
    return (
      <>
        <DialogTitle>{actionTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Waiting for {storageProviderDisplayName}...
          </DialogContentText>
        </DialogContent>
      </>
    );
  }
}

export default ActionPendingView;
