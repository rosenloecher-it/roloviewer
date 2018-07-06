import React from 'react';
import {connect} from "react-redux";
import { Icon } from '@blueprintjs/core';

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

            <tr><td>open - directory</td><td>CTRL + O</td></tr>
            <tr><td>open - playlist</td><td>SHIFT + CTRL + O</td></tr>
            <tr><td>open - auto select</td><td>CTRL + A</td></tr>

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
