import React from 'react';
import ReactCSSTransitionReplace from 'react-css-transition-replace';
import {connect} from "react-redux";
import log from 'electron-log';
import * as cssConstants from '../style/cssConstants';
import * as actions from "../store/actionsSlideshow";
import * as ops from "../rendererOps";
import * as constants from "../../common/constants";
import config from '../rendererConfig';

// ----------------------------------------------------------------------------------

const _logKey = "imapePane";

// ----------------------------------------------------------------------------------

class ImagePane extends React.Component {

  constructor(props) {
    super(props);

    this.data = {
      timerId: null
    };

    this.onClick = this.onClick.bind(this);
    this.onMouseWheel = this.onMouseWheel.bind(this);
    this.render = this.render.bind(this);

  }

  // .......................................................

  componentDidMount() {

    window.addEventListener("wheel", this.onMouseWheel);
    window.addEventListener('scroll', this.onScroll);
  }

  // .......................................................

  componentWillUnmount() {

    if (this.data.timerId)
      clearInterval(this.data.timerId);

    window.removeEventListener("wheel", this.onMouseWheel);
    window.removeEventListener('scroll', this.onScroll);
  }

  // .......................................................

  goBack() {
    this.props.dispatch(actions.goBack());
  }

  goNext() {
    //log.debug(`${_logKey}.goNext`);
    this.props.dispatch(actions.goNext());
  }

  // .......................................................

  onClick() {
    //log.debug(`${_logKey}.onClick`);
    this.goNext();
  }

  // .......................................................

  onMouseWheel(event) {
    if (event.deltaY > 0) {
      //log.debug(`${logKey}.onMouseWheel: goNext`, event.deltaY);
      this.goNext();
    } else if (event.deltaY < 0) {
      //log.debug(`${logKey}.onMouseWheel: goBack`, event.deltaY);
      this.goBack();
    }
  }

  // .......................................................

  render() {
    const func = ".render";
    //log.debug(`${logKey}.render size:`, window.innerWidth, window.innerHeight);

    const {props} = this;

    let imagePath = null;
    if (props.showIndex >= 0 && props.showIndex < props.items.length) {
      const item = props.items[props.showIndex];
      imagePath = item.file;
    }
    const imageKey = (!imagePath ? "undefined" : imagePath);
    //log.debug(`${_logKey}${func}(${props.showIndex}):`, imagePath);
    log.debug(`${_logKey}${func}(${props.showIndex}, autoPlay=${props.autoPlay}):`, imagePath);

    // https://github.com/marnusw/react-css-transition-replace

    return (
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
          onClick={this.onClick}
        />

      </ReactCSSTransitionReplace>
    );
  }

  // .......................................................

}

const mapStateToProps = state => ({
  showIndex: state.slideshow.showIndex,
  items: state.slideshow.items,
  autoPlay: state.slideshow.autoPlay,
});

export default connect( mapStateToProps )(ImagePane);

