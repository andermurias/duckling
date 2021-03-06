import {createPointer} from './element';
import {px, setInitialProperties, updateProperties, getProperty, setProperty, getProperties} from './helper';

const usePointer = (properties = {}) => {
  if (getProperty('pointerInit') !== '') {
    console.warn('Another instance of duckling is already running, duckling should only be running once');
    return {
      pointer: null,
      interactionConfig: null,
      initialProperties: null,
    };
  }
  setProperty('pointerInit', 1);

  const initialProperties = setInitialProperties(properties);
  const pointer = createPointer(initialProperties);

  let state = {...initialProperties};
  const setState = (newState) => {
    state = {...state, ...newState};
  };

  document.documentElement.style.transition = 'ease-out all 300ms';

  const trackMouseOnMove = (e) => {
    if (state.shouldMove) {
      setState({
        pointerX: px(e.x),
        pointerY: px(e.y),
      });
    }
  };

  document.addEventListener('mousemove', trackMouseOnMove);

  const interactionConfig = new Map();

  const processCallback = ({target, callback}) => {
    const callbackResponse = callback(target);
    setState({
      ...callbackResponse.props,
      shouldMove: callbackResponse.track,
    });
  };

  const checkSeletorsAndDispatchCallback = (event) => {
    for (let [selector, callback] of interactionConfig) {
      const closest = event.target.closest(selector);
      if (!!closest) {
        processCallback({target: closest, callback: callback});
      }
    }
  };

  const checkSeletorsAndResetVars = (event) => {
    for (let [selector, callback] of interactionConfig) {
      if (!!event.target.closest(selector)) {
        setState({
          ...initialProperties,
        });
      }
    }
  };

  document.removeEventListener('mouseover', checkSeletorsAndDispatchCallback, false);
  document.removeEventListener('mouseout', checkSeletorsAndResetVars, false);

  document.addEventListener('mouseover', checkSeletorsAndDispatchCallback, false);
  document.addEventListener('mouseout', checkSeletorsAndResetVars, false);

  const updatePropertiesForAnimationFrame = () => {
    updateProperties(state);
    requestAnimationFrame(updatePropertiesForAnimationFrame);
  };
  requestAnimationFrame(updatePropertiesForAnimationFrame);

  return {
    pointer,
    interactionConfig,
    initialProperties,
  };
};

const helper = {
  px,
};

export default {
  usePointer,
  helper,
};
