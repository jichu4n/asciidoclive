import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListSubheader from '@material-ui/core/ListSubheader';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';
import * as React from 'react';

export type MenuItemSpec =
  | {
      item?: string;
      subheader?: string;
      onClick?: () => void;
      icon?: React.ReactElement;
    }
  | 'divider';

interface Props {
  tooltipLabel: string;
  icon: React.ReactElement;
  menuItems?: Array<MenuItemSpec>;
}

interface State {
  isMenuOpen: boolean;
}

class MenuIconView extends React.Component<Props, State> {
  state: State = {isMenuOpen: false};

  render() {
    return (
      <>
        <Tooltip title={this.props.tooltipLabel}>
          <IconButton
            color="inherit"
            ref={this.iconButtonRef}
            onClick={this.openMenu.bind(this)}
          >
            {this.props.icon}
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={this.iconButtonRef.current}
          open={this.state.isMenuOpen}
          onClose={this.closeMenu.bind(this)}
          transformOrigin={{vertical: 'top', horizontal: 'right'}}
        >
          {this.props.menuItems &&
            this.props.menuItems.map((item, idx) => {
              if (item === 'divider') {
                return <Divider key={idx} />;
              }
              if (item.subheader) {
                return (
                  <ListSubheader key={idx}>{item.subheader}</ListSubheader>
                );
              }
              if (item.item) {
                return (
                  <MenuItem
                    onClick={this.onMenuItemClick.bind(this, item.onClick)}
                    key={idx}
                  >
                    {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
                    {item.item}
                  </MenuItem>
                );
              }
              return null;
            })}
        </Menu>
      </>
    );
  }

  private openMenu() {
    this.setState({isMenuOpen: true});
  }

  private closeMenu() {
    this.setState({isMenuOpen: false});
  }

  private onMenuItemClick(onClick: () => void | void) {
    this.closeMenu();
    onClick && onClick();
  }

  private iconButtonRef = React.createRef<HTMLButtonElement>();
}

export default MenuIconView;
