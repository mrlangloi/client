import React from "react";
import Images from "./Images";

function Canvas(props) {

  const images = props.images;

  const imagesList = images.map((image, index) => {
    return (
      <Images
        key={index}
        imageID={image.imageID}
        imageData={image.imageData}
        x={image.x}
        y={image.y}
        width={image.width}
        height={image.height}
        rotation={image.rotation}
        zIndex={image.zIndex}
        opacity={image.opacity}
      />
    )
  });

  return (
    <div className='canvasDiv'>
      {imagesList ? imagesList : null}
    </div>
  );
};

export default Canvas;