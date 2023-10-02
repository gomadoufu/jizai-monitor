import { useState, useEffect } from 'react';
import { listen, once } from '@tauri-apps/api/event';
import { appWindow } from '@tauri-apps/api/window';
import { ServicesStatus, SensorStatus, RecordStatus, isMonitor } from '../types';
import { message } from '@tauri-apps/api/dialog';
import { invoke } from '@tauri-apps/api';

export function useMonitorData(uuid: string) {
  const [thing, setThingName] = useState<string>('Loading...');
  const [sub_topic, setSubTopic] = useState<string>('Loading...');
  const [pub_topic, setPubTopic] = useState<string>('Loading...');
  const [raw, setRaw] = useState<string>('Loading...');
  const [services, setServices] = useState<ServicesStatus | null>(null);
  const [sensor, setSensor] = useState<SensorStatus | null>(null);
  const [record, setRecord] = useState<RecordStatus | null>(null);

  useEffect(() => {
    const listenQuit = async () => {
      const unlisten = await once('quit', () => {
        unlisten();
        appWindow.close();
      });
    };

    const fetchData = async () => {
      try {
        const FailUnlisten = await listen('fail', () => {
          FailUnlisten();
          setThingName('データの取得に失敗しました🌀');
          setSubTopic('Failed to get data');
          setPubTopic('Failed to get data');
          setRaw('Failed to get data');
          setServices(null);
          setSensor(null);
          setRecord(null);
        });

        let monitor = await invoke('fetch_monitor', { uuid });
        if (!isMonitor(monitor)) {
          message('invalid data', { title: 'Error', type: 'error' });
          return;
        }

        setThingName(monitor.thing);
        setSubTopic(monitor.topic.subscribe);
        setPubTopic(monitor.topic.publish);
        setRaw(monitor.raw);
        setServices(monitor.services);
        setSensor(monitor.sensors);
        setRecord(monitor.record);
      } catch (err) {
        message('エラーが発生しました。\n データの表示に失敗😔', { title: 'Error', type: 'error' });
      }
    };

    listenQuit();
    fetchData();
  }, []);

  return { thing, sub_topic, pub_topic, raw, services, sensor, record };
}
