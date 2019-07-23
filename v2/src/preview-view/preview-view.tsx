import * as React from 'react';

interface Props {
  compiledBody: string;
}

class PreviewView extends React.Component<Props> {
  render() {
    return (
      <div className="preview-container">
        <div
          className="preview-content"
          dangerouslySetInnerHTML={{__html: this.props.compiledBody}}
        />
      </div>
    );
  }
}

export default PreviewView;
