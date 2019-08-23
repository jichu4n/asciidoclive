import Typography from '@material-ui/core/Typography';
import {observer} from 'mobx-react';
import * as React from 'react';
import {getTitleOrDefault} from '..//document/doc';
import DocManager from '../document/doc-manager';
import storageManager from '../storage/storage-manager';
import FileIcon from 'mdi-material-ui/FileDocumentOutline';

interface Props {
  docManager: DocManager;
  className?: string;
}

@observer
class TitleView extends React.Component<Props, {}> {
  render() {
    let {doc} = this.props.docManager;
    let Icon = doc.source
      ? storageManager.getStorageProvider(doc.source.storageType)
          .storageTypeIcon
      : FileIcon;
    return (
      <div className={`title-container ${this.props.className}`}>
        <Icon />
        &nbsp; &nbsp;
        <Typography variant="h6">
          {getTitleOrDefault(this.props.docManager.doc)}
        </Typography>
      </div>
    );
  }
}

export default TitleView;
