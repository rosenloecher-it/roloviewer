import React from 'react';
import ReactCSSTransitionReplace from 'react-css-transition-replace';
import Transition from 'react-inline-transition-group';
import {connect} from "react-redux";
import log from 'electron-log';
import * as cssConstants from '../style/cssConstants';
import * as actions from "../store/actionsSlideshow";
import * as ops from "../rendererOps";
import * as constants from "../../common/constants";
import config from '../rendererConfig';
import { CSSTransition, transit } from "react-css-transition";
import EasyTransition from 'react-easy-transition'

// ----------------------------------------------------------------------------------

const _logKey = "imapePane";

// ----------------------------------------------------------------------------------

class ImagePane extends React.Component {

  constructor(props) {
    super(props);

    this.data = {};

    this.onClick = this.onClick.bind(this);
    this.onMouseWheel = this.onMouseWheel.bind(this);
    this.render = this.render.bind(this);

    this.renderReactCSSTransitionReplace = this.renderReactCSSTransitionReplace.bind(this);
    this.renderReactInlineTransitionGroup = this.renderReactInlineTransitionGroup.bind(this);

    this.renderCSSTransition = this.renderCSSTransition.bind(this);
    this.renderEasyTransition = this.renderEasyTransition.bind(this);
    this.renderReactCSSTransitionReplace2 = this.renderReactCSSTransitionReplace2.bind(this);



  }

  // .......................................................

  componentDidMount() {
    window.addEventListener("wheel", this.onMouseWheel);
    window.addEventListener('scroll', this.onScroll);
  }

  // .......................................................

  componentWillUnmount() {
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
    //return this.renderEasyTransition();
    //return this.renderCSSTransition();
    //return this.renderReactCSSTransitionReplace();
    return this.renderReactCSSTransitionReplace2();
    //return this.renderReactInlineTransitionGroup();
  }

  // .......................................................

  renderEasyTransition() {
    // https://www.npmjs.com/package/react-easy-transition

    const func = ".renderEasyTransition";

    const {props} = this;
    const cssImagePane = cssConstants.CSS_IMAGEPANE;

    let imagePath = null;
    if (props.showIndex >= 0 && props.showIndex < props.items.length) {
      const item = props.items[props.showIndex];
      imagePath = item.file;
    }
    const imageKey = (!imagePath ? "undefined" : imagePath);

    log.debug(`${_logKey}${func}(${props.showIndex}, autoPlay=${props.autoPlay}, cursorHide=${props.cursorHide}):`, imagePath);

    const transistionTime = 1500;

    // .cross-fade-leave {
    //   opacity: 1;
    // }
    //
    // .cross-fade-leave.cross-fade-leave-active {
    //   opacity: 0;
    //   transition: opacity $transition-time ease-in;
    // }
    //
    // .cross-fade-enter {
    //   opacity: 0;
    // }
    // .cross-fade-enter.cross-fade-enter-active {
    //   opacity: 1;
    //   transition: opacity $transition-time ease-in;
    // }

    return (
      <EasyTransition
        className={cssImagePane}
        path={"ggg"}
        initialStyle={{opacity: 0, color: 'red'}}
        transition="opacity 0.3s ease-in, color 0.5s ease-in"
        finalStyle={{opacity: 1, color: 'green'}}
        leaveStyle={{opacity: 0, color: 'gray'}}
      >
        <img
          className={cssImagePane}
          src={imagePath}
          key={imageKey}
          onClick={this.onClick}
          style={ props.cursorHide ? { cursor: 'none' } : null }
        />
      </EasyTransition>
    );
  }

  // .......................................................

  renderCSSTransition() {
    // https://wikiwi.github.io/react-css-transition/
    //  ( https://github.com/wikiwi/react-css-transition )

    const func = ".renderCSSTransition";

    const {props} = this;
    const cssImagePane = cssConstants.CSS_IMAGEPANE;

    let imagePath = null;
    if (props.showIndex >= 0 && props.showIndex < props.items.length) {
      const item = props.items[props.showIndex];
      imagePath = item.file;
    }

    const transistionTime = 1500;

    const { data } = this;
    if (data.activeNum === undefined)
      data.activeNum = 0;
    if (data.activeFile === undefined)
      data.activeFile = [ null, null ];

    if (data.activeFile[data.activeNum] !== imagePath) {
      data.activeNum++;
      if (data.activeNum > 1)
        data.activeNum = 0;

      data.activeFile[data.activeNum] = imagePath;
    }

    //log.debug(`${_logKey}${func}(${props.showIndex}, autoPlay=${props.autoPlay}, cursorHide=${props.cursorHide}):`, imagePath);
    //log.debug(`${_logKey}${func}(${props.showIndex}, activeNum=${data.activeNum}, imagePath${imagePath}, activeFile=${data.activeFile[data.activeNum]}`);
    log.debug(`${_logKey}${func}(${props.showIndex}, data=`, data);

    CSSTransition.childContextTypes = {
      // this can be empty
    }

    const jsx = (
      <div>
        {data.activeFile[0] != null &&
          <CSSTransition
            className={cssImagePane}
            defaultStyle={{opacity: 0}}
            enterStyle={{opacity: transit(1.0, transistionTime, "ease-in-out")}}
            leaveStyle={{opacity: transit(0, transistionTime, "ease-in-out")}}
            activeStyle={{opacity: 1.0}}
            active={data.activeNum === 0}
          >
            <img
              className={cssImagePane}
              src={data.activeFile[0]}
              key={data.activeFile[0]}
              onClick={this.onClick}
              style={props.cursorHide ? {cursor: 'none'} : null}
            />
          </CSSTransition>
        }

        {data.activeFile[1] != null &&
          <CSSTransition
            className={cssImagePane}
            defaultStyle={{opacity: 0}}
            enterStyle={{opacity: transit(1.0, transistionTime, "ease-in-out")}}
            leaveStyle={{opacity: transit(0, transistionTime, "ease-in-out")}}
            activeStyle={{opacity: 1.0}}
            active={data.activeNum === 1}
          >
            <img
              className={cssImagePane}
              src={data.activeFile[1]}
              key={data.activeFile[1]}
              onClick={this.onClick}
              style={props.cursorHide ? {cursor: 'none'} : null}
            />
          </CSSTransition>
        }
      </div>
    );

    return jsx;
  }

  // .......................................................

  renderReactCSSTransitionReplace2() {
    // https://github.com/marnusw/react-css-transition-replace

    const func = ".renderReactCSSTransitionReplace2";

    const {props} = this;
    const cssImagePane = cssConstants.CSS_IMAGEPANE;

    let imagePath = null;
    if (props.showIndex >= 0 && props.showIndex < props.items.length) {
      const item = props.items[props.showIndex];
      imagePath = item.file;
    }
    const imageKey = (!imagePath ? "undefined" : imagePath);

    log.debug(`${_logKey}${func}(${props.showIndex}, autoPlay=${props.autoPlay}, cursorHide=${props.cursorHide}):`, imagePath);

    const transistionTime = 1500;

    return (
      <div className={cssImagePane}>
        <style dangerouslySetInnerHTML={{__html: `
          .transgen-leave {
            opacity: 1;
          }

          .transgen-leave.transgen-leave-active {
            opacity: 0;
            transition: opacity ${transistionTime}ms ease-in;
          }

          .transgen-enter {
            opacity: 0;
          }
          .transgen-enter.transgen-enter-active {
            opacity: 1;
            transition: opacity ${transistionTime}ms ease-in;
          }

          .transgen-height {
            transition: height ${transistionTime}ms ease-in-out;
          }
        `}} />

        <ReactCSSTransitionReplace
          className={cssImagePane}
          transitionName="transgen"
          transitionEnterTimeout={transistionTime}
          transitionLeaveTimeout={transistionTime}
        >
          <img
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

  renderReactCSSTransitionReplace() {
    // https://github.com/marnusw/react-css-transition-replace

    const func = ".renderReactCSSTransitionReplace";

    const {props} = this;
    const cssImagePane = cssConstants.CSS_IMAGEPANE;

    let imagePath = null;
    if (props.showIndex >= 0 && props.showIndex < props.items.length) {
      const item = props.items[props.showIndex];
      imagePath = item.file;
    }
    const imageKey = (!imagePath ? "undefined" : imagePath);

    log.debug(`${_logKey}${func}(${props.showIndex}, autoPlay=${props.autoPlay}, cursorHide=${props.cursorHide}):`, imagePath);

    const transistionTime = 1500;

    return (
      <ReactCSSTransitionReplace
        className={cssImagePane}
        transitionName="cross-fade"
        transitionEnterTimeout={transistionTime}
        transitionLeaveTimeout={transistionTime}
      >
        <img
          className={cssImagePane}
          src={imagePath}
          key={imageKey}
          onClick={this.onClick}
          style={ props.cursorHide ? { cursor: 'none' } : null }
        />

      </ReactCSSTransitionReplace>
    );
  }

  // .......................................................

  renderReactInlineTransitionGroup() {
    // https://github.com/felipethome/react-inline-transition-group

    const func = ".renderReactInlineTransitionGroup";

    const {props} = this;
    const cssImagePane = cssConstants.CSS_IMAGEPANE;

    let imagePath = null;
    if (props.showIndex >= 0 && props.showIndex < props.items.length) {
      const item = props.items[props.showIndex];
      imagePath = item.file;
    }
    const imageKey = (!imagePath ? "undefined" : imagePath);

    log.debug(`${_logKey}${func}(${props.showIndex}, autoPlay=${props.autoPlay}, cursorHide=${props.cursorHide}):`, imagePath);

    const transistionTime = 1500;

  // .cross-fade-leave {
  //   opacity: 1;
  // }
  //
  // .cross-fade-leave.cross-fade-leave-active {
  //   opacity: 0;
  //   transition: opacity $transition-time ease-in;
  // }
  //
  // .cross-fade-enter {
  //   opacity: 0;
  // }
  // .cross-fade-enter.cross-fade-enter-active {
  //   opacity: 1;
  //   transition: opacity $transition-time ease-in;
  // }


    const styles = {
      container: {
      },

      base: {
        opacity: 0,
        transition: 'all 1500ms ease-out',
      },

      appear: {
        opacity: 1,
      },

      enter: {
        opacity: 1,
        transition: 'all 1500ms ease-in',
      },

      leave: {
        opacity: 0,
        transition: 'all 1500ms ease-out',
      },

      custom: {
        background: '#3F51B5',
      },
    };

    return (
      <Transition
        className={cssImagePane}

        childrenStyles={{
          base: styles.base,
          appear: styles.appear,
          enter: styles.enter,
          leave: styles.leave,
        }}
        style={styles.container}
      >
        <img
          className={cssImagePane}
          src={imagePath}
          key={imageKey}
          onClick={this.onClick}
          style={ props.cursorHide ? { cursor: 'none' } : null }
        />

      </Transition>
    );
  }

  // .......................................................

}

const mapStateToProps = state => ({
  autoPlay: state.slideshow.autoPlay,
  cursorHide: state.slideshow.cursorHide,
  items: state.slideshow.items,
  showIndex: state.slideshow.showIndex,
});

export default connect( mapStateToProps )(ImagePane);

