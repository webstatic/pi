import React from 'react';
import { render } from 'react-dom';
import Map from './Map';

class App extends React.Component {
  state = { markerPosition: { lat: 7.86824670, lng: 98.39706840 } };
  moveMarker = () => {
    const { lat, lng } = this.state.markerPosition;
    this.setState({
      markerPosition: {
        lat: lat + 0.0001,
        lng: lng + 0.0001, 
      }
    });
  };
  render() {
    const { markerPosition } = this.state;
    return (
      <div>
        <Map markerPosition={markerPosition} />
        <div>Current markerPosition: lat: {markerPosition.lat}, lng: {markerPosition.lng}</div>
        <button
          onClick={this.moveMarker}
        >
          Move marker
        </button>
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));
