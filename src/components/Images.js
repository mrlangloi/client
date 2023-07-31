import React, { useRef } from "react";
import UseInteractJS from "./UseInteractJS";
// import UseRotate from "./UseRotate";

function Images(props) {

  const { imageData, x, y, width, height, rotation, zIndex, opacity }  = props;

  const imageProperties = useRef({
    imageID: props.imageID,
    x: x,
    y: y,
    width: width,
    height: height,
    rotation: rotation,
    zIndex: zIndex,
    opacity: opacity,
  });

  const elementRef = UseInteractJS(imageProperties);
  // const rotationRef = UseRotate(imageProperties);

  return (
    <div 
      className='imgDiv resize-drag resize-border' 
      ref={elementRef}
      style={{
        transform: `translate(${imageProperties.current.x}px, ${imageProperties.current.y}px) rotate(${imageProperties.current.rotation}rad)`,
        width: `${imageProperties.current.width}px`,
        height: `${imageProperties.current.height}px`,
        zIndex: `${imageProperties.current.zIndex}`,
        opacity: `${imageProperties.current.opacity}`,
      }}      
    >
      <img className='interactive-img' alt='' src={imageData} height='250' />
      {/* <div className='rotation-handle' ref={rotationRef}>A</div> */}
    </div>
  )
}

export default Images;