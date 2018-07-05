import React from 'react';
import {connect} from "react-redux";
import log from 'electron-log';
import * as actions from "../store/actionsSlideshow";
import { Button, Dialog, Intent } from '@blueprintjs/core';

// ----------------------------------------------------------------------------------

const _logKey = "helpDialog";

// ----------------------------------------------------------------------------------

class HelpDialog extends React.Component {

  constructor(props) {
    super(props);

    this.onClose = this.onClose.bind(this);
    this.render = this.render.bind(this);
  }

  onClose() {
    this.props.dispatch(actions.helpClose());
  }

  render() {
    return (

      <div>
        <Dialog
          icon="inbox"
          isOpen={this.props.isOpen}
          onClose={this.onClose}
          title="Help"
          className="pt-dialog pt-dark"
        >
          <div className="pt-dialog-body">Some content</div>
          <div className="pt-dialog-footer">
            <div className="pt-dialog-footer-actions">
              <Button
                onClick={this.onClose}
                text="Close"
              />
            </div>
          </div>
        </Dialog>
      </div>

    );
  }

}

// ----------------------------------------------------------------------------------

const mapStateToProps = state => ({
  isOpen: state.slideshow.helpShow,
});

export default connect( mapStateToProps )(HelpDialog);

/*


 */
