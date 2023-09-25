import React from 'react';
import { RecordStatus } from '../monitor/types';

interface RecordProps {
  record: RecordStatus | null;
}

const Record: React.FC<RecordProps> = ({ record }) => (
  <>
    <div className="record">
      <h2>📹 録画</h2>
      <p>最後に録画したファイル</p>
      <p>💽 {record?.record}</p>
      <p>⏳ {record?.length}</p>
      <hr />
      <p>最後に録画した時刻</p>
      <p>🕒 {record?.time}</p>
    </div>
  </>
);

export default Record;
