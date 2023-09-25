import { useState, useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { appWindow } from '@tauri-apps/api/window';
import { ServicesStatus, SensorStatus, RecordStatus, isMonitor } from '../types';
import { message } from '@tauri-apps/api/dialog';

export function useMonitorData() {
  const [thing, setThingName] = useState<string>('');
  const [sub_topic, setSubTopic] = useState<string>('');
  const [pub_topic, setPubTopic] = useState<string>('');
  const [services, setServices] = useState<ServicesStatus | null>(null);
  const [sensor, setSensor] = useState<SensorStatus | null>(null);
  const [record, setRecord] = useState<RecordStatus | null>(null);

  useEffect(() => {
    const listenQuit = async () => {
      await listen('quit', () => {
        appWindow.close();
      });
    };

    const fetchData = async () => {
      try {
        const FailUnlisten = await listen('fail', () => {
          FailUnlisten();
          setThingName('データの取得に失敗しました');
          setSubTopic('Failed to get data');
          setPubTopic('Failed to get data');
          setServices(null);
          setSensor(null);
          setRecord(null);
        });

        const monitorUnlisten = await listen('monitor', (event) => {
          if (!isMonitor(event.payload)) {
            message('invalid data', { title: 'Error', type: 'error' });
            return;
          }

          monitorUnlisten();
          setThingName(event.payload.thing);
          setSubTopic(event.payload.sub_topic);
          setPubTopic(event.payload.pub_topic);
          setServices(event.payload.services);
          setSensor(event.payload.sensors);
          setRecord(event.payload.record);
        });
      } catch (err) {
        console.error(err);
        message('エラーが発生しました。\n データの表示に失敗😔', { title: 'Error', type: 'error' });
      }
    };

    listenQuit();
    fetchData();
  }, []);

  return { thing, sub_topic, pub_topic, services, sensor, record };
}
