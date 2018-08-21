import {observable} from 'mobx';
import * as React from 'react';
import AceEditorView, {Size} from '../ace-editor-view/ace-editor-view';
import SplitLayoutView from '../split-layout-view/split-layout-view';

class EditView extends React.Component {
  public render() {
    // TODO
    return (
      <SplitLayoutView
        left={<AceEditorView size={this.aceEditorSize} />}
        right={<div />}
        className="edit-split-layout"
        onResize={(d) => {
          this.aceEditorSize.width = d.leftPaneWidth;
          this.aceEditorSize.height = d.height;
        }}
      />
    );
  }

  @observable
  private aceEditorSize: Size = {
    width: 0,
    height: 0,
  };
}

export default EditView;
