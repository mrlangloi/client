import { nanoid } from "nanoid";
import React, { useState } from "react";
// import socketIOClient from 'socket.io-client';
import axios from 'axios';

function UploadImage() {

  const [imagePreview, setImagePreview] = useState(null);

  const handleUpload = async () => {
    if (!imagePreview)
      return;

    const image = {
      key: `image-${nanoid()}`,
      imageData: imagePreview,
      x: 0,
      y: 0,
      width: 128,
      height: 128,
      rotation: 0,
      opacity: 1,
    }

    try {
      await axios.post('http://localhost:8080/images', image);
    }
    catch (error) {
      console.log(`Error with uploading image: ${error}`);
    };
    
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