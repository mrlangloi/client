import React from "react";

function TwitchStream() {
  return (
    <div className='twitchStreamDiv'>
        <iframe className='twitchStream' src="https://player.twitch.tv/?channel=dearbun&parent=localhost:3000" allowFullScreen={false} width="1920" height="1080"></iframe>
    </div>
  )
}

export default TwitchStream;