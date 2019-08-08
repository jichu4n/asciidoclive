import {blueGrey as primaryColor} from '@material-ui/core/colors';
import CssBaseline from '@material-ui/core/CssBaseline';
import {createMuiTheme} from '@material-ui/core/styles';
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import * as React from 'react';
import {Helmet} from 'react-helmet';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import EditView from '../edit-view/edit-view';
import environment from '../environment/environment';
import DropboxAuthSuccessView from '../storage/dropbox-auth-success-view';
import './app.css';

const THEME = createMuiTheme({
  palette: {
    primary: primaryColor,
  },
});

class App extends React.Component {
  public render() {
    return (
      <>
        <Helmet>
          <title>{environment.siteTitle}</title>
        </Helmet>
        <ThemeProvider theme={THEME}>
          <CssBaseline />
          <Router>
            <Switch>
              <Route
                path="/dropbox-auth-success"
                component={DropboxAuthSuccessView}
              />
              <Route component={EditView} />
            </Switch>
          </Router>
        </ThemeProvider>
      </>
    );
  }
}

export default App;
