import * as React from 'react';
import EditView from '../edit-view/edit-view';
import CssBaseline from '@material-ui/core/CssBaseline';
import './app.css';

class App extends React.Component {
  public render() {
    return (
      <>
        <CssBaseline />
        <EditView />;
      </>
    );
  }
}

export default App;
