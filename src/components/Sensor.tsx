import React from 'react';
import { SensorStatus } from '../monitor/types';

interface SensorProps {
  sensor: SensorStatus | null;
}

const Sensor: React.FC<SensorProps> = ({ sensor }) => (
  <>
    <div className="sensor">
      <h2>🌡️ 温度</h2>
      <p>CPUセンサ {sensor?.['coretemp-isa-0000'].Adapter}</p>
      <strong> {sensor?.['coretemp-isa-0000']['Package id 0']['temp1_input']}°C</strong>
      <hr />
      <p>マザーボード上センサ {sensor?.['acpitz-acpi-0'].Adapter}</p>
      <strong> {sensor?.['acpitz-acpi-0'].temp1['temp1_input']}°C</strong>
      <hr />
      <p>ネットワークカード上センサ {sensor?.['iwlwifi_1-virtual-0'].Adapter}</p>
      <strong> {sensor?.['iwlwifi_1-virtual-0'].temp1['temp1_input']}°C</strong>
    </div>
  </>
);

export default Sensor;
