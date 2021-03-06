import React from 'react';
import { Button, Icon } from '@blueprintjs/core';
import * as slideshowActions from "../../common/store/slideshowActions";
import storeManager from "../store/rendererManager";

// ----------------------------------------------------------------------------------

class HelpOverlay extends React.Component {

  constructor(props) {
    super(props);

    this.onClose = this.onClose.bind(this);
  }

  onClose() {
    const action = slideshowActions.createActionHelpClose();
    storeManager.dispatchGlobal(action);
  }

  render() {
    return (

      <div className="popover-dialog">
        <h3>Shortcut overview</h3>
        <table className="popover-table">
          <tbody>

            <tr><td>crawler info - toogle</td><td>W</td></tr>
            <tr><td>crawler info - move</td><td>CTRL + W</td></tr>

            <tr><td>details - toogle</td><td>I</td></tr>
            <tr><td>details - move</td><td>CTRL + I</td></tr>

            <tr><td>fullscreen - toogle</td><td>F11</td></tr>

            <tr><td>goto - auto play</td><td>SPACE</td></tr>
            <tr><td>goto - end</td><td>END</td></tr>
            <tr><td>goto - jump back</td><td>Page <Icon icon="caret-up" /> </td></tr>
            <tr><td>goto - jump forward</td><td>Page <Icon icon="caret-down" /> </td></tr>
            <tr><td>goto - next item</td><td><Icon icon="caret-down" /> <Icon icon="caret-right" /> </td></tr>
            <tr><td>goto - previous item</td><td><Icon icon="caret-up" /> <Icon icon="caret-left" /> </td></tr>
            <tr><td>goto - start</td><td>POS1</td></tr>

            <tr><td>help - show this overlay</td><td>F1</td></tr>

            <tr><td>open - auto select (last used directory)</td><td>F7</td></tr>
            <tr><td>open - current image directory</td><td>ALT + O</td></tr>
            <tr><td>open - directory</td><td>CTRL + O</td></tr>
            <tr><td>open - position in map (browser)</td><td>CTRL + M</td></tr>

            <tr><td>random - toogle</td><td>R</td></tr>

          </tbody>
        </table>
        <p />
        <Button role="button" tabIndex={0} className="popover-button" onClick={this.onClose}>Close</Button>
      </div>
    );
  }

}

// ----------------------------------------------------------------------------------

export default HelpOverlay;
