import axios from 'axios';
import interact from 'interactjs';
import { useContext, useEffect, useRef } from 'react';
import { WebSocketContext } from './WebSocketContext';

function UseInteractJS(id) {
  const elementRef = useRef(null);
  const imageID = useRef(id);
  const lastClickedID = useRef(null);

  const socket = useContext(WebSocketContext);

  // Handles the draggable and resizable behavior of the image
  useEffect(() => {

    const element = elementRef.current;

    const interactInstance = interact(element)
    .draggable({
      // Customize the draggable behavior here if needed
      onmove: async (event) => {
        const target = event.target;
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        const rotation = parseFloat(target.getAttribute('data-angle')) || 0;

        // Translate the element's position
        target.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}rad)`;

        // Store the updated position data for the next move event
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
        
        // Emit the updated image position and size to the server
        socket.emit('updateImage', {
          key: imageID.current,
          x,
          y,
          width: target.style.width,
          height: target.style.height,
          rotation: parseFloat(target.getAttribute('data-angle')) || 0,
          zIndex: target.style.zIndex,
        });
      },
      modifiers: [
        // Enable minimum and maximum constraints
        interact.modifiers.restrictRect({
          restriction: 'parent',
          endOnly: true,
        }),
      ],
    }).resizable({
      // resize from all edges and corners
      edges: { left: true, right: true, bottom: true, top: true },
  
      listeners: {
        async move (event) {
          const target = event.target;
          var x = (parseFloat(target.getAttribute('data-x')) || 0);
          var y = (parseFloat(target.getAttribute('data-y')) || 0);
  
          // update the element's style
          target.style.width = event.rect.width + 'px';
          target.style.height = event.rect.height + 'px';
  
          // translate when resizing from top or left edges
          x += event.deltaRect.left;
          y += event.deltaRect.top;

          const rotation = parseFloat(target.getAttribute('data-angle')) || 0;
  
          target.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}rad)`;
  
          target.setAttribute('data-x', x);
          target.setAttribute('data-y', y);

          // Emit the updated image position and size to the server
          socket.emit('updateImage', {
            key: imageID.current,
            x,
            y,
            width: target.style.width,
            height: target.style.height,
            rotation: parseFloat(target.getAttribute('data-angle')) || 0,
            zIndex: target.style.zIndex,
          });
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

    }).on('mousedown', (event) => {
      lastClickedID.current = imageID.current;
      // console.log(`Last clicked image ID: ${lastClickedID.current}`);
    });

    // Listen for arrow key presses to change the image's z-index
    document.addEventListener('keydown', async (event) => {
      const target = event.target;
      const zIndex = target.style.zIndex;

      const changeZIndex = (newZIndex) => {
        socket.emit('updateImage', {
          key: imageID.current,
          x: target.getAttribute('data-x'),
          y: target.getAttribute('data-y'),
          width: target.style.width,
          height: target.style.height,
          zIndex: newZIndex,
        });
      };

      // event.preventDefault(); prevents the page from scrolling up/down when the arrow keys are pressed
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        changeZIndex(parseInt(zIndex) + 1);
      }
      else if (event.key === 'ArrowDown') {
        event.preventDefault();
        changeZIndex(parseInt(zIndex) - 1);
      }
    });

    // Delete the image when the backspace key is pressed
    document.addEventListener('keydown', async (event) => {
      const removeImage = async () => {
        await axios.delete(`http://localhost:8080/images/${lastClickedID.current}`);
      };
      if(event.key === 'Backspace' && lastClickedID) {
        setTimeout(removeImage, 250);
      }
    });


    // Listen for updates from the server for all images
    socket.on('updatedImage', (data) => {
      // Update the image position, size, and rotation based on the received data
      const target = elementRef.current;
      if (data.key === imageID.current) {
        target.style.transform = `translate(${data.x}px, ${data.y}px) rotate(${data.rotation}rad)`;
        target.style.width = data.width;
        target.style.height = data.height;
        target.style.zIndex = data.zIndex;
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