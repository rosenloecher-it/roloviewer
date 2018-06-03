import React, { Component } from 'react';
import ReactCSSTransitionReplace from 'react-css-transition-replace';
import {connect} from "react-redux";
import * as cssConstants from '../cssConstants';
import * as action from "../actions/actionImagePane";

class ImagePane extends Component {

  constructor(props) {
    super(props);

    this.onNextObject = this.onNextObject.bind(this);
    this.onMouseWheel = this.onMouseWheel.bind(this);

  }

  componentDidMount() {
    console.log("componentDidMount");
    return window.addEventListener('scroll', this.onScroll);
  }

  componentWillUnmount() {
    console.log("componentWillUnmount");
    return window.removeEventListener('scroll', this.onScroll);
  }

  onNextObject() {
    console.log("onNextObject", this.props.showIndex);
    this.props.dispatch(action.nextObject());
  }

  onMouseWheel(event) {
    console.log("onMouseWheel", event.deltaY);
    this.props.dispatch(action.nextObject());
    // if(event.deltaY > 0) {
    //   console.log("onMouseWheel ++");
    // } else if(event.deltaY < 0) {
    //   console.log("onMouseWheel --");
    // }
  }

  render() {
    const imagePath1 = "file:///home/data/projects/electron/images/20151011-1053-5674.jpg";
    const imagePath2 = "file:/home/data/projects/electron/images/20180520-1505-2947d.jpg";

    const imagePath = this.props.showIndex % 2 === 0 ? imagePath1 : imagePath2 ;

      console.log("imagePath", imagePath);


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
          key={imagePath}
          onClick={() => {
           this.onNextObject();
          }}
          onWheel={this.onMouseWheel}
          onScroll={this.onScroll}
        />

      </ReactCSSTransitionReplace>
    );
  }
}


const mapStateToProps = state => ({
  showIndex: state.imagePane.showIndex,
});

export default connect( mapStateToProps )(ImagePane);
