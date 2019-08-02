import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';
import * as React from 'react';

type MenuItemSpec =
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
  constructor(props: Props) {
    super(props);
    this.state = {isMenuOpen: false};
  }

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
          anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
          transformOrigin={{vertical: 'top', horizontal: 'right'}}
        >
          {this.props.menuItems &&
            this.props.menuItems.map((item) => {
              if (item === 'divider') {
                return <Divider />;
              }
              if (item.subheader) {
                return <ListSubheader>{item.subheader}</ListSubheader>;
              }
              if (item.item) {
                return (
                  <MenuItem
                    onClick={this.onMenuItemClick.bind(this, item.onClick)}
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

  private onMenuItemClick(onClick?: () => void) {
    this.closeMenu();
    onClick && onClick();
  }

  private iconButtonRef = React.createRef<HTMLButtonElement>();
}

export default MenuIconView;