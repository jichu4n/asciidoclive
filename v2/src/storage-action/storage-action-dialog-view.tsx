import Dialog from '@material-ui/core/Dialog';
import React from 'react';

interface Props {
  content: React.ReactNode;
}

interface State {
  isOpen: boolean;
}

class StorageActionDialogView extends React.Component<Props, State> {
  state = {
    isOpen: true,
  };

  render() {
    return (
      <Dialog
        open={this.state.isOpen}
        fullWidth={true}
        disableBackdropClick={true}
        disableEscapeKeyDown={true}
      >
        {this.props.content}
      </Dialog>
    );
  }

  show() {
    this.setState({isOpen: true});
  }

  hide() {
    this.setState({isOpen: false});
  }
}

export default StorageActionDialogView;
