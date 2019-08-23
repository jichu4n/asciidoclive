import FileIcon from 'mdi-material-ui/FileDocumentOutline';
import {observer} from 'mobx-react';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';
import {getTitleOrDefault} from '..//document/doc';
import DocManager from '../document/doc-manager';
import storageManager from '../storage/storage-manager';

interface Props {
  docManager: DocManager;
  className?: string;
}

interface State {
  pendingTitle: string | null;
  titleWidth: number;
  renameState: 'none' | 'in-progress' | 'success' | 'failed';
}

@observer
class TitleView extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      pendingTitle: null,
      titleWidth: 0,
      renameState: 'none',
    };
  }

  render() {
    let Icon = this.doc.source
      ? storageManager.getStorageProvider(this.doc.source.storageType)
          .storageTypeIcon
      : FileIcon;
    let displayedTitle = this.getDisplayedTitle();
    return (
      <div className={`title-container ${this.props.className}`}>
        <Icon />
        &nbsp;
        <div style={{width: this.state.titleWidth}}>
          <TextField
            className="title-text"
            variant="outlined"
            margin="dense"
            value={displayedTitle}
            onChange={this.onTitleChange.bind(this)}
            onKeyPress={this.onTitleKeyPress.bind(this)}
            onBlur={this.onTitleBlur.bind(this)}
            disabled={this.state.renameState !== 'none'}
            fullWidth={true}
          />
        </div>
        <div
          className="MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputMarginDense MuiOutlinedInput-inputMarginDense"
          style={{
            width: 'auto',
            whiteSpace: 'pre',
            position: 'absolute',
            right: 0,
          }}
          ref={this.measurementDivRef}
        >
          <Typography variant="body1">{displayedTitle}</Typography>
        </div>
      </div>
    );
  }

  componentDidMount() {
    this.resizeTitle();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.getDisplayedTitle() !== this.getDisplayedTitle(prevState)) {
      this.resizeTitle();
    }
  }

  private onTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({pendingTitle: event.target.value});
  }

  private resizeTitle() {
    if (!this.measurementDivRef.current) {
      return;
    }
    let measurementDivWidth = this.measurementDivRef.current.offsetWidth;
    this.setState({titleWidth: measurementDivWidth + 1});
  }

  private onTitleKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') {
      return;
    }
    let inputEl: HTMLInputElement = event.target as any;
    inputEl.blur();
  }

  private onTitleBlur(event: React.FocusEvent<HTMLInputElement>) {
    let {pendingTitle} = this.state;
    let {title} = this.doc;
    if (pendingTitle === null) {
      return;
    }
    let newTitle = pendingTitle.trim();
    if (!newTitle || newTitle == title) {
      this.setState({pendingTitle: null});
      return;
    }

    this.doRename(newTitle);
  }

  private async doRename(newTitle: string) {
    let storageProvider = this.getStorageProvider();
    if (!storageProvider) {
      this.doc.title = newTitle;
      this.setState({pendingTitle: null});
      return;
    }
    this.setState({renameState: 'in-progress'});
    let newDocData = await storageProvider.rename(this.doc, newTitle);
    if (newDocData) {
      this.setState({renameState: 'success', pendingTitle: null});
      this.props.docManager.setDocData(newDocData);
    } else {
      this.setState({renameState: 'failed'});
    }
  }

  private get doc() {
    return this.props.docManager.doc;
  }

  private getDisplayedTitle(state?: State) {
    if (!state) {
      state = this.state;
    }
    return state.pendingTitle === null
      ? getTitleOrDefault(this.doc)
      : state.pendingTitle;
  }

  private getStorageProvider() {
    return this.doc.source
      ? storageManager.getStorageProvider(this.doc.source.storageType)
      : null;
  }

  private measurementDivRef = React.createRef<HTMLDivElement>();
}

export default TitleView;
