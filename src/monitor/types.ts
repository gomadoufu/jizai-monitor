type Monitor = {
  uuid: string;
  thing: string;
  pub_topic: string;
  sub_topic: string;
  raw: string;
  services: ServiceStatus[];
  sensors: SensorStatus;
  record: RecordStatus;
};

interface ServiceStatus {
  Name: string;
  Active: boolean;
  PID: number;
  CGroup?: string[]; // `?` はオプショナルなフィールドを示します。
}

type ServicesStatus = ServiceStatus[];

interface CoreTemp {
  Adapter: string;
  'Package id 0': Record<string, number>;
}

interface WifiTemp {
  Adapter: string;
  temp1: Record<string, number>;
}

interface AcpiTemp {
  Adapter: string;
  temp1: Record<string, number>;
}

interface SensorStatus {
  'coretemp-isa-0000': CoreTemp;
  'acpitz-acpi-0': AcpiTemp;
  'iwlwifi_1-virtual-0': WifiTemp;
}

interface RecordStatus {
  time: string;
  record: string;
  length: string;
}

function isMonitor(value: unknown): value is Monitor {
  const monitor = value as Monitor;
  return (
    typeof monitor === 'object' &&
    monitor !== null &&
    typeof monitor.uuid === 'string' &&
    typeof monitor.thing === 'string' &&
    typeof monitor.pub_topic === 'string' &&
    typeof monitor.sub_topic === 'string' &&
    typeof monitor.raw === 'string' &&
    isServicesStatus(monitor.services) &&
    isSensorStatus(monitor.sensors) &&
    isRecordStatus(monitor.record)
  );
}

function isServicesStatus(value: unknown): value is ServicesStatus {
  const servicesStatus = value as ServicesStatus;
  return (
    Array.isArray(servicesStatus) &&
    servicesStatus.every((serviceStatus) => {
      return (
        typeof serviceStatus.Name === 'string' &&
        typeof serviceStatus.Active === 'boolean' &&
        typeof serviceStatus.PID === 'number'
      );
    })
  );
}

function isSensorStatus(value: unknown): value is SensorStatus {
  const sensorStatus = value as SensorStatus;
  return (
    typeof sensorStatus === 'object' &&
    sensorStatus !== null &&
    typeof sensorStatus['coretemp-isa-0000'] === 'object' &&
    typeof sensorStatus['acpitz-acpi-0'] === 'object' &&
    typeof sensorStatus['iwlwifi_1-virtual-0'] === 'object'
  );
}

function isRecordStatus(value: unknown): value is RecordStatus {
  const recordStatus = value as RecordStatus;
  return (
    typeof recordStatus === 'object' &&
    recordStatus !== null &&
    typeof recordStatus.time === 'string' &&
    typeof recordStatus.record === 'string' &&
    typeof recordStatus.length === 'string'
  );
}

export type { Monitor, ServiceStatus, ServicesStatus, SensorStatus, RecordStatus };
export { isMonitor, isServicesStatus, isSensorStatus, isRecordStatus };
