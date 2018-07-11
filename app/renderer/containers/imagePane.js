import React from 'react';
import ReactCSSTransitionReplace from 'react-css-transition-replace';
import {connect} from "react-redux";
import log from 'electron-log';
import ExifOrientationImg from 'react-exif-orientation-img'
import * as cssConstants from '../style/cssConstants';
import * as actions from "../../common/store/slideshowActions";
import storeManager from "../store/rendererManager";
import * as ops from "../rendererOps";

// ----------------------------------------------------------------------------------

const _logKey = "imapePane";

// ----------------------------------------------------------------------------------

class ImagePane extends React.Component {

  constructor(props) {
    super(props);

    this.data = {
      clickCount: 0,
      singleClickTimer: null
    };

    this.onClick = this.onClick.bind(this);
    this.onMouseWheel = this.onMouseWheel.bind(this);
    this.render = this.render.bind(this);
  }

  // .......................................................

  componentDidMount() {
    window.addEventListener("wheel", this.onMouseWheel);
  }

  // .......................................................

  componentWillUnmount() {
    window.removeEventListener("wheel", this.onMouseWheel);
  }

  // .......................................................

  goBack() {
    this.props.dispatch(actions.createActionGoBack());
  }

  goNext() {
    //log.debug(`${_logKey}.goNext`);
    this.props.dispatch(actions.createActionGoNext());
  }

  // .......................................................

  onClick() {

    const {data} = this;

    const instance = this;

    data.clickCount++;
    if (data.clickCount === 1) {
      data.singleClickTimer = setTimeout(() => {

        data.clickCount = 0;
        //log.debug(`${_logKey}.onClick == 1`);
        instance.goNext();

      }, 300);
    } else if (data.clickCount === 2) {
      clearTimeout(data.singleClickTimer);

      data.clickCount = 0;
      //log.debug(`${_logKey}.onClick == 2`);
      ops.toogleFullscreen();
    }
  }

  // .......................................................

  onMouseWheel(event) {
    if (event.deltaY > 0) {
      //log.debug(`${_logKey}.onMouseWheel: goNext`, event.deltaY);
      this.goNext();
    } else if (event.deltaY < 0) {
      //log.debug(`${_logKey}.onMouseWheel: goBack`, event.deltaY);
      this.goBack();
    }
  }

  // .......................................................

  render() {
    // https://github.com/marnusw/react-css-transition-replace

    const func = ".render";

    const {props} = this;
    const cssImagePane = cssConstants.CSS_IMAGEPANE;

    let imagePath = null;
    if (props.itemIndex >= 0 && props.itemIndex < props.items.length) {
      const item = props.items[props.itemIndex];
      imagePath = item.file;
    }
    const imageKey = (!imagePath ? "undefined" : imagePath);

    let transistionTime = props.combinedAutoPlay ? storeManager.slideshowTransitionTimeAutoPlay : storeManager.slideshowTransitionTimeManual;
    if (!transistionTime)
      transistionTime = 10;

    log.debug(`${_logKey}${func}(${props.itemIndex}, autoPlay=${props.combinedAutoPlay}, transistion=${transistionTime}):`, imagePath);

    return (
      <div className={cssImagePane}>
        <style dangerouslySetInnerHTML={{__html: `
          .trgen-leave {
            opacity: 1;
          }

          .trgen-leave.trgen-leave-active {
            opacity: 0;
            transition: opacity ${transistionTime}ms ease-in-out;
          }

          .trgen-enter {
            opacity: 0;
          }
          .trgen-enter.trgen-enter-active {
            opacity: 1;
            transition: opacity ${transistionTime}ms ease-in-out;
          }

          .trgen-height {
            transition: height ${transistionTime}ms ease-in-out;
          }
        `}} />

        <ReactCSSTransitionReplace
          className={cssImagePane}
          transitionName="trgen"
          transitionEnterTimeout={transistionTime}
          transitionLeaveTimeout={transistionTime}
        >
          <ExifOrientationImg
            className={cssImagePane}
            src={imagePath}
            key={imageKey}
            onClick={this.onClick}
            style={ props.cursorHide ? { cursor: 'none' } : null }
          />

        </ReactCSSTransitionReplace>
      </div>
    );
  }

  // .......................................................

}

const mapStateToProps = state => ({
  combinedAutoPlay: state.slideshow.autoPlay || state.context.isScreensaver,
  cursorHide: state.slideshow.cursorHide,
  items: state.slideshow.items,
  itemIndex: state.slideshow.itemIndex,
  isScreensaver: state.context.isScreensaver,
});

export default connect( mapStateToProps )(ImagePane);

