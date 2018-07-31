import React from 'react';
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
      return (

        <div className="popover-dialog">
          <h3>about
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
                    onClick={AboutOverlay.onClick}
                  >
                    {constants.APP_URL}
                  </a>
                </td>
              </tr>
              <tr><td>{constants.APP_TITLE} version</td><td>{constants.APP_VERSION}</td></tr>
              <tr><td>electron version</td><td>{this.props.versionElectron}</td></tr>

            </tbody>
          </table>

          <p />
          <Button role="button" tabIndex={0} className="popover-button" onClick={AboutOverlay.onClose}>Close</Button>
        </div>
      );

    } catch (err) {
      log.error(`${_logKey}${func} - `, err);
      return null;
    }

  }

}

// ----------------------------------------------------------------------------------

AboutOverlay.propTypes = {
  versionElectron: PropTypes.string
};

AboutOverlay.defaultProps = {
  versionElectron: '?.?.?',
};

const mapStateToProps = state => ({
  versionElectron: state.context.versionElectron,
});


export default connect( mapStateToProps )(AboutOverlay);
