import BookIcon from '@material-ui/icons/Book';
import CommentIcon from '@material-ui/icons/Comment';
import HelpIcon from '@material-ui/icons/Help';
import InfoIcon from '@material-ui/icons/Info';
import * as React from 'react';
import MenuIconView from './menu-icon-view';

class HelpMenuView extends React.Component {
  render() {
    return (
      <MenuIconView
        tooltipLabel="Help"
        icon={<HelpIcon />}
        menuItems={[
          {
            item: 'AsciiDoc cheatsheet',
            icon: <BookIcon />,
            onClick: () =>
              window.open(
                'https://asciidoctor.org/docs/asciidoc-syntax-quick-reference'
              ),
          },
          'divider',
          {subheader: 'asciidoclive.com'},
          {
            item: 'FAQ',
            icon: <HelpIcon />,
            onClick: () => {},
          },
          {
            item: 'About',
            icon: <InfoIcon />,
            onClick: () => {},
          },
          {
            item: 'Send feedback',
            icon: <CommentIcon />,
            onClick: () =>
              window.open('https://github.com/jichu4n/asciidoclive/issues/new'),
          },
        ]}
      />
    );
  }
}

export default HelpMenuView;
