import {blueGrey as primaryColor} from '@material-ui/core/colors';
import CssBaseline from '@material-ui/core/CssBaseline';
import {createMuiTheme} from '@material-ui/core/styles';
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import * as React from 'react';
import EditView from '../edit-view/edit-view';
import './app.css';

const THEME = createMuiTheme({
  palette: {
    primary: primaryColor,
  },
});

class App extends React.Component {
  public render() {
    return (
      <ThemeProvider theme={THEME}>
        <CssBaseline />
        <EditView />;
      </ThemeProvider>
    );
  }
}

export default App;
