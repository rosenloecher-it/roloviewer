import React, { Component } from 'react';
import ReactCSSTransitionReplace from 'react-css-transition-replace';
import {connect} from "react-redux";
import log from 'electron-log';
import * as cssConstants from '../style/cssConstants';
import * as actions from "../store/actionsImagePane";

// ----------------------------------------------------------------------------------

const logKey = "imapePane";

// ----------------------------------------------------------------------------------

class ImagePane extends Component {

  constructor(props) {
    super(props);

    this.onNextObject = this.onNextObject.bind(this);
    this.onMouseWheel = this.onMouseWheel.bind(this);
  }

  componentDidMount() {
    window.addEventListener('scroll', this.onScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll);
  }

  onNextObject() {
    this.props.dispatch(actions.goNext());
  }

  onMouseWheel(event) {
    if (event.deltaY > 0) {
      //log.debug(`${logKey}.onMouseWheel: goNext`, event.deltaY);
      this.props.dispatch(actions.goNext());
    } else if (event.deltaY < 0) {
      //log.debug(`${logKey}.onMouseWheel: goBack`, event.deltaY);
      this.props.dispatch(actions.goBack());
    }
  }

  render() {

    //log.debug(`${logKey}.render size:`, window.innerWidth, window.innerHeight);

    const length = this.props.items.length;

    let imagePath = null;
    if (this.props.showIndex >= 0 && this.props.showIndex < length) {
      const item = this.props.items[this.props.showIndex];
      imagePath = item.file;
    }
    const imageKey = (!imagePath ? "undefined" : imagePath);
    log.debug(`${logKey}.render:`, imagePath);


    return (
      // https://github.com/marnusw/react-css-transition-replace
      <ReactCSSTransitionReplace
        className={cssConstants.CSS_IMAGEPANE}
        transitionName="cross-fade"
        transitionEnterTimeout={2000}
        transitionLeaveTimeout={2000}
      >
        <img
          className={cssConstants.CSS_IMAGEPANE}
          src={imagePath}
          key={imageKey}
          onClick={() => { this.onNextObject(); }}
          onWheel={this.onMouseWheel}
          onScroll={this.onScroll}
        />

      </ReactCSSTransitionReplace>
    );
  }
}


const mapStateToProps = state => ({
  showIndex: state.imagePane.showIndex,
  items: state.imagePane.items,
  container: state.imagePane.container

});

export default connect( mapStateToProps )(ImagePane);
