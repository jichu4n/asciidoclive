import {Ace, edit} from 'ace-builds';
import 'ace-builds/webpack-resolver';
import * as $ from 'jquery';
import {autorun} from 'mobx';
import * as React from 'react';
import debug from 'debug';

export interface Size {
  height: number;
  width: number;
}

export interface Props {
  size: Size;
  body: string;
  onBodyChange: (newBody: string) => any;
}

class AceEditorView extends React.Component<Props> {
  componentDidMount() {
    this.aceEditor = edit(this.containerEl.current!);
    this.aceEditorSession = this.aceEditor.getSession();
    // For debugging.
    Object.assign(window, {
      aceEditor: this.aceEditor,
      aceEditorSession: this.aceEditorSession,
    });

    this.body = this.props.body;
    this.aceEditorSession.setValue(this.body);

    this.aceEditorSession
      .getDocument()
      .on('change', this.debouncedUpdate.bind(this));
    this.aceEditorSession.setMode('ace/mode/asciidoc');
    this.aceEditorSession.setUseWrapMode(true);
    this.aceEditor.setShowPrintMargin(false);
    // this.aceEditorSession.on('change', this.onScroll.bind(this));
    // this.aceEditorSession.on('changeScrollTop', this.onScroll.bind(this));
    this.disposeOnSizeChangeFn = autorun(this.onSizeChange.bind(this));
  }

  componentWillUnmount() {
    this.disposeOnSizeChangeFn();
  }

  render() {
    return <div className="ace-editor" ref={this.containerEl} />;
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.body !== prevProps.body && this.props.body !== this.body) {
      this.log('Body updated by parent');
      this.body = this.props.body;
      this.aceEditor.setValue(this.body);
    }
  }

  private onSizeChange() {
    let size = (this.props.size as any) as Size;
    $(this.containerEl.current!).css('width', size.width + 'px');
    $(this.containerEl.current!).css('height', size.height + 'px');
    this.aceEditor && this.aceEditor.resize();
  }

  private debouncedUpdate() {
    if (this.debounceState.nextUpdate !== null) {
      return;
    }
    let now = new Date().getTime();
    let timeSinceLastUpdate = now - this.debounceState.lastUpdateTs;
    if (timeSinceLastUpdate > this.debounceState.debounceMs) {
      this.debounceState.nextUpdate = setTimeout(this.update.bind(this), 0);
    } else {
      this.debounceState.nextUpdate = setTimeout(
        this.update.bind(this),
        this.debounceState.debounceMs - timeSinceLastUpdate
      );
    }
  }

  private update() {
    this.debounceState.lastUpdateTs = new Date().getTime();
    this.debounceState.nextUpdate = null;
    let newBody = this.aceEditorSession.getValue();
    if (this.body !== newBody) {
      this.body = newBody;
      this.props.onBodyChange(newBody);
    }
  }

  private log = debug('AceEditorView');
  private containerEl: React.RefObject<HTMLDivElement> = React.createRef();
  private aceEditor: Ace.Editor;
  private aceEditorSession: Ace.EditSession;
  private body: string;
  private disposeOnSizeChangeFn: () => any;
  private debounceState = {
    debounceMs: 100,
    lastUpdateTs: 0,
    nextUpdate: null as any,
  };
}

export default AceEditorView;
