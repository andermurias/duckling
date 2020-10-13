import gsap from 'gsap';
import {createPointer} from './element';

export const getProperty = (prop) => getComputedStyle(document.documentElement).getPropertyValue(prop);
export const setProperty = (prop, value) => document.documentElement.style.setProperty(prop, vlue);

const setShouldMove = (shouldMove) => document.documentElement.style.setProperty('--shouldMove', shouldMove ? 1 : 0);

const getShouldMove = () =>
  getComputedStyle(document.documentElement).getPropertyValue('--shouldMove') === '1' ? true : false;

export const updateProperties = (propperties, trackPosition = null) => {
  setShouldMove(trackPosition !== null ? trackPosition : getShouldMove());
  const cssVars = {
    duration: 0.3,
  };
  for (let key in propperties) {
    cssVars['--' + key] = propperties[key];
  }

  gsap.to('html', cssVars);
};

export const px = (int) => int + 'px';

export const setProps = ({
  smallPointerSize,
  pointerSize,
  pointerOpacity,
  pointerBackground,
  pointerBorderColor,
  pointerX,
  pointerY,
  pointerScale,
  pointerBorderStyle,
  pointerBorderWidth,
  cursorScale,
  cursorSize,
  pointerRadius,
  pointerZIndex,
}) => {
  const props = {
    smallPointerSize: smallPointerSize || '5px',
    pointerSize: pointerSize || '30px',
    pointerOpacity: pointerOpacity || 1,
    pointerBackground: pointerBackground || 'rgba(31,31,31,.3)',
    pointerBorderColor: pointerBorderColor || '#000000',
    // pointerX: pointerX || '50%',
    // pointerY: pointerY || '50%',
    pointerScale: pointerScale || 1,
    pointerBorderStyle: pointerBorderStyle || '1.5px',
    pointerBorderWidth: pointerBorderWidth || '1.5px',
    cursorScale: cursorScale || 1,
    cursorSize: cursorSize || '5px',
    pointerRadius: pointerRadius || '100%',
    pointerZIndex: pointerZIndex || 1000000000,
  };

  updateProperties(props);

  return props;
};

export const getProps = () => ({
  smallPointerSize: getProperty('--smallPointerSize'),
  pointerSize: getProperty('--pointerSize'),
  pointerOpacity: getProperty('--pointerOpacity'),
  pointerBackground: getProperty('--pointerBackground'),
  pointerBorderColor: getProperty('--pointerBorderColor'),
  pointerX: getProperty('--pointerX'),
  pointerY: getProperty('--pointerY'),
  pointerScale: getProperty('--pointerScale'),
  pointerBorderStyle: getProperty('--pointerBorderStyle'),
  pointerBorderWidth: getProperty('--pointerBorderWidth'),
  cursorScale: getProperty('--cursorScale'),
  cursorSize: getProperty('--cursorSize'),
  pointerRadius: getProperty('--pointerRadius'),
  pointerZIndex: getProperty('--pointerZIndex'),
});

export const init = () => {
  const position = {x: 0, y: 0};

  setShouldMove(true);

  createPointer();
  const initialProps = setProps({});

  console.log(initialProps);

  document.documentElement.style.transition = 'ease-out all 300ms';

  const launch = () => {
    var moveOnScroll = (d) => {
      updateProperties({
        pointerX: px(position.x + d.x),
        pointerY: px(position.y + d.y),
      });
      p.classList.remove('pointer--move');
      p.classList.add('pointer--move');
    };

    let scrollTimeout, start, end, distance;

    const onScrollMove = () => {
      end = {y: window.pageYOffset, x: window.pageXOffset};
      distance = {y: end.y - start.y, x: end.x - start.x};
      moveOnScroll(distance, start, end);
      start = distance = end = null;
    };

    const trackMouseOnMove = (e) => {
      if (getShouldMove()) {
        updateProperties({
          pointerX: px(e.x),
          pointerY: px(e.y),
        });
      }
    };

    document.addEventListener('mousemove', trackMouseOnMove);
  };

  launch();

  const loadInteractionListeners = (interactionConfig) => {
    const resetOut = () => {
      updateProperties(initialProps, true);
    };

    const processCallback = (current) => (callback) => () => {
      const callbackResponse = callback(current);
      updateProperties(callbackResponse.props, callbackResponse.track);
    };

    for (let selector in interactionConfig) {
      const callback = interactionConfig[selector];
      const elems = document.querySelectorAll(selector);

      elems.forEach((current) => {
        current.removeEventListener('mouseover', processCallback(current)(callback));
        current.addEventListener('mouseover', processCallback(current)(callback));

        current.removeEventListener('mouseout', resetOut);
        current.addEventListener('mouseout', resetOut);
      });
    }
  };

  return {
    loadInteractionListeners,
    initialProps,
  };
};