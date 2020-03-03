import Dialog from '@material-ui/core/Dialog';
import React from 'react';

interface Props {}

interface State {
  isOpen: boolean;
  content: React.ReactNode;
}

class StorageActionDialogView extends React.Component<Props, State> {
  state = {
    isOpen: true,
    content: null,
  };

  render() {
    return (
      <Dialog
        open={this.state.isOpen}
        fullWidth={true}
        disableBackdropClick={true}
        disableEscapeKeyDown={true}
      >
        {this.state.content}
      </Dialog>
    );
  }

  setContent(content: React.ReactNode) {
    this.setState({content});
    return this;
  }

  show() {
    this.setState({isOpen: true});
    return this;
  }

  hide() {
    this.setState({isOpen: false});
    return this;
  }
}

export default StorageActionDialogView;
