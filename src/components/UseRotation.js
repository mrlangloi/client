import interact from "interactjs";
import { useEffect, useRef } from "react";
import socketIOClient from 'socket.io-client';

function UseRotation(id) {

  const rotateRef = useRef(null);
  const socketRef = useRef(null);
  const imageID = useRef(null);
  imageID.current = id;

  useEffect(() => {
    const rotateElement = rotateRef.current;

    socketRef.current = socketIOClient('ws://localhost:8080');

    const rotateInstance = interact(rotateElement)
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

          const x = (parseFloat(box.getAttribute('data-x')) || 0)
          const y = (parseFloat(box.getAttribute('data-y')) || 0)

          const angle = getDragAngle(event);

          // update transform style on dragmove
          box.style.transform = `translate(${x}px, ${y}px) rotate(${angle}rad)`;

          console.log(angle);
          socketRef.current.emit('updateImage', {
            key: imageID.current,
            x,
            y,
            rotation: angle,
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

    // Listen for updates from the server for all images
    socketRef.current.on('updatedImage', (data) => {
      // Update the image position and size based on the received data
      const box = rotateRef.current.parentElement;
      if (data.key === imageID.current) {
        box.style.transform = `rotate(${data.rotation}rad)`;
      }
    });

    return () => {
      rotateInstance.unset();
      socketRef.current.disconnect();
    }
  }, []);

  return rotateRef
}

export default UseRotation;