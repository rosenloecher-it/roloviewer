import log from 'electron-log';
import path from 'path';
import PropTypes from 'prop-types';
import React from 'react';
import { Button } from '@blueprintjs/core';
import { connect } from "react-redux";
import * as constants from "../../common/constants";
import * as ops from "../rendererOps";
import * as slideshowActions from "../../common/store/slideshowActions";
import storeManager from "../store/rendererManager";

// ----------------------------------------------------------------------------------

const _logKey = "aboutOverlay";

// ----------------------------------------------------------------------------------

class AboutOverlay extends React.Component {

  constructor(props) {
    super(props);

    this.onClose = this.onClose.bind(this);
    this.onClickOpenHomeUrl = this.onClickOpenHomeUrl.bind(this);
    this.onKeyDownOpenHomeUrl = this.onKeyDownOpenHomeUrl.bind(this);
    this.onClickOpenConfigFile = this.onClickOpenConfigFile.bind(this);
    this.onKeyDownOpenConfigFile = this.onKeyDownOpenConfigFile.bind(this);
  }

  onClose() {
    const action = slideshowActions.createActionAboutClose();
    storeManager.dispatchGlobal(action);
  }

  onClickOpenHomeUrl() {
    ops.openUrl(constants.APP_URL);
  }

  onKeyDownOpenHomeUrl(event) {
    if(event.keyCode === 13)
      this.onClickOpenHomeUrl()
  }

  onClickOpenConfigFile() {
    ops.openFile(this.props.configFile);
  }

  onKeyDownOpenConfigFile(event) {
    if(event.keyCode === 13)
      this.onClickOpenConfigFile()
  }

  onClickOpenLogFile() {
    ops.openFile(this.props.logfile);
  }

  onKeyDownOpenLogFile(event) {
    if(event.keyCode === 13)
      this.onClickOpenLogFile()
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
              onClick={this.onClickOpenHomeUrl}
              onKeyDown={this.onKeyDownOpenHomeUrl}
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
                    onKeyDown={this.onKeyDownOpenHomeUrl}
                    onClick={this.onClickOpenHomeUrl}
                  >
                    {constants.APP_URL}
                  </a>
                </td>
              </tr>
              <tr><td>{constants.APP_TITLE} version</td><td>{constants.APP_VERSION}</td></tr>
              <tr><td>electron version</td><td>{this.props.versionElectron}</td></tr>

              <tr>
                <td>Config file</td>
                <td>
                  <a
                    role="link"
                    tabIndex={0}
                    className="popover-link"
                    onKeyDown={this.onKeyDownOpenConfigFile}
                    onClick={this.onClickOpenConfigFile}
                  >
                    {this.props.configFile}
                  </a>
                </td>
              </tr>

              <tr>
                <td>Log file</td>
                <td>
                  <a
                    role="link"
                    tabIndex={0}
                    className="popover-link"
                    onKeyDown={this.onKeyDownOpenLogFile}
                    onClick={this.onClickOpenLogFile}
                  >
                    {this.props.logfile}
                  </a>
                </td>
              </tr>

              <tr><td>Database files</td><td>{databasePath}</td></tr>
              <tr><td>Log level</td><td>{this.props.logLevel}</td></tr>


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

AboutOverlay.propTypes = {
  configFile: PropTypes.string,
  databasePath: PropTypes.string,
  logfile: PropTypes.string,
  logLevel: PropTypes.string,
  versionElectron: PropTypes.string,
};

AboutOverlay.defaultProps = {
  configFile: '?',
  databasePath: '?',
  logfile: '?',
  logLevel: '?',
  versionElectron: '?.?.?',
};

const mapStateToProps = state => ({
  configFile: state.context.configFile,
  databasePath: state.crawler.databasePath,
  logfile: state.system.logfile,
  logLevel: state.system.logLevel,
  versionElectron: state.context.versionElectron,
});


export default connect( mapStateToProps )(AboutOverlay);
