import './App.css';
import Images from './components/Images.js';
import TwitchStream from './components/TwitchStream';
import UploadImage from './components/UploadImage';
import WebSocket from './components/WebSocket';

function App() {
  return (
    <div className="App">
      <UploadImage />
      <div className="canvasDiv">
        <Images />
        <TwitchStream />
      </div>
      <WebSocket />
    </div>
  );
}

export default App;
