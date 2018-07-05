import React from 'react';
import { connect } from 'react-redux';
import log from 'electron-log';
import * as cssConstants from '../style/cssConstants';
import ImagePane from './imagePane';
import MessageDialog from './MessageDialog';
import HelpOverlay from './helpOverlay';
import DetailsOverlay from './detailsOverlay';
import * as actions from "../store/actionsSlideshow";
import config from "../rendererConfig";
import * as ops from "../rendererOps";
import * as constants from "../../common/constants";

// ----------------------------------------------------------------------------------

const _logKey = "slideshow";

// ----------------------------------------------------------------------------------

class Slideshow extends React.Component {

  constructor(props) {
    super(props);

    this.data = {
      timerIdNext: null,
      timerIdHideCursor: null,
      lastMouseMove: null
    };

    this.goBack = this.goBack.bind(this);
    this.goNext = this.goNext.bind(this);
    this.handleNotifications = this.handleNotifications.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onTimerHideCursor = this.onTimerHideCursor.bind(this);
    this.onTimerNext = this.onTimerNext.bind(this);
    this.reconfigureAutoPlay = this.reconfigureAutoPlay.bind(this);
  }

  // .......................................................

  componentDidMount() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("mousemove", this.onMouseMove);

    this.data.timerIdHideCursor = setInterval(this.onTimerHideCursor, 1000);
  }

  // .......................................................

  componentWillUnmount() {

    if (this.data.timerIdNext)
      clearInterval(this.data.timerIdNext);
    this.data.timerIdHideCursor
      clearInterval(this.data.timerIdHideCursor);

    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("mousemove", this.onMouseMove);
  }

  // .......................................................

  componentDidUpdate(prevProps, prevState) {
    const func = ".componentDidUpdate";

    const instance = this;

    const activeAutoPlay = (instance.data.timerIdNext !== null);
    if (instance.props.autoPlay !== activeAutoPlay) {
      new Promise((resolve) => {
        instance.reconfigureAutoPlay();
        resolve();
      }).catch((error) => {
        log.error(`${_logKey}${func} - exception -`, error);
      });
    }

    this.handleNotifications();
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
      case 73: // i
        if (event.ctrlKey)
          this.props.dispatch(actions.detailsMove());
        else
          this.props.dispatch(actions.detailsToogle());
        break;

      default:
        log.silly(`${_logKey}${func} - keyCode=${event.keyCode}`);
        break;
    }
  }

  // .......................................................

  onMouseMove() {
    if (this.props.cursorHide)
      this.props.dispatch(actions.cursorShow());

    this.data.lastMouseMove = new Date();
  }

  // .......................................................

  onTimerHideCursor() {
    const currTime = new Date();
    const diffTime = currTime - this.data.lastMouseMove; //in ms

    if (!this.props.cursorHide && diffTime > 5000) {
      //log.debug(`${_logKey}.onTimerHideCursor - hide cursor: cursorHide=${this.props.cursorHide}, diffTime=${diffTime}`);
      this.props.dispatch(actions.cursorHide());
    }
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
      const activeAutoPlay = (this.data.timerIdNext !== null);
      if (this.props.autoPlay === activeAutoPlay) {
        log.debug(`${_logKey}${func} - NO CHANGE - props.autoPlay=${this.props.autoPlay}, data.timerId=${this.data.timerIdNext}`);
        return;
      }

      const timeSwitch = config.slideshowTimer;

      if (this.props.autoPlay) {
        this.data.timerIdNext = setInterval(this.onTimerNext, timeSwitch);
        log.debug(`${_logKey}${func} - ON - props.autoPlay=${this.props.autoPlay}, data.timerId=${this.data.timerIdNext}`);
      } else {
        clearInterval(this.data.timerIdNext);
        this.data.timerIdNext = null;
        log.debug(`${_logKey}${func} - OFF - props.autoPlay=${this.props.autoPlay}, data.timerId=${this.data.timerIdNext}`);
      }
    } catch(error) {
      log.error(`${_logKey}${func} - exception -`, error);
    }
  }

  // .......................................................

  render() {
    const func = ".render";

    //<HelpDialog />

    const {props} = this;

    //log.debug(`${_logKey}${func} - props.helpShow=`, props.helpShow);

    let helpOverlay = null;
    if (props.helpShow)
        helpOverlay = <HelpOverlay />;

    return (
      <div className={cssConstants.CSS_MAINPANE}>
        <ImagePane />
        <DetailsOverlay />
        {helpOverlay}
        <MessageDialog />

      </div>
    );
  }

  // .......................................................

  handleNotifications() {
    const func = ".handleNotifications";

    const {props, data} = this;

    let currentItemFile = null;
    if (props.showIndex >= 0 && props.showIndex < props.items.length) {
      const item = props.items[props.showIndex];
      currentItemFile = item.file;
    }
    if (!currentItemFile)
      return;

    new Promise((resolve) => {

      if (data.lastImageFile !== currentItemFile || data.lastContainer !== props.container)
        ops.publishLastItem(currentItemFile, props.container);

      data.lastImageFile = currentItemFile;
      data.lastContainer = props.container;

      // request new files
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

    }).catch((error) => {
      log.error(`${_logKey}${func} - exception -`, error);
    });
  }

  // .......................................................
}


// ----------------------------------------------------------------------------------

const mapStateToProps = state => ({
  autoPlay: state.slideshow.autoPlay,
  container: state.slideshow.container,
  cursorHide: state.slideshow.cursorHide,
  helpShow: state.slideshow.helpShow,
  items: state.slideshow.items,
  showIndex: state.slideshow.showIndex,
});

export default connect( mapStateToProps )(Slideshow);



