import memoizeOne from "memoize-one";
import React from "react";
import { PartialFilter } from "../cube-view/partial-tiles-provider";
import { ClientAppSettings } from "../../../common/models/app-settings/app-settings";
import { Clicker } from "../../../common/models/clicker/clicker";
import { ClientDataCube } from "../../../common/models/data-cube/data-cube";
import { DeviceSize } from "../../../common/models/device/device";
import { Essence, VisStrategy } from "../../../common/models/essence/essence";
import { SeriesList } from "../../../common/models/series-list/series-list";
import { fromMeasure } from "../../../common/models/series/series";
import { Split } from "../../../common/models/split/split";
import { Splits } from "../../../common/models/splits/splits";
import { Stage } from "../../../common/models/stage/stage";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { Visualization } from "../../../common/models/visualization-manifest/visualization-manifest";
import { urlHashConverter } from "../../../common/utils/url-hash-converter/url-hash-converter";
import { GlobalEventListener } from "../../components/global-event-listener/global-event-listener";
import { VisSkeleton } from "../../components/vis-skeleton/vis-skeleton";
import { getChartComponent } from "../../visualizations";
import { CubeContext } from "../cube-view/cube-context";
import { Binary } from "../../../common/utils/functional/functional";
import { Dimension } from "../../../common/models/dimension/dimension";
import { DragPosition } from "../../../common/models/drag-position/drag-position";

interface DashboardPanelProps {
  addFilter: Binary<Dimension, DragPosition, void>;
  appSettings: ClientAppSettings;
  clicker: Clicker;
  dataCube: ClientDataCube;
  deviceSize?: DeviceSize;
  hash: string;
  measures: string[];
  menuStage?: Stage;
  partialFilter: PartialFilter;
  splits?: string[];
  timekeeper: Timekeeper;
}

interface DashboardPanelState {
  essence: Essence;
  stage?: Stage;
}

export default class DashboardPanel extends React.Component<DashboardPanelProps, DashboardPanelState> {
  static getDerivedStateFromProps(props: DashboardPanelProps) {
    let essence = props.hash
      ? urlHashConverter.essenceFromHash(props.hash, props.dataCube)
      : Essence.fromDataCube(props.dataCube);
    essence = props.measures.reduce(
      (essence, measure) =>
        essence.addSeries(fromMeasure(props.dataCube.measures.byName[measure])),
      essence.set("series", new SeriesList())
    );
    essence = (props.splits || []).reduce<Essence>(
      (essence, split) => {
        const dimension = props.dataCube.dimensions.byName[split];
        return essence.addSplit(Split.fromDimension(dimension), VisStrategy.FairGame);
      },
      essence.set("splits", new Splits())
    );
    return {
      essence
    };
  }

  constructor(props: DashboardPanelProps) {
    super(props);
    this.state = {
      ...DashboardPanel.getDerivedStateFromProps(props),
      stage: this.getStage()
    };
  }

  componentDidMount() {
    this.setStage();
  }

  private getVisualization = memoizeOne((name: Visualization) => getChartComponent(name));

  private constructDataCubeContext = memoizeOne(
    (essence: Essence, clicker: Clicker) =>
      ({ essence, clicker }),
    ([nextEssence, nextClicker]: [Essence, Clicker], [prevEssence, prevClicker]: [Essence, Clicker]) =>
      nextEssence.equals(prevEssence) && nextClicker === prevClicker);

  private container = React.createRef<HTMLDivElement>();

  private getStage() {
    console.info(this.container.current && this.container.current.getBoundingClientRect());
    return this.container.current && Stage.fromClientRect(this.container.current.getBoundingClientRect());
  }

  private setStage = () => {
    this.setState({
      stage: this.getStage()
    });
  }

  render() {
    const Visualization = this.getVisualization(this.state.essence.visualization.name);
    return (
      <>
        <GlobalEventListener resize={this.setStage}/>
        <CubeContext.Provider value={this.constructDataCubeContext(this.state.essence, this.props.clicker)}>
          <div
            className="dashboard-panel"
            ref={this.container}
          >
            {this.state.stage
              ? <React.Suspense
                fallback={
                  <VisSkeleton
                    essence={this.state.essence}
                    stage={this.state.stage}
                    timekeeper={this.props.timekeeper}
                    customization={this.props.appSettings.customization}
                  />
                }
              >
                <Visualization
                  essence={this.state.essence}
                  clicker={this.props.clicker}
                  timekeeper={this.props.timekeeper}
                  stage={this.state.stage}
                  customization={this.props.appSettings.customization}
                  addSeries={() => {}}
                  addFilter={this.props.addFilter}
                  lastRefreshRequestTimestamp={undefined}
                  partialFilter={this.props.partialFilter}
                  partialSeries={undefined}
                  removeTile={() => {}}
                  dragEnter={() => {}}
                  dragOver={() => {}}
                  isDraggedOver={false}
                  dragLeave={() => {}}
                  drop={() => {}}
                />
              </React.Suspense>
              : null}
          </div>
        </CubeContext.Provider>
      </>
    );
  }
}
