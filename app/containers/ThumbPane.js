import React, { Component } from 'react';
import * as cssConstants from '../cssConstants';

export default class ThumbPane extends Component {
  render() {

    return (
      <div>
        <button className={cssConstants.CSS_BUTTON}>ThumbPane</button>
      </div>
    );
  }
}
