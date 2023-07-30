import axios from 'axios';
import interact from 'interactjs';
import { useContext, useEffect, useRef } from 'react';
import { WebSocketContext } from './WebSocketContext';

function UseInteractJS(id) {
  const elementRef = useRef(null);
  const imageID = useRef(id);
  const lastClickedID = useRef(null);
  const rotation = useRef(0);

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

        // Translate the element's position
        target.style.transform = `translate(${x}px, ${y}px)`;

        // Store the updated position data for the next move event
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
        
        // Emit the updated image position and size to the server
        socket.emit('updateImage', {
          key: imageID.current,
          x,
          y,
          width: `${target.style.width}`,
          height: `${target.style.height}`,
          rotation: rotation.current
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
  
          target.style.transform = `translate(${x}px, ${y}px)`;
  
          target.setAttribute('data-x', x);
          target.setAttribute('data-y', y);

          // Emit the updated image position and size to the server
          socket.emit('updateImage', {
            key: imageID.current,
            x,
            y,
            width: `${target.style.width}`,
            height: `${target.style.height}`,
            rotation: rotation.current
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
      console.log(`Last clicked image ID: ${lastClickedID.current}`);
    });

    const rotateInstance = interact('.rotation-handle')
    .draggable({
      onstart: function (event) {
        const box = event.target.parentElement;
        const rect = box.getBoundingClientRect();

        // store the center as the element has css `transform-origin: center center`
        box.setAttribute('data-center-x', rect.left + rect.width / 2);
        box.setAttribute('data-center-y', rect.top + rect.height / 2);
        // get the angle of the element when the drag starts
        box.setAttribute('data-angle', getDragAngle(event));
      },
      onmove: function (event) {
        const box = event.target.parentElement;

        rotation.current = getDragAngle(event);

        // update transform style on dragmove
        box.style.transform = `translate(${box.x}px, ${box.y}px) rotate(${rotation.current}rad)`;

        console.log(rotation.current);
        socket.emit('updateImage', {
          key: imageID.current,
          x: box.getAttribute('data-x'),
          y: box.getAttribute('data-y'),
          width: box.style.width,
          height: box.style.height,
          rotation: rotation.current,
        });
      },
      onend: function (event) {
        const box = event.target.parentElement;

        // save the angle on dragend
        box.setAttribute('data-angle', getDragAngle(event));
      },
    })

    function getDragAngle(event) {
      const box = event.target.parentElement;
      const startAngle = parseFloat(box.getAttribute('data-angle')) || 0;
      const center = {
        x: parseFloat(box.getAttribute('data-center-x')) || 0,
        y: parseFloat(box.getAttribute('data-center-y')) || 0
      };
      const angle = Math.atan2(center.y - event.clientY,
        center.x - event.clientX);

      return angle - startAngle;
    };


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
      // Update the image position and size based on the received data
      const target = elementRef.current;
      if (data.key === imageID.current) {
        target.style.transform = `translate(${data.x}px, ${data.y}px) rotate(${data.rotation}rad)`;
        target.style.width = data.width;
        target.style.height = data.height;
      }
    });

    // socket.on('rotatedImage', (data) => {
    //   // Update the image position and size based on the received data
    //   console.log(data);
    //   const box = elementRef.current;
    //   console.log(data.key === imageID.current);
    //   if (data.key === imageID.current) {
    //     box.style.transform = `translate(${box.x}px, ${box.y}px) rotate(${data.rotation}rad)`;
    //   }
    // });

    // Clean up the interact instance and event listener when the component unmounts
    return () => {
      interactInstance.unset();
      rotateInstance.unset();
      document.removeEventListener('keydown', () => {});
    };
  }, []);



  return elementRef;
};

export default UseInteractJS;