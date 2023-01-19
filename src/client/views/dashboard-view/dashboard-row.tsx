import React from 'react'
import { Binary } from '../../../common/utils/functional/functional';
import { Dimension } from '../../../common/models/dimension/dimension';
import { DragPosition } from '../../../common/models/drag-position/drag-position';
import { ClientAppSettings } from '../../../common/models/app-settings/app-settings';
import { Clicker } from '../../../common/models/clicker/clicker';
import { ClientDataCube } from '../../../common/models/data-cube/data-cube';
import { DeviceSize } from '../../../common/models/device/device';
import { DashboardPanel as DashboardPanelConfig } from '../../config/dashboards';
import { Stage } from '../../../common/models/stage/stage';
import { PartialFilter } from '../cube-view/partial-tiles-provider';
import { Timekeeper } from '../../../common/models/timekeeper/timekeeper';
import DashboardPanel from './dashboard-panel';

export interface DashboardRowProps {
  addFilter: Binary<Dimension, DragPosition, void>;
  appSettings: ClientAppSettings;
  clicker: Clicker;
  dataCube: ClientDataCube;
  deviceSize?: DeviceSize;
  hash: string;
  columns: DashboardPanelConfig[][];
  menuStage?: Stage;
  partialFilter: PartialFilter;
  timekeeper: Timekeeper;
}

export function DashboardRow(props: DashboardRowProps) {
  return (
    <div className={`dashboard-row dashboard-${props.columns.length}-columns`}>
      {props.columns.map(panels => (
        <div className="dashboard-column">
          {panels.map((panel, i) => (
            <DashboardPanel
              addFilter={props.addFilter}
              appSettings={props.appSettings}
              clicker={props.clicker}
              dataCube={props.dataCube}
              hash={props.hash}
              key={i}
              measures={panel.measures}
              partialFilter={props.partialFilter}
              splits={panel.splits}
              timekeeper={props.timekeeper}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
