import React, { Component, RefObject, ReactChild } from 'react';
import ReactDOM from 'react-dom';
import { usePageTranslation } from '../../hooks/usePageTranslation';

import './popup.scss';
import { ICustomLabels } from '../../common/models/config.model';
import { IAppContext } from '../app.context';
import { withAppContext } from '../withContext/withContext.comp';

interface IProps {
  context: IAppContext;
  className?: string;
  style?: any;
  show: boolean;
  closeCallback: any;
  shouldClose?: () => boolean;
  children: ReactChild;
  customLabels?: ICustomLabels;
  ariaLabelledby?: string;
}

let portalRoot: HTMLDivElement = document.getElementById('popup-portal') as HTMLDivElement;
if (!portalRoot) {
  portalRoot = document.createElement('div');
  portalRoot.setAttribute('id', 'popup-portal');
  document.body.append(portalRoot);
}

class PortalPopup extends Component {
  private el: HTMLElement;

  constructor(props: any) {
    super(props);
    this.el = document.createElement('div');
  }

  componentDidMount = () => {
    portalRoot.appendChild(this.el);
  }

  componentWillUnmount = () => {
    portalRoot.removeChild(this.el);
  }

  render() {
    return ReactDOM.createPortal(this.props.children, this.el);
  }
}

const PopupComp = ({ context, className, style, show, closeCallback, shouldClose, children, customLabels, ariaLabelledby }: IProps) => {
  const { translatePage } = usePageTranslation(context.activePage?.id);
  const finalStyle: any = Object.assign({}, { display: show ? 'block' : 'none' }, style || {});
  const closeLabel = customLabels?.buttons?.closeForm || translatePage('buttons.closeForm');
  const popupContentRef = React.useRef<HTMLDivElement>(null);

  const handleClose = (e?: any) => {
    // If shouldClose callback is provided, check if closing is allowed
    if (shouldClose) {
      const allowed = shouldClose();
      if (!allowed) {
        return;
      }
    }
    closeCallback(e);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (show && e.keyCode === 27) {
      handleClose(e);
    }
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [show]);

  React.useEffect(() => {
    if (show && popupContentRef.current) {
      popupContentRef.current.focus();
    }
  }, [show]);

  return (
    <PortalPopup>
      {
        show ?
          <div className={`popup ${className || ''}`} style={finalStyle}>
            <div className="overlay" onClick={(e: any) => handleClose(e)}></div>
            <div
              className="popup-content"
              ref={popupContentRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-labelledby={ariaLabelledby}
            >
              {children}
              <button
                title={closeLabel}
                className="close-popup"
                onClick={(e: any) => handleClose(e)}
                aria-label={translatePage('aria.close')}
              >
                <i className="fa fa-times" aria-hidden="true"></i>
              </button>
            </div>
          </div> :
          null
      }
    </PortalPopup>
  );
};

export const Popup = withAppContext(PopupComp);
