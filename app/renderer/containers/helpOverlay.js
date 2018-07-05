import React from 'react';
import {connect} from "react-redux";
import log from 'electron-log';
import { Icon } from '@blueprintjs/core';

// ----------------------------------------------------------------------------------

const _logKey = "helpOverlay";

// ----------------------------------------------------------------------------------

class HelpOverlay extends React.Component {

  constructor(props) {
    super(props);

  }

  render() {
    return (

      <div className={"popover-help"}>
        <h4>Shortcut overview</h4>
        <table className="popover-table">
          <tbody>
            <tr><td>toogle fullscreen</td><td>F11</td></tr>


            <tr><td>show this shortcut overview</td><td>F1</td></tr>

            <tr><td>show previous item</td><td><Icon icon="caret-up" /> <Icon icon="caret-left" /> </td></tr>
            <tr><td>show next item</td><td><Icon icon="caret-down" /> <Icon icon="caret-right" /> </td></tr>

            <tr><td>jump backward</td><td>Page <Icon icon="caret-up" /> </td></tr>
            <tr><td>jump forward</td><td>Page <Icon icon="caret-down" /> </td></tr>

            <tr><td>toogle auto play</td><td>space</td></tr>

            <tr><td>toogle details</td><td>I</td></tr>
            <tr><td>move details</td><td>Ctrl + I</td></tr>
            <tr><td>xxxxxxx</td><td>xxxx</td></tr>
            <tr><td>xxxxxxx</td><td>xxxx</td></tr>
            <tr><td>xxxxxxx</td><td>xxxx</td></tr>

          </tbody>
        </table>
      </div>

    );
  }

}

// ----------------------------------------------------------------------------------

const mapStateToProps = state => ({
});


export default connect( mapStateToProps )(HelpOverlay);
