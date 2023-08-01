import React from "react";

function TwitchStream() {
  return (
    <div className='twitchStreamDiv'>
          <iframe className='twitchStream' src={`"https://player.twitch.tv/?channel=dearbun&parent=${process.env.DOMAIN_NAME}"`} allowFullScreen={false} width="1920" height="1080"></iframe>
    </div>
  )
}

export default TwitchStream;