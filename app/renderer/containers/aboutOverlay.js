import React from 'react';
import path from 'path';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import log from 'electron-log';
import { Button } from '@blueprintjs/core';
import * as constants from "../../common/constants";
import * as rendererActions from "../../common/store/rendererActions";
import storeManager from "../store/rendererManager";
import * as ops from "../rendererOps";

// ----------------------------------------------------------------------------------

const _logKey = "aboutOverlay";

// ----------------------------------------------------------------------------------

class AboutOverlay extends React.Component {

  onClick() {
    ops.openUrl(constants.APP_URL);
  }

  onClose() {
    const action = rendererActions.createActionAboutClose();
    storeManager.dispatchGlobal(action);
  }

  onUrlKeyDown(event) {
    if(event.keyCode === 13)
      this.onClick()
  }

  render() {
    const func = '.render';

    try {

      const databasePath = `${this.props.databasePath}${path.sep}*${constants.EXT_DATABASE}`;

      /* eslint-disable react/self-closing-comp */
      // trying to write a whitespace between multiline jsx! <span> </span>
      return (
        <div className="popover-dialog">
          <h3>about <span> </span>
            <a
              role="link"
              tabIndex={0}
              className="popover-link"
              onClick={this.onClick}
              onKeyDown={this.onUrlKeyDown}
            >
              {constants.APP_TITLE}
            </a>
          </h3>

          <p>
            written by {constants.APP_CREATOR}
          </p>

          <table className="popover-table">
            <tbody>

              <tr>
                <td>{constants.APP_TITLE} website</td>
                <td>
                  <a
                    role="link"
                    tabIndex={0}
                    className="popover-link"
                    onKeyDown={this.onUrlKeyDown}
                    onClick={this.onClick}
                  >
                    {constants.APP_URL}
                  </a>
                </td>
              </tr>
              <tr><td>{constants.APP_TITLE} version</td><td>{constants.APP_VERSION}</td></tr>
              <tr><td>electron version</td><td>{this.props.versionElectron}</td></tr>

              <tr><td>Config file</td><td>{this.props.configFile}</td></tr>
              <tr><td>Database files</td><td>{databasePath}</td></tr>
              <tr><td>Log file</td><td>{this.props.logfile}</td></tr>
              <tr><td>Log level</td><td>{this.props.logLevelFile}</td></tr>


            </tbody>
          </table>

          <p />
          <Button role="button" tabIndex={0} className="popover-button" onClick={this.onClose}>Close</Button>
        </div>
      );
      /* eslint-enable react/self-closing-comp */

    } catch (err) {
      log.error(`${_logKey}${func} - `, err);
      return null;
    }

  }

}

// ----------------------------------------------------------------------------------

/*
      logLevelFile:
      logLevelConsole: system.logLevelConsole,
      logfile:

 */

AboutOverlay.propTypes = {
  configFile: PropTypes.string,
  databasePath: PropTypes.string,
  logfile: PropTypes.string,
  logLevelFile: PropTypes.string,
  versionElectron: PropTypes.string,
};

AboutOverlay.defaultProps = {
  configFile: '?',
  databasePath: '?',
  logfile: '?',
  logLevelFile: '?',
  versionElectron: '?.?.?',
};

const mapStateToProps = state => ({
  configFile: state.context.configFile,
  databasePath: state.crawler.databasePath,
  logfile: state.system.logfile,
  logLevelFile: state.system.logLevelFile,
  versionElectron: state.context.versionElectron,
});


export default connect( mapStateToProps )(AboutOverlay);
