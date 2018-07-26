import log from 'electron-log';
import * as constants from "../constants";

// ----------------------------------------------------------------------------------

const _logKey = "rendererReducer";

// ----------------------------------------------------------------------------------

export class RendererReducer {

  constructor(name) {
    this._logKey = `${_logKey}(${name})`;
    this._deliveryKey = 0;

    this.reduce = this.reduce.bind(this);
  }

  // .....................................................

  static defaultState() {
    return {
      container: null,
      containerType: 0,
      cursorHide: false,
      helpShow: false,
      itemIndex: -1,
      items: [],
    }
  }

  // .....................................................

  reduce(state = RendererReducer.defaultState(), action) {
    const func = ".reduce";
    let actionType = '???';

    try {
      actionType = action.type;
      //log.debug(`${this._logKey}${func}(${actionType}) - in`);

      switch (action.type) {
        case constants.AR_RENDERER_GO_BACK:
          return this.goTo(state, state.itemIndex - 1);
        case constants.AR_RENDERER_GO_NEXT:
          return this.goTo(state, state.itemIndex + 1);
        case constants.AR_RENDERER_GO_JUMP:
          return this.goJump(state, action);
        case constants.AR_RENDERER_GO_PAGE:
          return this.goPage(state, action);
        case constants.AR_RENDERER_GO_POS1:
          return this.goTo(state, 0);
        case constants.AR_RENDERER_GO_END:
          return this.goTo(state, state.items.length - 1);

        case constants.AR_RENDERER_SHOW_CONTAINER_FILES:
          return this.showFiles(state, action);
        case constants.AR_RENDERER_ADD_AUTO_FILES:
          return this.addFiles(state, action);
        case constants.AR_RENDERER_DELIVER_META:
          return this.deliverMeta(state, action);

        case constants.AR_SLIDESHOW_AUTOPLAY_START:
          return {...state, autoPlay: true};
        case constants.AR_SLIDESHOW_AUTOPLAY_STOP:
          return {...state, autoPlay: false};
        case constants.AR_SLIDESHOW_AUTOPLAY_TOGGLE:
          return {...state, autoPlay: !state.autoPlay};

        case constants.AR_RENDERER_HELP_CLOSE:
          return { ...state, helpShow: false };
        case constants.AR_RENDERER_HELP_TOOGLE:
          return { ...state, aboutShow: false, helpShow: !state.helpShow };

        case constants.AR_RENDERER_ABOUT_OPEN:
          return { ...state, aboutShow: true, helpShow: false };
        case constants.AR_RENDERER_ABOUT_CLOSE:
          return { ...state, aboutShow: false };

        case constants.AR_RENDERER_CURSOR_HIDE:
          return {...state, cursorHide: true};
        case constants.AR_RENDERER_CURSOR_SHOW:
          return {...state, cursorHide: false};

        default:
          return state;
      }

    } catch (err) {
      log.error(`${this._logKey}${func}(${actionType}) - exception -`, err);
      log.debug(`${this._logKey}${func} - action -`, action);
      throw (err);
    }
  }

  // .....................................................

  setNewDeliveryKey(items) {
    this._deliveryKey++;

    for (let i = 0; i < items.length; i++)
      items[i].deliveryKey = this._deliveryKey; // eslint-disable-line no-param-reassign
  }

  // .....................................................

  showFiles(state, action) {
    const func = ".showFiles";

    const newItems = action.payload.items;
    const newSelectFile = action.payload.selectItem;

    if (!newItems) {
      log.error(`${_logKey}${func} !newItems`);
      throw new Error(`${_logKey}${func} - no items`, action);
    }

    //log.debug(`${_logKey}${func}:`, action);

    this.setNewDeliveryKey(newItems);

    log.debug(`${_logKey}${func} - ${newItems.length} items`);

    let newItemIndex = 0;
    if (action.selectFile) {
      for (let i = 0; i < newItems.length; i++) {
        if (newItems[i].file === newSelectFile) {
          newItemIndex = i;
          break;
        }
      }
    }

    return {
      ...state,
      items: newItems,
      itemIndex: newItemIndex,
      container: action.container,
      containerType: action.payload.containerType,
    };
  }

  // .....................................................

  addFiles(state, action) {
    const func = ".addFiles";

    this.setNewDeliveryKey(action.payload.items);

    if (state.containerType === constants.CONTAINER_AUTOSELECT) {

      const newItems = state.items.concat(action.payload.items);
      let newItemIndex = state.itemIndex;

      //log.debug(`${_logKey}${func} (add) - ${action.payload.items.length} items (sum = ${newItems.length})`);

      if (newItemIndex < 0 && newItems.length > 0)
        newItemIndex = 0;

      // add items
      return {
        ...state,
        items: newItems,
        itemIndex: newItemIndex,
        container: null,
        containerType: action.payload.containerType
      }
    } else {
      //log.debug(`${_logKey}${func} (replace) - ${action.payload.items.length} items`);

      // replace old items
      return {
        ...state,
        items: action.payload.items,
        itemIndex: 0,
        container: null,
        containerType: action.payload.containerType
      };
    }

  }

  // .....................................................

  goTo(state, newIndexIn) {
    const oldIndex = state.itemIndex;
    let newIndex = newIndexIn;

    const length = state.items.length;

    if (length > 0) {
      if (newIndex >= length)
        newIndex = length -1;
      else if (newIndex < 0)
        newIndex = 0;
    } else
      newIndex = -1;

    if (oldIndex === newIndex)
      return state; // no change

    return {
      ...state,
      itemIndex: newIndex
    };
  }

  // .....................................................

  goJump(state, action) {

    let jumpWidth = 0;
    if (action.payload)
      jumpWidth = action.payload;
    if (!jumpWidth)
      return state;

    return this.goTo(state, state.itemIndex + jumpWidth);
  }

  // .....................................................

  goPage(state, action) {

    let pageDirection = 0;
    if (action.payload)
      pageDirection = action.payload;
    if (!pageDirection)
      return state;

    let newItemIndex = -1;

    do {
      if (state.container)
        break;

      let currentDeliveryKey = -1;
      if (state.itemIndex >= 0 && state.itemIndex < state.items.length) {
        const item = state.items[state.itemIndex];
        if (item && item.deliveryKey)
          currentDeliveryKey = item.deliveryKey;
      }
      if (currentDeliveryKey < 0)
        break; // do standard

      // find first different deliveryKey
      if (pageDirection < 0) { // jump back
        for (let i = state.itemIndex - 1; i > 0; i--) {
          const item = state.items[i];
          if (item.deliveryKey !== currentDeliveryKey) {
            newItemIndex = i;
            break; // ready
          }
        }
        if (newItemIndex < 0)
          newItemIndex = 0;
      } else {
        for (let i = state.itemIndex + 1; i < state.items.length; i++) {
          const item = state.items[i];
          if (item.deliveryKey !== currentDeliveryKey) {
            newItemIndex = i;
            break; // ready
          }
        }
        if (newItemIndex < 0)
          newItemIndex = state.items.length - 1;
      }

      if (newItemIndex < 0)
        break;

      return this.goTo(state, newItemIndex);

    } while (false);

    return state;
  }

  // .....................................................

  deliverMeta(state, action) {
    const func = '.deliverMeta';

    let resultState = state;

    do {
      //log.debug(`${_logKey}.deliverMeta - ${action.type}`, action);

      if (!action.payload || !action.payload.meta) {
        log.debug(`${_logKey}${func} - no payload ==> break`);
        break;
      }

      const {meta} = action.payload;
      const { file } = meta;
      const { items : itemsOrig } = state;

      let fountFirst = -1;
      for (let i = 0; i < itemsOrig.length; i++) {
        if (itemsOrig[i].file === file) {
          fountFirst = i;
          break;
        }
      }

      // real change
      if (fountFirst >= 0) {
        resultState = {...state};
        const { items : itemsNew } = resultState;

        for (let i = 0; i < itemsNew.length; i++) {
          if (itemsNew[i].file === file) {
            const newItem = itemsNew[i];
            newItem.meta = meta;

            // if container !== playlist --- break;
          }
        }
      } else
        log.debug(`${_logKey}${func} - no item found for "${file}" !!!`);

    } while (false);

    return resultState;
  }

  // .....................................................

}


// ----------------------------------------------------------------------------------
