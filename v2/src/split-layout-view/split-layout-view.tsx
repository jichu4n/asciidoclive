import * as $ from 'jquery';
import 'jquery-ui-dist/jquery-ui';
import * as _ from 'lodash';
import * as React from 'react';

export interface Props {
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
  onResize?: () => any;
  minPaneWidth?: number;
}

const DEFAULT_MIN_PANE_WIDTH = 200;

class EditView extends React.Component<Props, object> {
  private containerEl: React.RefObject<HTMLDivElement> = React.createRef();
  private leftEl: React.RefObject<HTMLDivElement> = React.createRef();
  private rightEl: React.RefObject<HTMLDivElement> = React.createRef();
  private resizeHandleEl: React.RefObject<HTMLDivElement> = React.createRef();

  public render() {
    return (
      <div
        ref={this.containerEl}
        className={`split-layout ${this.props.className}`}
      >
        <div ref={this.leftEl} className="split-layout-left">
          {this.props.left}
        </div>
        <div
          ref={this.resizeHandleEl}
          className="split-layout-resize-handle ui-resizable-handle ui-resizable-e"
        />
        <div ref={this.rightEl} className="split-layout-right">
          {this.props.right}
        </div>
      </div>
    );
  }

  public componentDidMount() {
    ($(this.leftEl.current!) as any).resizable({
      handles: {e: $(this.resizeHandleEl.current!)},
      minWidth: this.minPaneWidth,
      maxWidth: this.maxPaneWidth,
      resize: this.props.onResize,
    });
    this.props.onResize && $(window).resize(this.props.onResize);
  }

  public componentWillUnmount() {
    this.props.onResize && $(window).off('resize', this.props.onResize);
    ($(this.leftEl.current!) as any).resizable('destroy');
  }

  get maxPaneWidth() {
    return (
      $(this.containerEl.current!).width()! -
      this.minPaneWidth -
      $(this.resizeHandleEl.current!).width()!
    );
  }

  get minPaneWidth() {
    return _.defaultTo(this.props.minPaneWidth, DEFAULT_MIN_PANE_WIDTH);
  }
}

export default EditView;
