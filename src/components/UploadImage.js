import axios from 'axios';
import { nanoid } from "nanoid";
import React, { useContext, useState } from "react";
import { WebSocketContext } from "./WebSocketContext";

function UploadImage() {

  const [imagePreview, setImagePreview] = useState(null);

  const socket = useContext(WebSocketContext);

  const handleUpload = async () => {
    if (!imagePreview)
      return;

    const image = {
      imageID: `image-${nanoid()}`,
      imageData: imagePreview,
      x: 0,
      y: 0,
      width: 250,
      height: 250,
      rotation: 0,
      zIndex: 2,
      opacity: 1,
    }

    try {
      await axios.post('http://localhost:8080/images', image);
      socket.emit('uploadImage', image);
    }
    catch (error) {
      console.log(`Error with uploading image: ${error}`);
    };
    
    setImagePreview(null);
  }

  const handleImageSelect = (event) => {
    // console.log(event.target.files[0]);
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