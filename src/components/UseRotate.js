import interact from 'interactjs';
import { useContext, useEffect, useRef } from 'react';
import { WebSocketContext } from './WebSocketContext';

function UseRotate(id) {
  const rotationRef = useRef(null);
  const imageID = useRef(id);
  
  const socket = useContext(WebSocketContext);

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
      }).on('doubletap', (event) => {
        const box = event.target.parentElement;

        box.setAttribute('data-angle', 0);

        socket.emit('updateImage', {
          key: imageID.current,
          x: box.getAttribute('data-x'),
          y: box.getAttribute('data-y'),
          width: box.style.width,
          height: box.style.height,
          rotation: 0,
        });

      });


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

    return () => {
      rotateInstance.unset();
    };
  }, []);

  return rotationRef;
}

export default UseRotate;