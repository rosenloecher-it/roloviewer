import React from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import { Button, Dialog, Icon} from '@blueprintjs/core';
import * as actionsMsg from "../../common/store/messageActions";
import * as constants from "../../common/constants";

// ----------------------------------------------------------------------------------

const _logKey = "messageDialog"; // eslint-disable-line no-unused-vars

// ----------------------------------------------------------------------------------

class MessageDialog extends React.Component {

  constructor(props) {
    super(props);

    this.onCloseAll = this.onCloseAll.bind(this);
    this.onNext = this.onNext.bind(this);
    this.render = this.render.bind(this);
  }

  // .......................................................

  onCloseAll() {
    this.props.dispatch(actionsMsg.createActionRemoveAll());
  }

  // .......................................................

  onNext() {
    this.props.dispatch(actionsMsg.createActionRemoveFirst());
  }

  // .......................................................

  render() {

    const {props} = this;

    const cssTableClass = "popover-table";

    let message = null;
    if (props.messages.length > 0)
      message = props.messages[0];
    else
      message = {};

    const text = message.msgText;

    const showMore = (props.messages.length > 1);

    let title, icon;
    switch (message.msgType) {
      case constants.MSG_TYPE_ERROR:
        title = "Error";
        icon = <Icon icon="error" color="red" />;
        break;
      case constants.MSG_TYPE_WARNING:
        title = "Warning";
        icon = <Icon icon="error" color="yellow" />;
        break;
      default: // MSG_TYPE_INFO
        title = "Info";
        icon = <Icon icon="info-sign" />;
        break;
    }

    //{msgType, msgText} : action

    //className="pt-dialog-footer-info"

    return (
      <div>
        <Dialog
          icon={icon}
          isOpen={this.props.showMessages}
          onClose={this.onClose}
          title={title}
          className="pt-dialog pt-dark"
        >
          <div className="pt-dialog-body">{text}</div>
          <div className="pt-dialog-footer">
            <div className="pt-dialog-footer-actions">

              <table className={cssTableClass}>
                <tbody>
                  <tr>
                    <td>{showMore && `(${props.messages.length - 1} more messages)`}</td>
                    <td>
                      {showMore && <Button onClick={this.onCloseAll} text="Close all" />}
                      <Button onClick={this.onNext} text={showMore ? "Next" : "Close"} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Dialog>
      </div>

    );
  }
}

// ----------------------------------------------------------------------------------

MessageDialog.propTypes = {
  dispatch: PropTypes.func.isRequired,
  showMessages: PropTypes.arrayOf(PropTypes.shape({
    msgType: PropTypes.number.isRequired,
    msgText: PropTypes.string.isRequired,
  }))
};

MessageDialog.defaultProps = {
  showMessages: [],
};

const mapStateToProps = state => ({
  messages: state.messages.messages,
  showMessages: state.messages.showMessages,
});

export default connect( mapStateToProps )(MessageDialog);

/*


 */
