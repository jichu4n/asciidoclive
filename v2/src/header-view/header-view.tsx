import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import * as React from 'react';

interface Props {
  right?: React.ReactNode;
}

class HeaderView extends React.Component<Props> {
  render() {
    return (
      <AppBar position="fixed">
        <Toolbar disableGutters={true}>
          <div className="header-padding" />
          <img src="/assets/logo.svg" className="header-logo" />
          <div className="header-spacer">&nbsp;</div>
          {this.props.right}
          <div className="header-padding" />
        </Toolbar>
      </AppBar>
    );
  }
}

export default HeaderView;
