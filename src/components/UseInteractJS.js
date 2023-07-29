import interact from 'interactjs';
import { useEffect, useRef } from 'react';
import socketIOClient from 'socket.io-client';

function UseInteractJS(id) {
  const elementRef = useRef(null);
  const socketRef = useRef(null);
  const imageID = useRef(null);
  imageID.current = id;

  useEffect(() => {
    const element = elementRef.current;
    
    
    // Connect to the server
    socketRef.current = socketIOClient('ws://localhost:8080');

    const interactInstance = interact(element).draggable({
      // Customize the draggable behavior here if needed
      onmove: (event) => {
        const target = event.target;
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        // Translate the element's position
        target.style.transform = `translate(${x}px, ${y}px)`;

        // Store the updated position data for the next move event
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
        
        // Emit the updated image position and size to the server
        socketRef.current.emit('updateImage', {
          key: imageID.current,
          x,
          y,
          width: target.style.width,
          height: target.style.height,
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
        move (event) {
          var target = event.target
          var x = (parseFloat(target.getAttribute('data-x')) || 0)
          var y = (parseFloat(target.getAttribute('data-y')) || 0)
  
          // update the element's style
          target.style.width = event.rect.width + 'px'
          target.style.height = event.rect.height + 'px'
  
          // translate when resizing from top or left edges
          x += event.deltaRect.left
          y += event.deltaRect.top
  
          target.style.transform = 'translate(' + x + 'px,' + y + 'px)'
  
          target.setAttribute('data-x', x)
          target.setAttribute('data-y', y)

          // Emit the updated image position and size to the server
          socketRef.current.emit('updateImage', {
            key: imageID.current,
            x,
            y,
            width: `${target.style.width}`,
            height: `${target.style.height}`,
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

    });

    // Listen for updates from the server for all images
    socketRef.current.on('updatedImage', (data) => {
      // Update the image position and size based on the received data
      const target = elementRef.current;
      if (data.key === imageID.current) {
        target.style.transform = `translate(${data.x}px, ${data.y}px)`;
        target.style.width = data.width;
        target.style.height = data.height;
      }
    });

    // Clean up the interact instance and disconnect from server when the component unmounts
    return () => {
      interactInstance.unset();
      socketRef.current.disconnect();
    };
  }, []);

  return elementRef;
};

export default UseInteractJS;