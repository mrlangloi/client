import React from "react";
import UseInteractJS from "./UseInteractJS";

function Images(props) {

  const elementRef = UseInteractJS(props.id);

  return (
    <div className='imgDiv resize-drag resize-border' ref={elementRef}>
      <img className='interactive-img' alt='' src={props.image} height='250' />
    </div>
  )
}

export default Images;