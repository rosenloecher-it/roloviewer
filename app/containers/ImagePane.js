import React, { Component } from 'react';
import * as cssConstants from '../cssConstants';

export default class ImagePane extends Component {
  render() {
    return (
      <div>
        <button className={cssConstants.CSS_BUTTON}>ImagePane</button>
      </div>
    );
  }
}
