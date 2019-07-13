import * as React from 'react';
import './app.css';
import EditView from '../edit-view/edit-view';
import { AsyncAsciidocCompiler } from '../document/asciidoc-compiler';

class App extends React.Component {
  constructor(props: any) {
    super(props);
    window['compiler'] = new AsyncAsciidocCompiler();
  }
  public render() {
    // TODO
    return <EditView />;
  }
}

export default App;
