import { save } from '@tauri-apps/api/dialog';
import { appWindow } from '@tauri-apps/api/window';
import { writeTextFile } from '@tauri-apps/api/fs';
import Service from '../components/Service';
import Sensor from '../components/Sensor';
import Record from '../components/Record';
import { useMonitorData } from './hooks/useMonitorData';

function App() {
  const { thing, sub_topic, pub_topic, services, sensor, record } = useMonitorData();
  appWindow.setTitle('Monitor');

  async function handleClick() {
    const filePath = await save({
      defaultPath: 'monitor-' + thing + '.json',
      filters: [
        {
          name: 'JSON',
          extensions: ['json'],
        },
      ],
    });
    if (filePath) {
      const exportData = { thing: thing, services: services, sensor: sensor, record: record };
      writeTextFile(filePath, JSON.stringify(exportData, null, 2));
    }
  }

  return (
    <div className="container">
      <h1>🤖Edge : {thing}</h1>
      <h3>🕑 {new Date().toString()} に取得</h3>
      <p>pub: {pub_topic} ⇢</p>
      <p>⇢ sub: {sub_topic}</p>
      <button type="button" onClick={handleClick}>
        💾 JSON形式で保存
      </button>

      <div className="board-container">
        {services?.map((service) => (
          <div className="board-item-row">
            <Service key={'monitor'} service={service} />
          </div>
        ))}
        <div className="board-item-row">
          <Sensor key={'sensor'} sensor={sensor} />
        </div>
        <div className="board-item-row">
          <Record key={'record'} record={record} />
        </div>
      </div>
    </div>
  );
}

export default App;
