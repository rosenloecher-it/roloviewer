import React, { Component } from 'react';
import ReactCSSTransitionReplace from 'react-css-transition-replace';
import {connect} from "react-redux";
import log from 'electron-log';
import * as cssConstants from '../style/cssConstants';
import * as actions from "../store/actionsImagePane";
import * as ops from "../rendererOps";
import * as constants from "../../common/constants";
import config from '../rendererConfig';

// ----------------------------------------------------------------------------------

const _logKey = "imapePane";

// ----------------------------------------------------------------------------------

class ImagePane extends Component {

  constructor(props) {
    super(props);

    this.data = {
      timerId: null
    };

    //this.componentDidUpdate = this.componentDidUpdate.bind(this);

    //componentWillReceiveProps

    this.onClick = this.onClick.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onMouseWheel = this.onMouseWheel.bind(this);
    this.render = this.render.bind(this);
    this.sendNotifications = this.sendNotifications.bind(this);
    this.reconfigureAutoPlay = this.reconfigureAutoPlay.bind(this);

    this.onTimerNext = this.onTimerNext.bind(this);
  }

  // .......................................................

  componentDidMount() {
    window.addEventListener("click", this.onClick);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("wheel", this.onMouseWheel);
    window.addEventListener('scroll', this.onScroll);
  }

  // .......................................................

  componentWillUnmount() {

    if (this.data.timerId)
      clearInterval(this.data.timerId);

    window.removeEventListener("click", this.onClick);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("wheel", this.onMouseWheel);
    window.removeEventListener('scroll', this.onScroll);
  }

  // .......................................................

  componentDidUpdate(prevProps, prevState) {
    const func = ".componentWillReceiveProps";

    const instance = this;

    const activeAutoPlay = (instance.data.timerId !== null);
    if (instance.props.autoPlay !== activeAutoPlay) {

      new Promise((resolve) => {
        instance.reconfigureAutoPlay();
        resolve();
      }).catch((error) => {
        log.error(`${_logKey}${func} - exception -`, error);
      });
    }
  }

  // .......................................................

  goBack() {
    this.props.dispatch(actions.goBack());
  }

  goNext() {
    this.props.dispatch(actions.goNext());
  }


  // .......................................................

  onClick() {
    this.goNext();
  }

  // .......................................................

  onKeyDown(event) {
    const func = ".onKeyDown";

    switch (event.keyCode) {
      case 32: // space
        this.props.dispatch(actions.toogleAutoPlay()); break;
      case 33: // page up
        this.props.dispatch(actions.goPageBack()); break;
      case 34: // page down
        this.props.dispatch(actions.goPageNext()); break;
      case 35: // end
        this.props.dispatch(actions.goEnd()); break;
      case 36: // pos1
        this.props.dispatch(actions.goPos1()); break;
      case 37: // arrow left
      case 38: // arrow up
        this.goBack(); break;
      case 39: // arrow right
      case 40: // arrow down
        this.goNext(); break;
      default:
        log.silly(`${_logKey}${func} - keyCode=${event.keyCode}`);
        break;
    }
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
    log.debug(`${_logKey}${func}(${props.showIndex}, autoPlay=${this.props.autoPlay}):`, imagePath);

    if (imagePath)
      this.sendNotifications(imagePath);

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
        />

      </ReactCSSTransitionReplace>

    );
  }

  // .......................................................

  sendNotifications(currentItemFile) {
    const func = ".sendNotifications";

    const {props} = this;
    const {data} = this;

    new Promise((resolve, reject) => {

      if (currentItemFile !== data.lastImageFile || data.lastContainer === props.container) {
        ops.publishLastItem(currentItemFile, props.container);

        data.lastImageFile = currentItemFile;
        data.lastContainer = props.container;

        do {
          if (props.container !== null)
            break; // no auto-select
          if (props.showIndex < props.items.length - constants.DEFCONF_RENDERER_ITEM_RESERVE)
            break; // sufficient reserve

          let lastFile = "";
          if (props.items.length > 0)
            lastFile = props.items[props.items.length - 1].file;

          const requestKey = `${props.items.length}|${lastFile}|${props.container}`;
          if (data.lastRequestKey === requestKey) {
            //log.debug(`${_logKey}${func} - requestNewItems - abort key: lastRequestKey=${data.lastRequestKey}, requestKey=${requestKey}`);
            break; // already send
          }

          ops.requestNewItems();
          data.lastRequestKey = requestKey;

          log.debug(`${_logKey}${func} - requestNewItems (send): requestKey=${requestKey}`);

        } while (false);
      }
    }).catch((error) => {
      log.error(`${_logKey}${func} - exception -`, error);
    });
  }

  // .......................................................

  onTimerNext() {
    const func = ".onTimerNext";
    log.info(`${_logKey}${func}`);
    this.goNext();
  }

  // .......................................................

  reconfigureAutoPlay() {
    const func = ".reconfigureAutoPlay";

    try {
      const activeAutoPlay = (this.data.timerId !== null);
      if (this.props.autoPlay === activeAutoPlay) {
        log.debug(`${_logKey}${func} - NO CHANGE - props.autoPlay=${this.props.autoPlay}, data.timerId=${this.data.timerId}`);
        return;
      }

      const timeSwitch = config.slideshowTimer;

      if (this.props.autoPlay) {
        this.data.timerId = setInterval(this.onTimerNext, timeSwitch);
        log.debug(`${_logKey}${func} - ON - props.autoPlay=${this.props.autoPlay}, data.timerId=${this.data.timerId}`);
      } else {
        clearInterval(this.data.timerId);
        this.data.timerId = null;
        log.debug(`${_logKey}${func} - OFF - props.autoPlay=${this.props.autoPlay}, data.timerId=${this.data.timerId}`);
      }
    } catch(error) {
      log.error(`${_logKey}${func} - exception -`, error);
    }
  }

  // .......................................................
}

const mapStateToProps = state => ({
  showIndex: state.imagePane.showIndex,
  items: state.imagePane.items,
  container: state.imagePane.container,
  autoPlay: state.imagePane.autoPlay
});

export default connect( mapStateToProps )(ImagePane);

