import axios from 'axios';
import interact from 'interactjs';
import { useContext, useEffect, useRef } from 'react';
import { WebSocketContext } from './WebSocketContext';

function UseInteractJS(imageProperties) {
  const elementRef = useRef(null);
  const lastClickedID = useRef(null);
  
  const socket = useContext(WebSocketContext);

  // Update the image properties in the database
  const handleImageUpdate = async () => {
    const response = await axios.put(`http://localhost:8080/images/${imageProperties.current.imageID}`, imageProperties.current);
    console.log(response.data)
  };

  // Handles the draggable and resizable behavior of the image
  useEffect(() => {

    const element = elementRef.current;

    const interactInstance = interact(element)
    .draggable({
      // Customize the draggable behavior here if needed
      onmove: async (event) => {
        const target = event.target;

        // Update the position data
        imageProperties.current.x += event.dx;
        imageProperties.current.y += event.dy;

        // Translate the element's position
        target.style.transform = `translate(${imageProperties.current.x}px, ${imageProperties.current.y}px) rotate(${imageProperties.current.rotation}rad)`;

        // Emit the updated image position and size to the server
        socket.emit('updateImage', imageProperties.current);
      },
      modifiers: [
        // Enable minimum and maximum constraints
        interact.modifiers.restrictRect({
          restriction: 'parent',
          endOnly: true,
        }),
      ],
      onend: handleImageUpdate,
      
    }).resizable({
      // resize from all edges and corners
      edges: { left: true, right: true, bottom: true, top: true },
  
      listeners: {
        async move (event) {
          const target = event.target;

          // update the element's style
          imageProperties.current.width = target.style.width = event.rect.width;
          imageProperties.current.height = target.style.height = event.rect.height;
  
          // translate when resizing from top or left edges
          imageProperties.current.x += event.deltaRect.left;
          imageProperties.current.y += event.deltaRect.top;
  
          target.style.transform = `translate(${imageProperties.current.x}px, ${imageProperties.current.y}px) rotate(${imageProperties.current.rotation}rad)`;

          // Emit the updated image position and size to the server
          socket.emit('updateImage', imageProperties.current);
        }
      },
      modifiers: [
        // keep the edges inside the parent
        interact.modifiers.restrictEdges({
          outer: 'parent'
        }),
  
        // minimum size
        interact.modifiers.restrictSize({
          min: { width: 50, height: 50 }
        })
      ],
      onend: handleImageUpdate,

    }).on('mousedown', (event) => {
      lastClickedID.current = imageProperties.current.imageID;
      console.log(`Last clicked image ID: ${lastClickedID.current}`);
    });

    // Listen for arrow key presses to change the image's z-index
    document.addEventListener('keydown', async (event) => {
      const changeZIndex = () => {
        socket.emit('updateImage', imageProperties.current);
        handleImageUpdate();
      };

      const removeImage = async () => {
        await axios.delete(`http://localhost:8080/images/${lastClickedID.current}`);
        socket.emit('deleteImage', lastClickedID.current);
      };
      
      if(event.key === 'Backspace' && lastClickedID.current) {
        event.preventDefault(); // Prevent the browser from going back to the previous page
        setTimeout(removeImage, 250);
      }
      else if (event.key === 'ArrowUp') {
        event.preventDefault(); // Prevent the browser from scrolling up
        imageProperties.current.zIndex += 1;
        setTimeout(changeZIndex, 100);
      }
      else if (event.key === 'ArrowDown') {
        event.preventDefault(); // Prevent the browser from scrolling down
        imageProperties.current.zIndex -= (imageProperties.current.zIndex === 2 ? 0 : 1);
        setTimeout(changeZIndex, 100);
      }
    });

    // Listen for updates from the server for all images
    socket.on('updatedImage', (data) => {
      // Update the image position, size, and rotation based on the received data
      const target = elementRef.current;
      if (data.imageID === imageProperties.current.imageID) {
        target.style.transform = `translate(${data.x}px, ${data.y}px) rotate(${data.rotation}rad)`;
        target.style.width = data.width + 'px';
        target.style.height = data.height + 'px';
        target.style.zIndex = data.zIndex;
        target.style.opacity = data.opacity;

        // Update the image data
        imageProperties.current.x = data.x;
        imageProperties.current.y = data.y;
        imageProperties.current.rotation = data.rotation;
        imageProperties.current.width = data.width;
        imageProperties.current.height = data.height;
        imageProperties.current.zIndex = data.zIndex;
        imageProperties.current.opacity = data.opacity;
      }
    });

    // Clean up the interact instance and event listener when the component unmounts
    return () => {
      interactInstance.unset();
      document.removeEventListener('keydown', () => {});
    };
  }, [socket]);



  return elementRef;
};

export default UseInteractJS;