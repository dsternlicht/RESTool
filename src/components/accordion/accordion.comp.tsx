import React, { useState } from "react";

import PropTypes from "prop-types";

import './accordion.scss'

import AccordionSection from "./accordionSection.comp";


interface IProps {
  children: any
  allowMultipleOpen: boolean
}


const Accordion = (props: IProps) => {

  let { children, allowMultipleOpen } = props;

  const [openSections, setOpenSections] = useState<any>({});

  children.forEach((child: { props: { isOpen: any; label: string }; }) => {
    if (child.props.isOpen) {
      openSections[child.props.label] = true;
    }
  });

  const onClickItem = (label: string) => {
    console.log("label", label)
    const isOpen = !!openSections[label];

    if (allowMultipleOpen) {
      setOpenSections({
        ...openSections,
        [label]: !isOpen
      });
    } else {
      setOpenSections({
        [label]: !isOpen
      });
    }
  };

  return (
    <div>
      {children.map((child: any) => (
        <AccordionSection
          isOpen={!!openSections[child.props['data-label']]}
          label={child.props['data-label']}
          onClickItem={onClickItem}
        >
          {child.props.children}
        </AccordionSection>
      ))}
    </div>
  );
};

Accordion.propTypes = {
  allowMultipleOpen: PropTypes.bool,
  children: PropTypes.instanceOf(Object).isRequired
};

export default Accordion;
