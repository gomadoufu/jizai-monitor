import React from 'react';
import { ServiceStatus } from '../monitor/types';

interface ServiceProps {
  service: ServiceStatus;
}

const Service: React.FC<ServiceProps> = ({ service }) => (
  <>
    <h2>📊 {service.name}</h2>
    <strong>アクティブ: {service.active ? 'Active 🟢' : 'Dead 🔴'}</strong>
    <p>プロセス番号: {service.pid}</p>
    <h4>配下のプロセス:</h4>
    {service.cgroup?.map((process) => (
      <p>⚙️ {process}</p>
    ))}
    <hr />
  </>
);

export default Service;
