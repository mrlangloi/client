import interact from "interactjs";
import React from "react";

function Images() {

  const position = { x: 0, y: 0 };

  interact('.resize-drag')
  .resizable({
    // resize from all edges and corners
    edges: { left: true, right: true, bottom: true, top: true },

    listeners: {
      move (event) {
        const target = event.target
        // var x = (parseFloat(target.getAttribute('data-x')) || 0)
        // var y = (parseFloat(target.getAttribute('data-y')) || 0)

        // update the element's style
        target.style.width = event.rect.width + 'px'
        target.style.height = event.rect.height + 'px'

        // translate when resizing from top or left edges
        position.x += event.deltaRect.left
        position.y += event.deltaRect.top

        target.style.transform = 'translate(' + position.x + 'px,' + position.y + 'px)'

        target.setAttribute('data-x', position.x)
        target.setAttribute('data-y', position.y)
        target.textContent = Math.round(event.rect.width) + '\u00D7' + Math.round(event.rect.height)
      }
    },
    modifiers: [
      // keep the edges inside the parent
      interact.modifiers.restrictEdges({
        outer: 'parent'
      }),

      // minimum size
      interact.modifiers.restrictSize({
        min: { width: 100, height: 50 }
      })
    ],
  })
  .draggable({
    listeners: { 
      start (event) {
        console.log(event.type, event.target)
      },
      move (event) {
        position.x += event.dx
        position.y += event.dy
  
        event.target.style.transform =
          `translate(${position.x}px, ${position.y}px)`
      },
    },
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: 'parent',
        endOnly: true
      })
    ]
  })

  return (
    <div className='imageDiv'>
      <img src='https://purepng.com/public/uploads/large/chocolate-ice-cream-cone-lwb.png' className='resize-drag resize-border' alt='basketball'  width='400' height='400'></img>
    </div>
  )
}

export default Images;