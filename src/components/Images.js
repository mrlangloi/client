import React from "react";
import UseInteractJS from "./UseInteractJS";
import UseRotate from "./UseRotate";

function Images(props) {

  const { image, id }  = props;

  const elementRef = UseInteractJS(id);
  const rotationRef = UseRotate(id);

  return (
    <div 
      className='imgDiv resize-drag resize-border' 
      ref={elementRef}
      style={{
        transform: 'translate(0px, 0px) rotate(0rad)',
        width: '250px',
        height: '250px',
        opacity: '1',
      }}      
    >
      <img className='interactive-img' alt='' src={image} height='250' />
      <div className='rotation-handle' ref={rotationRef}>A</div>
    </div>
  )
}

export default Images;