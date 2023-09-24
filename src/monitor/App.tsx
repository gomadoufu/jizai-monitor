import { message } from '@tauri-apps/api/dialog';
import { listen } from '@tauri-apps/api/event';
import { useState, useEffect } from 'react';

function App() {
  const [sensor, setSensor] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('fetching data...');
        const unlisten = await listen('monitor/sensor', (event) => {
          if (typeof event.payload !== 'string') {
            message('エラーが発生しました', { title: 'Error', type: 'error' });
            return;
          }
          console.log(event.payload);
          setSensor(event.payload);
        });

        if (sensor !== '') {
          unlisten();
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container">
      <h1>Edge: n012</h1>

      <div className="board-container">
        <div className="board-item-row">
          <div className="services service-container">
            <div className="service-item">
              <p>{sensor ? sensor : 'loading...'}</p>
            </div>
            <div className="service-item">
              <p>{sensor ? sensor : 'loading...'}</p>
            </div>
            <div className="service-item">
              <p>{sensor ? sensor : 'loading...'}</p>
            </div>
          </div>
        </div>
        <div className="board-item-row">
          <div className="sensor">
            <p>{sensor ? sensor : 'loading...'}</p>
          </div>
        </div>
        <div className="board-item-row">
          <div className="sensor">
            <p>{sensor ? sensor : 'loading...'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
