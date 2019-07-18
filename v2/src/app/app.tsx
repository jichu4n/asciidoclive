import * as React from 'react';
import './app.css';
import EditView from '../edit-view/edit-view';
import {BlockingAsciidocCompiler} from '../document/asciidoc-compiler';

class App extends React.Component {
  public render() {
    // TODO
    window['compiler'] = new BlockingAsciidocCompiler();
    return <EditView />;
  }
}

export default App;
