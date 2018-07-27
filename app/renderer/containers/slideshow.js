import React from 'react';
import path from 'path';
import { connect } from 'react-redux';
import log from 'electron-log';
import * as cssConstants from '../style/cssConstants';
import ImagePane from './imagePane';
import MessageDialog from './MessageDialog';
import AboutOverlay from './aboutOverlay';
import HelpOverlay from './helpOverlay';
import DetailsOverlay from './detailsOverlay';
import StatusOverlay from './statusOverlay';
import * as slideshowActions from "../../common/store/slideshowActions";
import * as statusActions from "../../common/store/statusActions";
import * as rendererActions from "../../common/store/rendererActions";
import storeManager from "../store/rendererManager";
import * as constants from "../../common/constants";
import * as workerActions from "../../common/store/workerActions";
import * as ops from "../rendererOps";

// ----------------------------------------------------------------------------------

const _logKey = "slideshow";

// ----------------------------------------------------------------------------------

class Slideshow extends React.Component {

  // .......................................................

  static persistLastItem(manager, containerType, container, currentFile) {
    const func = ".persistLastItem";

    try {
      if (currentFile) {
        let action = null;
        if (containerType === constants.CONTAINER_CLIPBOARD)
          action = slideshowActions.createActionSetLastItemContainer(constants.CONTAINER_FOLDER, path.dirname(currentFile), currentFile);
        else
          action = slideshowActions.createActionSetLastItemContainer(containerType, container, currentFile);
        manager.dispatchGlobal(action);
      }

    } catch (err) {
      log.error(`${_logKey}${func} - exception -`, err);
      manager.showMessage(`${_logKey}${func} - exception - ${err}`);
    }

  }

  // .......................................................

  constructor(props) {
    super(props);

    this.data = {
      timerIdNext: null,
      timerIdHideCursor: null,
      lastMouseMove: null,
      isScreensaver: false
    };

    this.goBack = this.goBack.bind(this);
    this.goNext = this.goNext.bind(this);
    this.handleNotifications = this.handleNotifications.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onQuitScreensaver = this.onQuitScreensaver.bind(this);
    this.registerOnQuitScreensaver = this.registerOnQuitScreensaver.bind(this);
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
    if (this.data.timerIdHideCursor)
      clearInterval(this.data.timerIdHideCursor);

    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("mousemove", this.onMouseMove);
  }

  // .......................................................

  componentDidUpdate(prevProps, prevState) {
    const func = ".componentDidUpdate";

    const instance = this;

    const activeAutoPlay = (instance.data.timerIdNext !== null);
    if (instance.props.combinedAutoPlay !== activeAutoPlay) {
      new Promise((resolve) => {
        instance.reconfigureAutoPlay();
        resolve();
      }).catch((error) => {
        log.error(`${_logKey}${func} - exception -`, error);
      });
    }

    if (this.props.isScreensaver === true && this.data.isScreensaver === false) {
      this.data.isScreensaver = true;
      setTimeout(this.registerOnQuitScreensaver, 500);
    }

    this.handleNotifications();
  }

  // .......................................................

  registerOnQuitScreensaver() {
    const func = '.registerOnQuitScreensaver';

    try {
      window.addEventListener("keydown", this.onQuitScreensaver);
      window.addEventListener("mousemove", this.onQuitScreensaver);
      window.addEventListener("onClick", this.onQuitScreensaver);

      log.debug(`${_logKey}${func}`);
    } catch (error) {
      log.error(`${_logKey}${func} - exception -`, error);
    };
  }

  // .......................................................

  onQuitScreensaver() {
    ops.quitScreensaver();
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

  goPageBack() {
    let action;
    if (this.props.containerType === constants.CONTAINER_AUTOSELECT)
      action = rendererActions.createActionGoPage(-1);
    else
      action = rendererActions.createActionJump(-storeManager.slideshowJumpWidth);

    this.dispatchGotoAction(action);
  }

  // .......................................................

  goPageNext() {
    //log.debug(`${_logKey}.goPageNext`);

    let action;
    if (this.props.containerType === constants.CONTAINER_AUTOSELECT)
      action = rendererActions.createActionGoPage(1);
    else
      action = rendererActions.createActionJump(storeManager.slideshowJumpWidth);

    //log.debug(`${_logKey}.goPageNext`, action);

    this.dispatchGotoAction(action);
  }

  // .......................................................

  dispatchGotoAction(action) {
    storeManager.dispatchGlobal(action);

    // if (this.data.timerIdNext)
    //   this.reconfigureAutoPlay(true);
  }

  // .......................................................

  onDragOver(event) {
    //log.debug(`${_logKey}.onDragOver - in`);
    event.preventDefault();
    return false;
  };

  onDragLeave(event) {
    //log.debug(`${_logKey}.onDragLeave - in`);
    event.preventDefault();
    return false;
  };

  onDragEnd(event) {
    //log.debug(`${_logKey}.onDragEnd - in`);
    event.preventDefault();
    return false;
  };

  onDrop(event) {
    const func = '.onDrop';

    try {
      //log.debug(`${_logKey}${func} - in`);
      event.preventDefault();

      const files = [];
      for (let f of event.dataTransfer.files) {
        files.push(f.path);
      }

      const action = workerActions.createActionOpenDropped(files);
      log.debug(`${_logKey}${func} - action`, action);
      storeManager.dispatchGlobal(action);

    } catch (err) {
      log.error(`${_logKey}${func} -`, err);
    }

    return false;
  };

  // .......................................................

  onKeyDown(event) {
    const func = ".onKeyDown";

    if (this.props.isScreensaver)
      return;

    switch (event.keyCode) {
      case 32: // space
        storeManager.dispatchGlobal(slideshowActions.createActionToogleAutoPlay()); break;
      case 33: // page up
        this.goPageBack(); break;
      case 34: // page down
        this.goPageNext(); break;
      case 35: // end
        this.dispatchGotoAction(rendererActions.createActionGoEnd()); break;
      case 36: // pos1
        this.dispatchGotoAction(rendererActions.createActionGoPos1()); break;
      case 37: // arrow left
      case 38: // arrow up
        this.goBack(); break;
      case 39: // arrow right
      case 40: // arrow down
        this.goNext(); break;
      case 73: // i
        if (event.ctrlKey)
          storeManager.dispatchGlobal(slideshowActions.createActionDetailsMove());
        else
          storeManager.dispatchGlobal(slideshowActions.createActionDetailsToogle());
        break;
      case 82: // r
        storeManager.dispatchGlobal(slideshowActions.createActionRandomToogle());
        break;
      case 87: // w
        if (event.ctrlKey)
          storeManager.dispatchGlobal(slideshowActions.createActionCrawlerInfoMove());
        else
          storeManager.dispatchGlobal(slideshowActions.createActionCrawlerInfoToogle());
        break;

      default:
        //log.debug(`${_logKey}${func} - keyCode=${event.keyCode}`);
        break;
    }
  }

  // .......................................................

  onMouseMove() {
    if (this.props.cursorHide)
      storeManager.dispatchLocal(rendererActions.createActionCursorShow());

    this.data.lastMouseMove = new Date();
  }

  // .......................................................

  onTimerHideCursor() {
    const currTime = new Date();
    const diffTime = currTime - this.data.lastMouseMove; //in ms

    if (!this.props.cursorHide && diffTime > 5000) {
      //log.debug(`${_logKey}.onTimerHideCursor - hide cursor: cursorHide=${this.props.cursorHide}, diffTime=${diffTime}`);
      storeManager.dispatchLocal(rendererActions.createActionCursorHide());
    }
  }

  // .......................................................

  onTimerNext() {
    const func = ".onTimerNext";

    try {
      // log.debug(`${_logKey}${func}`);
      if (this.props.containerType === constants.CONTAINER_AUTOSELECT)
        this.goNext();
      else {
        if (this.props.random)
          this.dispatchGotoAction(rendererActions.createActionGoRandom());
        else
          this.goNext();
      }
    } catch (err) {
      log.error(`${_logKey}${func} -`, err);
    }
  }

  // .......................................................

  reconfigureAutoPlay(restart = false) {
    const func = ".reconfigureAutoPlay";

    try {
      const activeAutoPlay = (this.data.timerIdNext !== null);
      if (this.props.combinedAutoPlay === activeAutoPlay && !restart) {
        log.silly(`${_logKey}${func} - NO CHANGE - props.autoPlay=${this.props.autoPlay}, data.timerId=${this.data.timerIdNext}`);
        return;
      }

      const timeSwitch = storeManager.slideshowTimer;

      if (this.props.combinedAutoPlay) {
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
    const {props} = this;

    let dialogOverlay = null;
    if (props.helpShow)
      dialogOverlay = <HelpOverlay />;
    else if ((props.aboutShow))
      dialogOverlay = <AboutOverlay />;

    return (
      <div
        className={cssConstants.CSS_MAINPANE}
        onDragOver={this.onDragOver}
        onDragLeave={this.onDragLeave}
        onDragEnd={this.onDragEnd}
        onDrop={this.onDrop}
      >
        <ImagePane />
        <DetailsOverlay />
        <StatusOverlay />
        {dialogOverlay}
        <MessageDialog />

      </div>
    );
  }

  // .......................................................

  handleNotifications() {
    const func = ".handleNotifications";

    const {props, data} = this;
    let action = null;

    let currentItemFile = null;
    if (props.itemIndex >= 0 && props.itemIndex < props.items.length) {
      const item = props.items[props.itemIndex];
      currentItemFile = item.file;
    }

    // action = statusActions.createActionNotifyCurrentItem(currentItemFile);
    // storeManager.dispatchGlobal(action);

    if (!currentItemFile)
      return;

    new Promise((resolve) => {

      if (currentItemFile && data.lastImageFile !== currentItemFile || data.lastContainer !== props.container)
        Slideshow.persistLastItem(storeManager, props.containerType, props.container, currentItemFile);

      data.lastImageFile = currentItemFile;
      data.lastContainer = props.container;

      // request new fileItems
      do {
        if (props.containerType !== constants.CONTAINER_AUTOSELECT)
          break;
        if (props.itemIndex < props.items.length - constants.DEFCONF_RENDERER_ITEM_RESERVE)
          break; // sufficient reserve

        let lastFile = "";
        if (props.items.length > 0)
          lastFile = props.items[props.items.length - 1].file;

        const requestKey = `${props.items.length}|${lastFile}|${props.container}`;
        if (data.lastRequestKey === requestKey) {
          //log.debug(`${_logKey}${func} - requestNewItems - abort key: lastRequestKey=${data.lastRequestKey}, requestKey=${requestKey}`);
          break; // already send
        }

        action = workerActions.createActionAutoSelect();
        storeManager.dispatchGlobal(action);

        data.lastRequestKey = requestKey;

        //log.debug(`${_logKey}${func} - requestNewItems (send): requestKey=${requestKey}`);

        resolve();

      } while (false);

    }).catch((error) => {
      log.error(`${_logKey}${func} - exception -`, error);
    });
  }

  // .......................................................

}


// ----------------------------------------------------------------------------------

const mapStateToProps = state => ({
  aboutShow: state.renderer.aboutShow,
  combinedAutoPlay: state.slideshow.autoPlay || state.context.isScreensaver,
  container: state.renderer.container,
  containerType: state.renderer.containerType,
  cursorHide: state.renderer.cursorHide,
  helpShow: state.renderer.helpShow,
  isScreensaver: state.context.isScreensaver,
  itemIndex: state.renderer.itemIndex,
  items: state.renderer.items,
  random: state.slideshow.random,
  transitionTimeAutoPlay: state.slideshow.transitionTimeAutoPlay,
  transitionTimeManual: state.slideshow.transitionTimeManual,
});

export default connect( mapStateToProps )(Slideshow);



