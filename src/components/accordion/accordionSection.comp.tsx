import React from "react";



interface IProps {
  children: any
  onClickItem: (e: any) => void
  label: string
  isOpen: boolean
}

const AccordionSection = (props: IProps) => {

 const { children, onClickItem, label, isOpen } = props;

  console.log("isOpen", isOpen)
  const onClick = () => {
    onClickItem(label);
  };

  return (
    <div>
      <div onClick={onClick} className="accordion-title" >
        <span>{label} </span>

      <div className="arrow-wrapper" style={{ float: "right" }}>
           <i className={isOpen
             ? "fa fa-angle-down fa-rotate-180" 
             : "fa fa-angle-down"}
        ></i>
      </div>
      </div>
      {isOpen && (
        <div className={isOpen?"accordion-content-open": "accordion-content"}>
          {children}
        </div>
      )}
    </div>
  );
};

export default AccordionSection;
