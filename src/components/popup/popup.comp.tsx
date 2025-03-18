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
  children: ReactChild;
  refCallback?: string | ((instance: HTMLDivElement | null) => void) | RefObject<HTMLDivElement> | null | undefined;
  customLabels?: ICustomLabels;
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

const PopupComp = ({ context, className, style, show, closeCallback, children, refCallback, customLabels }: IProps) => {
  const { translatePage } = usePageTranslation(context.activePage?.id);
  const finalStyle: any = Object.assign({}, { display: show ? 'block' : 'none' }, style || {});
  const closeLabel = customLabels?.buttons?.closeForm || translatePage('buttons.closeForm');

  const handleKeyDown = (e: KeyboardEvent) => {
    if (show && e.keyCode === 27) {
      closeCallback(e);
    }
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [show]);

  return (
    <PortalPopup>
      {
        show ?
          <div className={`popup ${className || ''}`} style={finalStyle}>
            <div className="overlay" onClick={(e: any) => closeCallback(e)}></div>
            <div className="popup-content" ref={refCallback}>
              {children}
              <button 
                title={closeLabel}
                className="close-popup" 
                onClick={(e: any) => closeCallback(e)}
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
