import React from 'react';
import {connect} from "react-redux";
import log from 'electron-log';
import { Button, Icon } from '@blueprintjs/core';
import * as constants from "../../common/constants";
import * as rendererActions from "../../common/store/rendererActions";
import storeManager from "../store/rendererManager";
import * as ops from "../rendererOps";

// ----------------------------------------------------------------------------------

const _logKey = "aboutOverlay";

// ----------------------------------------------------------------------------------

class AboutOverlay extends React.Component {

  static onClick() {
    ops.openUrl(constants.APP_URL);
  }

  static onClose() {
    const action = rendererActions.createActionAboutClose();
    storeManager.dispatchGlobal(action);
  }

  render() {
    const func = '.render';

    try {
      return (

        <div className={"popover-dialog"}>
          <h3>about <a className="popover-link" onClick={this.onClick}>{constants.APP_TITLE}</a></h3>

          <p>
            written by {constants.APP_CREATOR}
          </p>

          <table className="popover-table">
            <tbody>

            <tr><td>{constants.APP_TITLE} website</td><td><a  className="popover-link" onClick={AboutOverlay.onClick}>{constants.APP_URL}</a></td></tr>
            <tr><td>{constants.APP_TITLE} version</td><td>{constants.APP_VERSION}</td></tr>

            <tr><td>electron version</td><td>{this.props.versionElectron}</td></tr>

            </tbody>
          </table>

          <p />
          <Button className="popover-button" onClick={AboutOverlay.onClose}>Close</Button>
        </div>
      );

    } catch (err) {
      log.error(`${_logKey}${func} - `, err);
      return null;
    }

  }

}

// ----------------------------------------------------------------------------------

const mapStateToProps = state => ({
  versionElectron: state.context.versionElectron,
});


export default connect( mapStateToProps )(AboutOverlay);
