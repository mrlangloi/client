import axios from 'axios';
import interact from 'interactjs';
import { useContext, useEffect, useRef } from 'react';
import { WebSocketContext } from '../contexts/WebSocketContext';

function UseInteractJS(imageProperties) {
  const elementRef = useRef(null);

  const { socket, lastClickedID, setLastClickedID } = useContext(WebSocketContext);

  // Update the image properties in the database
  const handleImageUpdate = async () => {
    await axios.put(`http://localhost:8080/images/${imageProperties.current.imageID}`, imageProperties.current);
  };

  // Handles the draggable and resizable behavior of the image
  useEffect(() => {

    const element = elementRef.current;

    const interactInstance = interact(element)
      .draggable({
        // Customize the draggable behavior here if needed
        onstart: (event) => {
          // Set the last clicked image ID to this image's ID
          setLastClickedID(imageProperties.current.imageID);
        },
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
          async move(event) {
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

      });

    // Prevent the default right-click menu from appearing when right-clicking on the image
    element.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });

    element.addEventListener('mouseup', (event) => {
      event.preventDefault(); 

      if (event.currentTarget === element) {

        

        if (event.button === 0) { // left click
          // Placeholder if I ever want to add a left-click interactive
        }
        else if (event.button === 1) { // middle click
          // Placeholder if I ever want to add a middle-click interactive
        }
        else if (event.button === 2) { // right click
          const removeImage = async (id) => {
            await axios.delete(`http://localhost:8080/images/${lastClickedID}`);
            socket.emit('deleteImage', lastClickedID);
          };
          console.log(`Removing image with ID ${lastClickedID}`);
          setTimeout(removeImage, 250);
        }
      }
    })

    // // Listen for arrow key presses to change the image's z-index
    element.addEventListener('keydown', (event) => {
      event.stopPropagation();

      const changeZIndex = () => {
        socket.emit('updateImage', imageProperties.current);
        handleImageUpdate();
      };

      if (event.key === '=' && lastClickedID == imageProperties.current.imageID) {
        event.preventDefault();
        imageProperties.current.zIndex += 1;
        setTimeout(changeZIndex, 100);
        console.log('Current z-index: ' + imageProperties.current.zIndex);
      }
      else if (event.key === '-' && lastClickedID == imageProperties.current.imageID) {
        event.preventDefault();
        imageProperties.current.zIndex -= (imageProperties.current.zIndex === 2 ? 0 : 1);
        setTimeout(changeZIndex, 100);
        console.log('Current z-index: ' + imageProperties.current.zIndex);
      }
    });

    // Listen for updates from the server for all images
    socket.on('updatedImage', (data) => {
      // Update the image properties if the image ID matches
      const target = elementRef.current;
      if (data.imageID === imageProperties.current.imageID) {
        target.style.transform = `translate(${data.x}px, ${data.y}px) rotate(${data.rotation}rad)`;
        target.style.width = data.width + 'px';
        target.style.height = data.height + 'px';
        target.style.zIndex = data.zIndex;
        target.style.scaleX = data.scaleX;
        target.style.scaleY = data.scaleY;
        target.style.opacity = data.opacity;

        // Update the image data
        imageProperties.current = {
          imageID: data.imageID,
          x: data.x,
          y: data.y,
          width: data.width,
          height: data.height,
          rotation: data.rotation,
          zIndex: data.zIndex,
          scaleX: data.scaleX,
          scaleY: data.scaleY,
          opacity: data.opacity,
        }
      }
    });



    // Clean up the interact instance and event listener when the component unmounts
    return () => {
      interactInstance.unset();
      element.removeEventListener('contextmenu', () => { });
      element.removeEventListener('click', () => { });
      element.removeEventListener('keydown', () => { });
    };
  }, []);

  useEffect(() => {
    console.log(`Last selected image ID: ${lastClickedID}`);
  }, [lastClickedID]);


  return elementRef;
};

export default UseInteractJS;