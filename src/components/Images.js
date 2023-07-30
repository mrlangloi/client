import React from "react";
import UseInteractJS from "./UseInteractJS";

function Images(props) {

  const { image, id }  = props;

  const elementRef = UseInteractJS(id);

  return (
    <div className='imgDiv resize-drag resize-border' ref={elementRef}>
      <img className='interactive-img' alt='' src={image} height='250' />
      <div className='rotation-handle' ref={elementRef}>A</div>
    </div>
  )
}

export default Images;