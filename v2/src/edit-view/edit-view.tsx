import * as React from 'react';
import SplitLayoutView from '../split-layout-view/split-layout-view';

class EditView extends React.Component {
  public render() {
    // TODO
    return (
      <SplitLayoutView
        left={<div />}
        right={<div />}
        className="edit-split-layout"
        onResize={() => this.onResize()}
      />
    );
  }

  private onResize() {
    console.log('onResize');
  }
}

export default EditView;
