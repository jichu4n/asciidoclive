import {observable} from 'mobx';
import {observer} from 'mobx-react';
import {fromPromise, IPromiseBasedObservable} from 'mobx-utils';
import * as React from 'react';
import DocManager from 'src/document/doc-manager';
import AceEditorView, {Size} from '../ace-editor-view/ace-editor-view';
import PreviewView from '../preview-view/preview-view';
import SplitLayoutView from '../split-layout-view/split-layout-view';

@observer
class EditView extends React.Component {
  render() {
    return this.docManager.case({
      pending: () => <div />,
      fulfilled: (docManager) => (
        <SplitLayoutView
          left={
            <AceEditorView
              size={this.aceEditorSize}
              initialBody={docManager.doc.body}
              onBodyChange={docManager.setBody.bind(this.docManager)}
            />
          }
          right={<PreviewView compiledBody={docManager.doc.compiledBody} />}
          className="edit-split-layout"
          onResize={(d) => {
            this.aceEditorSize.width = d.leftPaneWidth;
            this.aceEditorSize.height = d.height;
          }}
        />
      ),
    });
  }

  private async doInitialLoad() {
    let body = await (await fetch('/assets/scratch.txt')).text();
    let docManager = new DocManager();
    docManager.setBody(body);
    return docManager;
  }

  @observable
  private aceEditorSize: Size = {
    width: 0,
    height: 0,
  };

  private docManager: IPromiseBasedObservable<DocManager> = fromPromise(
    this.doInitialLoad()
  );
}

export default EditView;
