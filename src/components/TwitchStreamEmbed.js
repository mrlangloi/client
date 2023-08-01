import React from "react";
import ReactTwitchEmbedVideo from "react-twitch-embed-video";

function TwitchStreamEmbed() {
  return (
    <div className='twitchStreamDiv'>
      <ReactTwitchEmbedVideo channel="dearbun" parent={[`${process.env.DOMAIN_NAME}`]} muted={true} layout="video" width="1920" height="1080" />
    </div>
  )
}

export default TwitchStreamEmbed;