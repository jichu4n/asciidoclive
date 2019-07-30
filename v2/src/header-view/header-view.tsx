import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import * as React from 'react';

class HeaderView extends React.Component {
  render() {
    return (
      <AppBar position="fixed">
        <Toolbar>
          <img src="/assets/logo.svg" className="header-logo" />
        </Toolbar>
      </AppBar>
    );
  }
}

export default HeaderView;
