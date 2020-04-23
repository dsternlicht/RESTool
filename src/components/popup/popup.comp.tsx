import React, { Component, RefObject, ReactChild } from 'react';
import ReactDOM from 'react-dom';

import './popup.scss';
import { ICustomLabels } from '../../common/models/config.model';

interface IPopupProps {
  className?: string
  style?: any
  show: boolean
  closeCallback: any
  children: ReactChild
  refCallback?: string | ((instance: HTMLDivElement | null) => void) | RefObject<HTMLDivElement> | null | undefined
  customLabels?: ICustomLabels
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

export class Popup extends Component<IPopupProps> {
  render() {
    const style: any = Object.assign({}, { display: this.props.show ? 'block' : 'none' }, this.props.style || {});
    const closeLabel = this.props.customLabels?.buttons?.closeForm || 'Close';

    return (
      <PortalPopup>
        {
          this.props.show ?
            <div className={`popup ${this.props.className || ''}`} style={style}>
              <div className="overlay" onClick={(e: any) => this.props.closeCallback(e)}></div>
              <div className="popup-content" ref={this.props.refCallback}>
                {this.props.children}
                <button title={closeLabel} className="close-popup" onClick={(e: any) => this.props.closeCallback(e)}>
                  <i className="fa fa-times" aria-hidden="true"></i>
                </button>
              </div>
            </div> :
            null
        }
      </PortalPopup>
    );
  }

  componentDidMount() {
    document.addEventListener('keydown', this._handleKeyDown.bind(this));
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this._handleKeyDown.bind(this));
  }

  _handleKeyDown = (e: KeyboardEvent) => {
    const { show, closeCallback } = this.props;

    if (show && e.keyCode === 27) {
      closeCallback(e);
    }
  }
};