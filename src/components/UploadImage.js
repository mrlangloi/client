import React, { useState } from "react";
import socketIOClient from 'socket.io-client';

function UploadImage() {

  const [image, setImage] = useState(null);

  const handleUpload = () => {
    if (!image)
      return;

    const socket = socketIOClient('ws://localhost:8080');
    socket.emit('uploadImage', image);
  }

  const handleImageSelect = (event) => {
    console.log(event.target.files[0]);
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setImage(reader.result);
      const socket = socketIOClient('ws://localhost:8080');
      socket.emit('previewImage', image);
    }
    
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className='uploadImageDiv'>
      <input type='file' onChange={handleImageSelect}/>
      {image && <img src={image} alt="uploaded" height="32"/>}
      <button onClick={handleUpload}>Upload</button>
    </div>
  )
}

export default UploadImage;