import React from 'react';
import { connect } from 'react-redux';
import log from 'electron-log';
import * as cssConstants from '../style/cssConstants';
import ImagePane from './imagePane';
import MessageDialog from './MessageDialog';
import AboutOverlay from './aboutOverlay';
import HelpOverlay from './helpOverlay';
import DetailsOverlay from './detailsOverlay';
import * as actions from "../../common/store/slideshowActions";
import storeManager from "../store/rendererManager";
import * as constants from "../../common/constants";
import * as actionsCrawlerTasks from "../../common/store/crawlerTasksActions";
import * as ops from "../rendererOps";

// ----------------------------------------------------------------------------------

const _logKey = "slideshow";

// ----------------------------------------------------------------------------------

class Slideshow extends React.Component {

  // .......................................................

  static persistLastItem(manager, containerType, container, currentFile) {
    const func = ".persistLastItem";

    try {
      //log.debug(`${_logKey}${func} - lastItem=${lastItemFile}, lastContainer=${lastContainer}`);

      if (currentFile) {
        const action = actions.createActionSetLastItemContainer(containerType, container, currentFile);
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
      action = actions.createActionJump(-storeManager.slideshowJumpWidth);

    this.dispatchGotoAction(action);
  }

  goPageNext() {
    //log.debug(`${_logKey}.goPageNext`);

    let action;
    if (this.props.containerType === constants.CONTAINER_AUTOSELECT)
      action = actions.createActionGoPage(1);
    else
      action = actions.createActionJump(storeManager.slideshowJumpWidth);

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

  onKeyDown(event) {
    const func = ".onKeyDown";

    if (this.props.isScreensaver)
      return;

    switch (event.keyCode) {
      case 32: // space
        storeManager.dispatchGlobal(actions.createActionToogleAutoPlay()); break;
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
          storeManager.dispatchGlobal(actions.createActionDetailsMove());
        else
          storeManager.dispatchGlobal(actions.createActionDetailsToogle());
        break;

      default:
        //log.silly(`${_logKey}${func} - keyCode=${event.keyCode}`);
        break;
    }
  }

  // .......................................................

  onMouseMove() {
    if (this.props.cursorHide)
      storeManager.dispatchLocal(actions.createActionCursorShow());

    this.data.lastMouseMove = new Date();
  }

  // .......................................................

  onTimerHideCursor() {
    const currTime = new Date();
    const diffTime = currTime - this.data.lastMouseMove; //in ms

    if (!this.props.cursorHide && diffTime > 5000) {
      //log.debug(`${_logKey}.onTimerHideCursor - hide cursor: cursorHide=${this.props.cursorHide}, diffTime=${diffTime}`);
      storeManager.dispatchLocal(actions.createActionCursorHide());
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
    const func = ".render";

    //<HelpDialog />

    const {props} = this;

    //log.debug(`${_logKey}${func} - props.helpShow=`, props.helpShow);

    let dialogOverlay = null;
    if (props.helpShow)
      dialogOverlay = <HelpOverlay />;
    else if ((props.aboutShow))
      dialogOverlay = <AboutOverlay />;

    return (
      <div className={cssConstants.CSS_MAINPANE}>
        <ImagePane />
        <DetailsOverlay />
        {dialogOverlay}
        <MessageDialog />

      </div>
    );
  }

  // .......................................................

  handleNotifications() {
    const func = ".handleNotifications";

    const {props, data} = this;

    let currentItemFile = null;
    if (props.itemIndex >= 0 && props.itemIndex < props.items.length) {
      const item = props.items[props.itemIndex];
      currentItemFile = item.file;
    }
    if (!currentItemFile)
      return;

    new Promise((resolve) => {


      if (currentItemFile && data.lastImageFile !== currentItemFile || data.lastContainer !== props.container)
        Slideshow.persistLastItem(storeManager, props.containerType, props.container, currentItemFile);
        //ops.persistLastItem(currentItemFile, props.container);


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

        const action = actionsCrawlerTasks.createActionOpen(null, null);
        storeManager.dispatchGlobal(action);

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
  aboutShow: state.slideshow.aboutShow,
  combinedAutoPlay: state.slideshow.autoPlay || state.context.isScreensaver,
  container: state.slideshow.container,
  containerType: state.slideshow.containerType,
  cursorHide: state.slideshow.cursorHide,
  helpShow: state.slideshow.helpShow,
  items: state.slideshow.items,
  itemIndex: state.slideshow.itemIndex,
  isScreensaver: state.context.isScreensaver,
});

export default connect( mapStateToProps )(Slideshow);



