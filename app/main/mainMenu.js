import { Menu } from 'electron';
import * as ops from "./mainOps";
import storeManager from './store/mainManager';

// --------------------------------------------------------------------------------

export function createMenu() {

  const template = [];

  // section File
  template.push({
    label: 'File',
    submenu: [
      {
        label: 'Open directory',
        accelerator: 'CmdOrCtrl+O',
        click: () => { ops.openDirectory() }
      },
      {
        label: 'Open directory of current item',
        accelerator: 'Alt+O',
        click: () => { ops.openItemDirectory() }
      },
      {
        label: 'Open playlist',
        click: () => { ops.openPlayList() }
      },
      {
        label: 'Open new auto-select directory',
        click: () => { ops.openAutoSelectDirectory() }
      },
      {
        label: 'Auto-select (last used directory)',
        accelerator: 'F7',
        click: () => { ops.autoSelect() }
      },
      { type: 'separator' },
      {
        label: 'Exit',
        accelerator: 'ESC',
        click() { ops.hitEscKey(); }
      }
    ]
  });

  // section View
  template.push({
    label: 'Edit',
    submenu: [
      {
        label: 'Copy item path',
        accelerator: 'CmdOrCtrl+Shift+C',
        click: () => { ops.copyItemPath2Clipboard(); }
      },
      {
        label: 'Copy meta data',
        accelerator: 'CmdOrCtrl+Shift+C',
        click: () => { ops.copyMeta2Clipboard(); }
      },
    ]
  });

  // section View
  template.push({
    label: 'Item',
    submenu: [
      {
        label: 'Open item in map',
        accelerator: 'CmdOrCtrl+M',
        click: () => { ops.openMap(); }
      }
    ]
  });

  // section View
  const menuSectionView = {
    label: 'View',
    submenu: [

      // {
      //   role: 'Toogle details',
      //   accelerator: 'I',
      //   click: () => { ops.toogleFullscreen(); }
      // },
      // {
      //   role: 'Move details',
      //   accelerator: 'CmdOrCtrl+I',
      //   click: () => { ops.toogleFullscreen(); }
      // },


      {
        role: 'reload',
        accelerator: 'CmdOrCtrl+R'
      },
      {
        label: 'Toogle fullscreen',
        accelerator: 'F11',
        click: () => { ops.toogleFullscreen(); }
      }
    ]
  };

  if (storeManager.isDevtool) {
    menuSectionView.submenu.push({ type: 'separator' });

    menuSectionView.submenu.push({
      label: 'Toggle Developer Tools',
      accelerator: 'F12',
      click(item, focusedWindow) {
        if (focusedWindow) {
          ops.toogleDevTools();
        }
      }
    });
  }

  template.push(menuSectionView);

  // section Debug
  if (storeManager.isDevelopment) {
    template.push({
      label: 'Debug',
      submenu: [
        {
          label: 'Debug 1',
          accelerator: 'CmdOrCtrl+1',
          click() { ops.debug1(); }
        },
        {
          label: 'Debug 2',
          accelerator: 'CmdOrCtrl+2',
          click() { ops.debug2(); }
        },
        {
          label: 'Debug 3',
          accelerator: 'CmdOrCtrl+3',
          click() { ops.debug3(); }
        }
      ]
    });
  }

  // section Help
  template.push({
    label: 'Help',
    submenu: [
      {
        label: 'Toogle shortcut info',
        accelerator: 'F1',
        click() { ops.toogleHelp(); }
      },
      {
        label: 'Open website',
        click() { ops.openWebsite(); }
      },
      { type: 'separator' },
      {
        label: 'About ...',
        click() { ops.showAbout(); }
      }
    ]
  });

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// ----------------------------------------------------------------------------------
