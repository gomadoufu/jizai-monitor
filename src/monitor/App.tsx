import { save } from '@tauri-apps/api/dialog';
import { appWindow } from '@tauri-apps/api/window';
import { writeTextFile } from '@tauri-apps/api/fs';
import Service from '../components/Service';
import Sensor from '../components/Sensor';
import Record from '../components/Record';
import { useMonitorData } from './hooks/useMonitorData';
import { useEffect, useState } from 'react';
import ErrorMessage from '../components/ErrorMessage';

function App() {
  const [now, setNow] = useState(new Date());
  const { thing, sub_topic, pub_topic, raw, services, sensor, record } = useMonitorData(
    appWindow.label
  );
  appWindow.setTitle('Monitor');

  useEffect(() => {
    setNow(new Date());
  }, []);

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
      const exportData = {
        timestamp: now,
        thing: thing,
        services: services,
        sensor: sensor,
        record: record,
      };
      writeTextFile(filePath, JSON.stringify(exportData, null, 2));
    }
  }

  function getFormattedDate(date: Date): string {
    return `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  }

  return (
    <div className="container">
      <h1>🤖 {thing}</h1>
      <h3>{raw ? `🕑  ${getFormattedDate(now)} に取得` : ''}</h3>
      <p>pub: {pub_topic} ⇢</p>
      <p>⇢ sub: {sub_topic}</p>
      {raw === 'parsed' ? (
        <>
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
        </>
      ) : (
        <>
          <div className="board-container">
            <div className="board-item-row">
              <strong>{raw === 'MQTT通信に失敗しました' ? <ErrorMessage /> : raw}</strong>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
