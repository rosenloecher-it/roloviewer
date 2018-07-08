import React from 'react';
import { connect } from 'react-redux';
import log from 'electron-log';
import * as cssConstants from '../style/cssConstants';
import ImagePane from './imagePane';
import MessageDialog from './MessageDialog';
import HelpOverlay from './helpOverlay';
import DetailsOverlay from './detailsOverlay';
import * as actions from "../../common/store/slideshowActions";
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

    // this.goPageBack = this.goPageBack.bind(this);
    // this.goPageNext = this.goPageNext.bind(this);
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
    this.dispatchGotoAction(actions.createActionGoBack());
  }

  goNext() {
    //log.debug(`${_logKey}.goNext`);
    this.dispatchGotoAction(actions.createActionGoNext());
  }

  goPageBack() {
    let action;
    if (this.props.containerType === constants.CONTAINER_AUTOSELECT)
      action = actions.createActionGoPage(-1);
    else
      action = actions.createActionJump(-config.slideshowJumpWidth);

    this.dispatchGotoAction(action);
  }

  goPageNext() {
    //log.debug(`${_logKey}.goPageNext`);

    let action;
    if (this.props.containerType === constants.CONTAINER_AUTOSELECT)
      action = actions.createActionGoPage(1);
    else
      action = actions.createActionJump(config.slideshowJumpWidth);

    //log.debug(`${_logKey}.goPageNext`, action);

    this.dispatchGotoAction(action);
  }

  // .......................................................

  dispatchGotoAction(action) {
    this.props.dispatch(action);

    // if (this.data.timerIdNext)
    //   this.reconfigureAutoPlay(true);
  }

  // .......................................................

  onKeyDown(event) {
    const func = ".onKeyDown";

    switch (event.keyCode) {
      case 32: // space
        this.props.dispatch(actions.createActionToogleAutoPlay()); break;
      case 33: // page up
        this.goPageBack(); break;
      case 34: // page down
        this.goPageNext(); break;
      case 35: // end
        this.dispatchGotoAction(actions.createActionGoEnd()); break;
      case 36: // pos1
        this.dispatchGotoAction(actions.createActionGoPos1()); break;
      case 37: // arrow left
      case 38: // arrow up
        this.goBack(); break;
      case 39: // arrow right
      case 40: // arrow down
        this.goNext(); break;
      case 73: // i
        if (event.ctrlKey)
          this.props.dispatch(actions.createActionDetailsMove());
        else
          this.props.dispatch(actions.createActionDetailsToogle());
        break;

      default:
        log.silly(`${_logKey}${func} - keyCode=${event.keyCode}`);
        break;
    }
  }

  // .......................................................

  onMouseMove() {
    if (this.props.cursorHide)
      this.props.dispatch(actions.createActionCursorShow());

    this.data.lastMouseMove = new Date();
  }

  // .......................................................

  onTimerHideCursor() {
    const currTime = new Date();
    const diffTime = currTime - this.data.lastMouseMove; //in ms

    if (!this.props.cursorHide && diffTime > 5000) {
      //log.debug(`${_logKey}.onTimerHideCursor - hide cursor: cursorHide=${this.props.cursorHide}, diffTime=${diffTime}`);
      this.props.dispatch(actions.createActionCursorHide());
    }
  }

  // .......................................................

  onTimerNext() {
    // const func = ".onTimerNext";
    // log.debug(`${_logKey}${func}`);
    this.goNext();
  }

  // .......................................................

  reconfigureAutoPlay(restart = false) {
    const func = ".reconfigureAutoPlay";

    try {
      const activeAutoPlay = (this.data.timerIdNext !== null);
      if (this.props.autoPlay === activeAutoPlay && !restart) {
        log.silly(`${_logKey}${func} - NO CHANGE - props.autoPlay=${this.props.autoPlay}, data.timerId=${this.data.timerIdNext}`);
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

      ops.persistAutoPlay(this.props.autoPlay);

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

      if (currentItemFile && data.lastImageFile !== currentItemFile || data.lastContainer !== props.container)
        ops.persistLastItem(currentItemFile, props.container);

      data.lastImageFile = currentItemFile;
      data.lastContainer = props.container;

      // request new files
      do {
        if (props.containerType !== constants.CONTAINER_AUTOSELECT)
          break;
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
  containerType: state.slideshow.containerType,
  cursorHide: state.slideshow.cursorHide,
  helpShow: state.slideshow.helpShow,
  items: state.slideshow.items,
  showIndex: state.slideshow.showIndex,
});

export default connect( mapStateToProps )(Slideshow);



