import React, { Component } from 'react';
import * as cssConstants from '../cssConstants';

export default class DetailPane extends Component {
  render() {
    return (
      <div>
        <button className={cssConstants.CSS_BUTTON}>DetailPane</button>
      </div>
    );
  }
}
