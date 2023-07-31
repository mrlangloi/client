import axios from 'axios';
import interact from 'interactjs';
import { useContext, useEffect, useRef } from 'react';
import { WebSocketContext } from './WebSocketContext';

function UseRotate(imageProperties) {
  const rotationRef = useRef(null);

  const { socket } = useContext(WebSocketContext);

  // Update the image properties in the database
  const handleImageUpdate = async () => {
    await axios.put(`http://localhost:8080/images/${imageProperties.current.imageID}`, imageProperties.current);
  };

  useEffect(() => {
    const rotation = rotationRef.current;

    const rotateInstance = interact(rotation)
      .draggable({
        onstart: function (event) {
          const box = event.target.parentElement;
          const rect = box.getBoundingClientRect();

          // store the center as the element has css `transform-origin: center center`
          box.setAttribute('data-center-x', rect.left + rect.width / 2);
          box.setAttribute('data-center-y', rect.top + rect.height / 2);
        },
        onmove: function (event) {
          const box = event.target.parentElement;

          imageProperties.current.rotation = getDragAngle(event);

          // Update transform style on dragmove
          box.style.transform = `translate(${box.x}px, ${box.y}px) rotate(${imageProperties.current.rotation}rad)`;

          socket.emit('updateImage', imageProperties.current);
        },
        onend: handleImageUpdate,

      }).on('doubletap', (event) => {
        // When double-clicked on, reset the rotation to 0
        event.preventDefault();
        imageProperties.current.rotation = 0;
        // Emit the updated image position, size, and rotation to the server
        socket.emit('updateImage', imageProperties.current);
      });

    function getDragAngle(event) {
      const box = event.target.parentElement;
      const startAngle = 3 * Math.PI / 2;  // NOTE: more info at the bottom of this component
      
      const center = {
        x: parseFloat(box.getAttribute('data-center-x')) || 0,
        y: parseFloat(box.getAttribute('data-center-y')) || 0
      };
      const angle = Math.atan2(center.y - event.clientY, center.x - event.clientX);

      return angle - startAngle;
    };

    return () => {
      rotateInstance.unset();
    };
  }, []);

  return rotationRef;
}

export default UseRotate;

/**
 * Because the rotation handle div is at the 270 degree position of a circle,
 * the rotation angle needs to be offset by 270 degrees (4.71238898038469 radians)
 * otherwise the image will snap to a weird angle upon initial rotation.
 */