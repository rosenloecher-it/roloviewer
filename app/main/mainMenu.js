import { app, Menu } from 'electron';
import * as operations from "./mainOperations";
import configMain from "./config/mainConfig";

// --------------------------------------------------------------------------------

export function createMenu() {
  const menuSectionFile = {
    label: 'File',
    submenu: [
      {
        label: 'Open directory',
        accelerator: 'CmdOrCtrl+O',
        click: () => { operations.openDirectory() }
      },
      {
        label: 'Open playlist ',
        accelerator: 'Shift+CmdOrCtrl+O',
        click: () => { operations.openPlayList() }
      },
      {
        label: 'Auto-select',
        accelerator: 'CmdOrCtrl+A',
        click: () => { operations.autoSelect() }
      },
      { type: 'separator' },
      {
        label: 'Exit',
        accelerator: 'ESC',
        click() { operations.quitApp(); }
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
        click: () => { operations.toogleFullscreen(); }
      }
    ]
  };

  if (configMain.showDevTools()) {
    menuSectionView.submenu.push({ type: 'separator' });

    menuSectionView.submenu.push({
      label: 'Toggle Developer Tools',
      accelerator: 'F12',
      click(item, focusedWindow) {
        if (focusedWindow) {
          operations.toogleDevTools();
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
        click() { operations.showHelp(); }
      },
      {
        label: 'Learn More',
        click() { operations.learnMore(); }
      },
      { type: 'separator' },
      {
        label: 'About ...',
        click() { operations.showAbout(); }
      }
    ]
  };

  const template = [menuSectionFile, menuSectionView, menuSectionHelp];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// ----------------------------------------------------------------------------------
