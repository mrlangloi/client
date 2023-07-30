import React from "react";
import Images from "./Images";

function Canvas(props) {

  const images = props.images;

  const imagesList = images.map((image, index) => {
    return (
      <Images
        key={index}
        id={image.key}
        image={image.imageData}
        index={index}
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