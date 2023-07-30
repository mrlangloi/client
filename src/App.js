import axios from 'axios';
import React, { useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client';
import './App.css';
import Canvas from './components/Canvas';
import TwitchStream from './components/TwitchStream';
import UploadImage from './components/UploadImage';
// import WebSocket from './components/WebSocket';

function App() {

  const socket = socketIOClient('ws://localhost:8080');

  const [images, setImages] = useState([]);

  // Mount component on first render
  useEffect(() => {
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

    // Clean up the socket connection on component unmount
    return () => {
      socket.disconnect();
    }
  }, []);

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
        <Canvas images={images} setImages={setImages}/>
        <TwitchStream />
      </div>
      <UploadImage />
      
      {/* Test component */}
      {/* <WebSocket /> */}
    </div>
  );
}

export default App;
