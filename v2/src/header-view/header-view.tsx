import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';

class HeaderView extends React.Component {
  render() {
    return (
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" noWrap={true}>
            asciidoclive
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }
}

export default HeaderView;
