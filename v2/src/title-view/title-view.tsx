import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import delay from 'delay';
import FileIcon from 'mdi-material-ui/FileDocumentOutline';
import {computed, observable, reaction} from 'mobx';
import {observer} from 'mobx-react';
import * as React from 'react';
import {getTitleOrDefault} from '..//document/doc';
import DocManager from '../document/doc-manager';
import storageManager from '../storage/storage-manager';

const RENAME_STATE_RESULT_VISIBLE_MS = 2000;
const RENAME_STATE_OPACITY_TRANSITION_MS = 500;

interface Props {
  docManager: DocManager;
  className?: string;
}

type RenameState = 'none' | 'in-progress' | 'success' | 'failed';

interface State {
  titleWidth: number;
  renameState: RenameState;
  renameStateOpacity: number;
}

@observer
class TitleView extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      titleWidth: 0,
      renameState: 'none',
      renameStateOpacity: 0,
    };

    reaction(
      () => this.displayedTitle,
      () => requestAnimationFrame(() => this.resizeTitle())
    );
  }

  render() {
    let Icon = this.doc.source
      ? storageManager.getStorageProvider(this.doc.source.storageType)
          .storageTypeIcon
      : FileIcon;
    return (
      <div className={`title-container ${this.props.className}`}>
        <Icon />
        &nbsp;
        <div style={{width: this.state.titleWidth}}>
          <TextField
            className="title-text"
            variant="outlined"
            margin="dense"
            value={this.displayedTitle}
            onChange={this.onTitleChange.bind(this)}
            onKeyPress={this.onTitleKeyPress.bind(this)}
            onBlur={this.onTitleBlur.bind(this)}
            disabled={this.state.renameState === 'in-progress'}
            fullWidth={true}
          />
        </div>
        <div
          className="rename-status"
          style={{opacity: this.state.renameStateOpacity}}
        >
          <Typography variant="overline">{this.renameStateLabel}</Typography>
        </div>
        <div
          className="MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputMarginDense MuiOutlinedInput-inputMarginDense"
          style={{
            width: 'auto',
            whiteSpace: 'pre',
            position: 'absolute',
            right: '100%',
          }}
          ref={this.measurementDivRef}
        >
          <Typography variant="body1">{this.displayedTitle}</Typography>
        </div>
      </div>
    );
  }

  componentDidMount() {
    this.resizeTitle();
  }

  private onTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.pendingTitle = event.target.value;
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
    let {title} = this.doc;
    if (this.pendingTitle === null) {
      return;
    }
    let newTitle = this.pendingTitle.trim();
    if (!newTitle || newTitle == title) {
      this.pendingTitle = null;
      return;
    }

    this.doRename(newTitle);
  }

  private async doRename(newTitle: string) {
    if (!this.storageProvider) {
      this.doc.title = newTitle;
      this.pendingTitle = null;
      return;
    }
    this.setState({renameState: 'in-progress', renameStateOpacity: 1});
    let newDocData = await this.storageProvider.rename(this.doc, newTitle);
    this.pendingTitle = null;
    if (newDocData) {
      this.setState({renameState: 'success'});
      this.props.docManager.setDocData(newDocData);
    } else {
      this.setState({renameState: 'failed'});
    }
    await delay(RENAME_STATE_RESULT_VISIBLE_MS);
    this.setState({renameStateOpacity: 0});
    await delay(RENAME_STATE_OPACITY_TRANSITION_MS);
    this.setState({renameState: 'none'});
  }

  private get doc() {
    return this.props.docManager.doc;
  }

  @computed
  private get displayedTitle() {
    return this.pendingTitle === null
      ? getTitleOrDefault(this.doc)
      : this.pendingTitle;
  }

  private get storageProvider() {
    return this.doc.source
      ? storageManager.getStorageProvider(this.doc.source.storageType)
      : null;
  }

  private get renameStateLabel() {
    const LABELS: {[key in RenameState]: string} = {
      none: 'none',
      'in-progress': 'renaming...',
      success: 'renamed',
      failed: 'rename error',
    };
    return LABELS[this.state.renameState] || '';
  }

  private measurementDivRef = React.createRef<HTMLDivElement>();

  @observable
  private pendingTitle: string | null = null;
}

export default TitleView;
