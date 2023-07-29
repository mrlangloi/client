import { nanoid } from "nanoid";
import React, { useState } from "react";
import socketIOClient from 'socket.io-client';

function UploadImage() {

  const [imagePreview, setImagePreview] = useState(null);

  const handleUpload = () => {
    if (!imagePreview)
      return;

    const socket = socketIOClient('ws://localhost:8080');
    // socket.emit('uploadImage', image);
    socket.emit('uploadImage', {
      key: `image-${nanoid()}`,
      imageData: imagePreview,
      x: 0,
      y: 0,
      width: 128,
      height: 128,
      rotation: 0,
      opacity: 1,
    });
    setImagePreview(null);
  }

  const handleImageSelect = (event) => {
    console.log(event.target.files[0]);
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setImagePreview(reader.result);
    }
    
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className='uploadImageDiv'>
      <input className="bttn" type='file' onChange={handleImageSelect} />
      <div height='128'>
        {imagePreview && <img src={imagePreview} alt='uploaded' height='128' />}
      </div>
      <input className="bttn" type='button' onClick={handleUpload} value='Upload' />
    </div>
  )
}

export default UploadImage;