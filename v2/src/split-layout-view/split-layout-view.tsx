import $ from 'jquery';
import 'jquery-ui-dist/jquery-ui';
import * as _ from 'lodash';
import * as React from 'react';

export interface Dimensions {
  leftPaneWidth: number;
  rightPaneWidth: number;
  height: number;
}

export interface Props {
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
  onResize?: (d: Dimensions) => any;
  minPaneWidth?: number;
}

const DEFAULT_MIN_PANE_WIDTH = 200;

class SplitLayoutView extends React.Component<Props> {
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
    $(window).resize(this.onWindowResizeFn);
    this.onWindowResize();
  }

  public componentWillUnmount() {
    $(window).off('resize', this.onWindowResizeFn);
    ($(this.leftEl.current!) as any).resizable('destroy');
  }

  private onWindowResize() {
    let maxPaneWidth = this.maxPaneWidth;
    ($(this.leftEl.current!) as any).resizable(
      'option',
      'maxWidth',
      maxPaneWidth
    );
    if ($(this.leftEl.current!).width()! > maxPaneWidth) {
      $(this.leftEl.current!).width(maxPaneWidth);
    }
    this.props.onResize &&
      this.props.onResize({
        leftPaneWidth: $(this.leftEl.current!).width()!,
        rightPaneWidth: $(this.rightEl.current!).width()!,
        height: $(this.containerEl.current!).height()!,
      });
  }

  private get maxPaneWidth() {
    return (
      $(this.containerEl.current!).width()! -
      this.minPaneWidth -
      $(this.resizeHandleEl.current!).width()!
    );
  }

  private get minPaneWidth() {
    return _.defaultTo(this.props.minPaneWidth, DEFAULT_MIN_PANE_WIDTH);
  }

  private containerEl: React.RefObject<HTMLDivElement> = React.createRef();
  private leftEl: React.RefObject<HTMLDivElement> = React.createRef();
  private rightEl: React.RefObject<HTMLDivElement> = React.createRef();
  private resizeHandleEl: React.RefObject<HTMLDivElement> = React.createRef();
  private onWindowResizeFn = this.onWindowResize.bind(this);
}

export default SplitLayoutView;
