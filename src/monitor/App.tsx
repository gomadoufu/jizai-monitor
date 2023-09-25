import { message, save } from '@tauri-apps/api/dialog';
import { listen } from '@tauri-apps/api/event';
import { useState, useEffect } from 'react';
import { Monitor, RecordStatus, SensorStatus, ServicesStatus, isMonitor } from './types';
import { appWindow } from '@tauri-apps/api/window';
import { writeTextFile } from '@tauri-apps/api/fs';

function App() {
  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [thing, setThingName] = useState<string>('');
  const [sub_topic, setSubTopic] = useState<string>('');
  const [pub_topic, setPubTopic] = useState<string>('');
  const [services, setServices] = useState<ServicesStatus | null>(null);
  const [sensor, setSensor] = useState<SensorStatus | null>(null);
  const [record, setRecord] = useState<RecordStatus | null>(null);
  appWindow.setTitle('Monitor');

  useEffect(() => {
    const listenQuit = async () => {
      await listen('quit', () => {
        appWindow.close();
      });
    };
    const fetchData = async () => {
      try {
        const unlisten = await listen('monitor', (event) => {
          if (!isMonitor(event.payload)) {
            message('invalid data', { title: 'Error', type: 'error' });
            return;
          }

          unlisten();
          setMonitor(event.payload);
          setThingName(event.payload.thing);
          setSubTopic(event.payload.sub_topic);
          setPubTopic(event.payload.pub_topic);
          setServices(event.payload.services);
          setSensor(event.payload.sensors);
          setRecord(event.payload.record);
        });
      } catch (err) {
        console.error(err);
        message('エラーが発生しました。\n データの表示に失敗', { title: 'Error', type: 'error' });
      }
    };

    listenQuit();
    fetchData();
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
      const exportData = { thing: thing, services: services, sensor: sensor, record: record };
      writeTextFile(filePath, JSON.stringify(exportData, null, 2));
    }
  }

  return (
    <div className="container">
      <h1>Edge: {thing}</h1>
      <h3>{new Date().toString()}に取得</h3>
      <p>published: {pub_topic}</p>
      <p>subscribed: {sub_topic}</p>

      <div className="board-container">
        <button type="button" onClick={handleClick}>
          JSON形式で保存
        </button>
        <div className="board-item-row">
          <h2>サービスステータス</h2>
          <div className="services service-container">
            <div className="service-item">
              {services?.map((service) => (
                <div className="service">
                  <h3>{service.name}</h3>
                  <strong>アクティブ: {service.active ? 'Active' : 'Dead'}</strong>
                  <p>プロセス番号: {service.pid}</p>
                  <p>このサービスがコントロールするプロセス:</p>
                  <p>
                    {service.cgroup?.map((process) => (
                      <p>{process}</p>
                    ))}
                  </p>
                  <hr />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="board-item-row">
          <div className="sensor">
            <h2>温度ステータス</h2>
            <p>CPUセンサ {sensor?.['coretemp-isa-0000'].Adapter}</p>
            <p>温度 {sensor?.['coretemp-isa-0000']['Package id 0']['temp1_input']}°C</p>
            <hr />
            <p>マザーボード上センサ {sensor?.['acpitz-acpi-0'].Adapter}</p>
            <p>温度 {sensor?.['acpitz-acpi-0'].temp1['temp1_input']}°C</p>
            <hr />
            <p>ネットワークカード上センサ {sensor?.['iwlwifi_1-virtual-0'].Adapter}</p>
            <p>温度 {sensor?.['iwlwifi_1-virtual-0'].temp1['temp1_input']}°C</p>
          </div>
        </div>
        <div className="board-item-row">
          <div className="record">
            <h2>録画ステータス</h2>
            <p>最後に録画したファイル</p>
            <p>
              {record?.record}:{record?.length}
            </p>
            <hr />
            <p>最後に録画した時刻</p>
            <p>{record?.time}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
