import React from "react";
import UseInteractJS from "./UseInteractJS";
import UseRotation from "./UseRotation";

function Images(props) {

  const { image, id }  = props;

  const elementRef = UseInteractJS(id);
  const rotateRef = UseRotation(id);

  return (
    <div className='imgDiv resize-drag resize-border' ref={elementRef}>
      <img className='interactive-img' alt='' src={image} height='250' />
      <div className='rotation-handle' ref={rotateRef}>A</div>
    </div>
  )
}

export default Images;