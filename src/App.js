import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import './App.css';
import Canvas from './components/Canvas';
import Footer from './components/Footer';
import TwitchStream from './components/TwitchStreamEmbed';
import { WebSocketContext } from './components/contexts/WebSocketContext';

function App() {

  const { socket } = useContext(WebSocketContext);

  const [images, setImages] = useState([]);

  // Mount component on first render
  useEffect(() => {

    if (socket) {
      // Listen for 'uploadedImage' event from the server, update the images state with the new image
      socket.on('uploadedImage', (data) => {
        console.log('Received a new image from the server:', data);

        setImages(prevImages => [...prevImages, data]);
      });

      // Listen for 'deletedImage' event from the server, remove the image from the images state
      socket.on('deletedImage', (data) => {
        console.log('Received a deleted image from the server: ' + data);

        setImages(prevImages => {
          if (prevImages.length === 1) {
            return [];
          }
          console.log(`Deleting image with id ${data}`);
          const newImages = prevImages.filter(image => image.imageID !== data);
          console.log(newImages);
          return newImages;
        });
      });
    }

  }, [socket]);

  // Get all images from the server on first render
  useEffect(() => {
    getImages();
  }, []);

  useEffect(() => {
    console.log(images);
  }, [images]);

  // Get all images from the server
  const getImages = async () => {
    try {
      const url = `https://${process.env.REACT_APP_BACKEND_URL}/images`;
      // const url = 'http://localhost:8080/images';
      socket.emit('uploadImage', image);
      const res = await axios.get(url);
      
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
      <Footer />
    </div>
  );
}

export default App;
