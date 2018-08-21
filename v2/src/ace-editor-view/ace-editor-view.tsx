import {Ace, edit} from 'ace-builds';
import 'ace-builds/webpack-resolver';
import * as $ from 'jquery';
import {autorun} from 'mobx';
import * as React from 'react';

export interface Size {
  height: number;
  width: number;
}

export interface Props {
  size: Size;
}

class AceEditorView extends React.Component<Props> {
  public render() {
    return <div className="ace-editor" ref={this.containerEl} />;
  }

  public componentDidMount() {
    this.aceEditor = edit(this.containerEl.current!);
    this.aceEditorSession = this.aceEditor.getSession();
    // For debugging.
    Object.assign(window, {
      aceEditor: this.aceEditor,
      aceEditorSession: this.aceEditorSession,
    });

    // this.aceEditorSession.setValue(this.get('doc.body').toString() || '');
    // this.aceEditorSession.on('change', this.debouncedUpdate.bind(this));
    this.aceEditorSession.setMode('ace/mode/asciidoc');
    this.aceEditorSession.setUseWrapMode(true);
    this.aceEditor.setShowPrintMargin(false);
    // this.aceEditorSession.on('change', this.onScroll.bind(this));
    // this.aceEditorSession.on('changeScrollTop', this.onScroll.bind(this));
    this.disposeOnSizeChangeFn = autorun(this.onSizeChange.bind(this));
  }

  public componentWillUnmount() {
    this.disposeOnSizeChangeFn();
  }

  private onSizeChange() {
    let size = (this.props.size as any) as Size;
    $(this.containerEl.current!).css('width', size.width + 'px');
    $(this.containerEl.current!).css('height', size.height + 'px');
    this.aceEditor && this.aceEditor.resize();
  }

  private containerEl: React.RefObject<HTMLDivElement> = React.createRef();
  private aceEditor: Ace.Editor;
  private aceEditorSession: Ace.EditSession;
  private disposeOnSizeChangeFn: () => any;
}

export default AceEditorView;
