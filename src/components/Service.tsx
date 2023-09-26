import React from 'react';
import { ServiceStatus } from '../monitor/types';

interface ServiceProps {
  service: ServiceStatus;
}

const Service: React.FC<ServiceProps> = ({ service }) => (
  <>
    <h2>📊 {service.Name}</h2>
    <strong>アクティブ: {service.Active ? 'Active 🟢' : 'Dead 🔴'}</strong>
    <p>プロセス番号: {service.PID}</p>
    <h4>配下のプロセス:</h4>
    {service.CGroup?.map((process) => (
      <p>⚙️ {process}</p>
    ))}
    <hr />
  </>
);

export default Service;
