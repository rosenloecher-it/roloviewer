import React from 'react';
import ReactCSSTransitionReplace from 'react-css-transition-replace';
import {connect} from "react-redux";
import log from 'electron-log'; // eslint-disable-line no-unused-vars
import ExifOrientationImg from 'react-exif-orientation-img'
import * as cssConstants from '../style/cssConstants';
import * as ops from "../rendererOps";

// ----------------------------------------------------------------------------------

// https://github.com/marnusw/react-css-transition-replace

const _logKey = "imapePane"; // eslint-disable-line no-unused-vars

// ----------------------------------------------------------------------------------

class ImagePane extends React.Component {

  constructor(props) {
    super(props);

    this.data = {
      clickCount: 0,
      singleClickTimer: null,
      lastLastIndex: null,
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
    ops.goBack();
  }

  // .......................................................

  goNext() {
    ops.goNext();
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

  getTransitionTime() {

    const {props} = this;
    let transistionTime = props.combinedAutoPlay ? props.transitionTimeAutoPlay : props.transitionTimeManual;
    if (!transistionTime)
      transistionTime = 10;
    return transistionTime;
  }

  // .......................................................

  render() {
    const func = ".render"; // eslint-disable-line no-unused-vars

    const {props} = this;
    const cssImagePane = cssConstants.CSS_IMAGEPANE;

    let imagePath = null;
    if (props.itemIndex >= 0 && props.itemIndex < props.items.length) {
      const item = props.items[props.itemIndex];
      imagePath = item.file;
    }
    const imageKey = (!imagePath ? "undefined" : imagePath);

    const transistionTime = this.getTransitionTime();

    //log.silly(`${_logKey}${func}(${props.itemIndex}, autoPlay=${props.combinedAutoPlay}, transistion=${transistionTime}):`, imagePath);

    let cssOpacityLeave = 1;
    let ccsOpacityEnter = 1;
    let cssEase = 'ease-in-out';

    if (props.itemIndex < 0) {
      ccsOpacityEnter = 0;
      cssEase = 'ease-out';
    }
    if (this.data.lastLastIndex < 0) {
      cssOpacityLeave = 0;
      cssEase = 'ease-out';
    }

    this.data.lastLastIndex = props.itemIndex;

    /* eslint-disable react/no-danger */
    return (
      <div className={cssImagePane}>
        <style dangerouslySetInnerHTML={{__html: `
          .trgen-leave {
            opacity: ${cssOpacityLeave};
          }

          .trgen-leave.trgen-leave-active {
            opacity: 0;
            transition: opacity ${transistionTime}ms ${cssEase};
          }

          .trgen-enter {
            opacity: 0;
          }
          .trgen-enter.trgen-enter-active {
            opacity: ${ccsOpacityEnter};
            transition: opacity ${transistionTime}ms ${cssEase};
          }

          .trgen-height {
            transition: height ${transistionTime}ms ${cssEase};
          }
        `}}
        />

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
            style={props.cursorHide ? { cursor: 'none' } : null}
          />

        </ReactCSSTransitionReplace>
      </div>
    );
    /* eslint-enable react/no-danger */
  }

  // .......................................................

}

const mapStateToProps = state => ({
  combinedAutoPlay: state.renderer.triggeredByAutoplay || state.context.isScreensaver,
  cursorHide: state.renderer.cursorHide,
  isScreensaver: state.context.isScreensaver,
  itemIndex: state.renderer.itemIndex,
  items: state.renderer.items,
  transitionTimeAutoPlay: state.slideshow.transitionTimeAutoPlay,
  transitionTimeManual: state.slideshow.transitionTimeManual,
  triggeredByAutoplay: state.renderer.triggeredByAutoplay,
});

export default connect( mapStateToProps )(ImagePane);

