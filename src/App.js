import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import './App.css';
import Canvas from './components/Canvas';
import TwitchStream from './components/TwitchStream';
import UploadImage from './components/UploadImage';
import { WebSocketContext } from './components/WebSocketContext';

function App() {

  const socket = useContext(WebSocketContext);

  const [images, setImages] = useState([]);

  // Mount component on first render
  useEffect(() => {

    if (socket) {
      // Listen for 'newImage' event from the server, update the images state with the new image
      socket.on('newImage', (data) => {
        console.log('Received a new image from the server:', data);

        setImages(prevImages => [...prevImages, data]);
      });

      // Listen for 'deletedImage' event from the server, remove the image from the images state
      socket.on('deletedImage', (data) => {
        console.log('Received a deleted image from the server:', data);

        setImages(prevImages => {
          if (prevImages.length === 1) {
            return [];
          }
          console.log(`Deleting image with id ${data}`);
          const newImages = prevImages.filter(image => image._id !== data);
          console.log(`New images: ${newImages}`);
          return newImages;
        });
      });

      getImages();
    }

  }, [socket]);

  // Get all images from the server
  const getImages = async () => {
    try {
      const url = 'http://localhost:8080/images';
      const res = await axios.get(url);

      console.log(res.data);
      setImages(res.data);
    }
    catch (err) {
      console.log(err.message);
    }
  }

  return (
    <div className='App'>
      <div className='container'>
        <Canvas images={images} setImages={setImages} />
        <TwitchStream />
      </div>
      <UploadImage />
    </div>
  );
}

export default App;
