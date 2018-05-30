import React, { Component } from 'react';
import * as cssConstants from '../cssConstants';

export default class NaviPane extends Component {
  render() {
    return (
      <div>
        <button className={cssConstants.CSS_BUTTON}>NaviPane</button>
      </div>
    );
  }
}
