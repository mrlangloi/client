import React, { useEffect, useRef } from "react";
import UseInteractJS from "./functions/UseInteractJS";
import UseRotate from "./functions/UseRotate";

/**
 * I cannot use useState to store the image properties because with the
 * behavior of the useState set functions, the browser will trigger a 
 * re-render every time the image properties are updated. This will cause
 * the dragging to stop when the image is being dragged.
 */

function Images(props) {

  const { imageID, imageData, x, y, width, height, rotation, zIndex, scaleX, scaleY, opacity } = props;

  // Store the image properties in a ref
  const imageProperties = useRef({
    imageID: imageID,
    x: x,
    y: y,
    width: width,
    height: height,
    rotation: rotation,
    zIndex: zIndex,
    scaleX: scaleX,
    scaleY: scaleY,
    opacity: opacity,
  });

  // Clear the ref when component is unmounted
  useEffect(() => {
    return () => {
      imageProperties.current = null;
    }
  }, []);

  const elementRef = UseInteractJS(imageProperties);
  const rotationRef = UseRotate(imageProperties);

  return (
    <div
      className='imgDiv resize-drag resize-border'
      ref={elementRef}
      style={{
        transform: `translate(${imageProperties.current.x}px, ${imageProperties.current.y}px) rotate(${imageProperties.current.rotation}rad)`,
        width: `${imageProperties.current.width}px`,
        height: `${imageProperties.current.height}px`,
        zIndex: `${imageProperties.current.zIndex}`,
        scaleX: `${imageProperties.current.scaleX}`,
        scaleY: `${imageProperties.current.scaleY}`,
        opacity: `${imageProperties.current.opacity}`,
      }}
    >
      <img className='interactive-img' alt='' src={imageData} height='250' />
      <div className='rotation-handle' ref={rotationRef}>@</div>
    </div>
  )
}

export default Images;