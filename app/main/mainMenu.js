import { Menu } from 'electron';
import * as ops from "./mainOps";
import config from "./config/mainConfig";

// --------------------------------------------------------------------------------

export function createMenu() {
  const menuSectionFile = {
    label: 'File',
    submenu: [
      {
        label: 'Open directory',
        accelerator: 'CmdOrCtrl+O',
        click: () => { ops.openDirectory() }
      },
      {
        label: 'Open playlist ',
        accelerator: 'Shift+CmdOrCtrl+O',
        click: () => { ops.openPlayList() }
      },
      {
        label: 'Auto-select',
        accelerator: 'CmdOrCtrl+A',
        click: () => { ops.autoSelect() }
      },
      { type: 'separator' },
      {
        label: 'Exit',
        accelerator: 'ESC',
        click() { ops.quitApp(); }
      }
    ]
  };

  const menuSectionView = {
    label: 'View',
    submenu: [
      {
        role: 'reload',
        accelerator: 'CmdOrCtrl+R'
      },
      {
        label: 'Toogkle fullscreen',
        accelerator: 'F11',
        click: () => { ops.toogleFullscreen(); }
      }
    ]
  };

  if (config.showDevTools()) {
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

  const menuSectionHelp = {
    label: 'Help',
    submenu: [
      {
        label: 'Show help',
        accelerator: 'F1',
        click() { ops.showHelp(); }
      },
      {
        label: 'Learn More',
        click() { ops.learnMore(); }
      },
      { type: 'separator' },
      {
        label: 'About ...',
        click() { ops.showAbout(); }
      }
    ]
  };

  const template = [menuSectionFile, menuSectionView, menuSectionHelp];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// ----------------------------------------------------------------------------------
