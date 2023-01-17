import { NamedArray } from "immutable-class";
import memoizeOne from "memoize-one";
import React from "react";
import DashboardPanel from "./dashboard-panel";
import "./dashboard-view.scss";
import { DownloadableDatasetProvider } from "../cube-view/downloadable-dataset-context";
import { PartialTilesProvider } from "../cube-view/partial-tiles-provider";
import { FilterTilesRow } from "../../components/filter-tile/filter-tiles-row";
import { GlobalEventListener } from "../../components/global-event-listener/global-event-listener";
import { Dashboard, dashboards } from "../../config/dashboards";
import { ClientAppSettings } from "../../../common/models/app-settings/app-settings";
import { Clicker } from "../../../common/models/clicker/clicker";
import { ClientDataCube } from "../../../common/models/data-cube/data-cube";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence, VisStrategy } from "../../../common/models/essence/essence";
import { Filter } from "../../../common/models/filter/filter";
import { SeriesList } from "../../../common/models/series-list/series-list";
import { Series } from "../../../common/models/series/series";
import { ClientSources } from "../../../common/models/sources/sources";
import { Split } from "../../../common/models/split/split";
import { Splits } from "../../../common/models/splits/splits";
import { Stage } from "../../../common/models/stage/stage";
import { TimeShift } from "../../../common/models/time-shift/time-shift";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { VisualizationManifest } from "../../../common/models/visualization-manifest/visualization-manifest";
import { VisualizationSettings } from "../../../common/models/visualization-settings/visualization-settings";
import { urlHashConverter } from "../../../common/utils/url-hash-converter/url-hash-converter";
import { CubeContext } from "../cube-view/cube-context";
import { HeaderBar } from "../../components/header-bar/header-bar";

interface DashboardViewProps {
  appSettings: ClientAppSettings;
  hash: string;
  id: string;
  initTimekeeper: Timekeeper;
  sources: ClientSources;
}

interface DashboardViewState {
  dashboard: Dashboard;
  dataCube: ClientDataCube;
  essence: Essence;
  stage: Stage;
}

export default class DashboardView extends React.Component<DashboardViewProps, DashboardViewState> {
  static getDerivedStateFromProps({ appSettings, hash, id, sources }: DashboardViewProps) {
    const dashboard = dashboards[id];
    if (!dashboard) throw new Error(`Dashbaord ${id} has not been configured`);
    const dataCube = NamedArray.findByName(sources.dataCubes, dashboard.cube);
    const essence = hash
      ? urlHashConverter.essenceFromHash(hash, appSettings, dataCube)
      : Essence.fromDataCube(dataCube, appSettings);
    return {
      dashboard: dashboards[id],
      dataCube,
      essence
    };
  }

  clicker = {
    changeFilter: (filter: Filter) => {
      this.setState(state => {
        let { essence } = state;
        essence = essence.changeFilter(filter);
        return { ...state, essence };
      });
    },
    changeComparisonShift: (timeShift: TimeShift) => {
      this.setState(state =>
        ({ ...state, essence: state.essence.changeComparisonShift(timeShift) }));
    },
    changeSplits: (splits: Splits, strategy: VisStrategy) => {
      const { essence } = this.state;
      this.setState({ essence: essence.changeSplits(splits, strategy) });
    },
    changeSplit: (split: Split, strategy: VisStrategy) => {
      const { essence } = this.state;
      this.setState({ essence: essence.changeSplit(split, strategy) });
    },
    addSplit: (split: Split, strategy: VisStrategy) => {
      const { essence } = this.state;
      this.setState({ essence: essence.addSplit(split, strategy) });
    },
    removeSplit: (split: Split, strategy: VisStrategy) => {
      const { essence } = this.state;
      this.setState({ essence: essence.removeSplit(split, strategy) });
    },
    changeSeriesList: (seriesList: SeriesList) => {
      const { essence } = this.state;
      this.setState({ essence: essence.changeSeriesList(seriesList) });
    },
    addSeries: (series: Series) => {
      const { essence } = this.state;
      this.setState({ essence: essence.addSeries(series) });
    },
    removeSeries: (series: Series) => {
      const { essence } = this.state;
      this.setState({ essence: essence.removeSeries(series) });
    },
    changeVisualization: (visualization: VisualizationManifest, settings: VisualizationSettings) => {
      const { essence } = this.state;
      this.setState({ essence: essence.changeVisualization(visualization, settings) });
    },
    pin: (dimension: Dimension) => {
      const { essence } = this.state;
      this.setState({ essence: essence.pin(dimension) });
    },
    unpin: (dimension: Dimension) => {
      const { essence } = this.state;
      this.setState({ essence: essence.unpin(dimension) });
    },
    changePinnedSortSeries: (series: Series) => {
      const { essence } = this.state;
      this.setState({ essence: essence.changePinnedSortSeries(series) });
    }
  };

  constructor(props: DashboardViewProps) {
    super(props);
    this.state = {
      ...DashboardView.getDerivedStateFromProps(props),
      stage: this.getStage()
    };
  }

  componentDidMount() {
    this.setStage();
  }

  getStage() {
    return Stage.fromSize(window.innerWidth, window.innerHeight);
  }

  setStage = () => {
    this.setState({
      stage: this.getStage()
    });
  }

  private constructDataCubeContext = memoizeOne(
    (essence: Essence, clicker: Clicker) =>
      ({ essence, clicker }),
    ([nextEssence, nextClicker]: [Essence, Clicker], [prevEssence, prevClicker]: [Essence, Clicker]) =>
      nextEssence.equals(prevEssence) && nextClicker === prevClicker);

  render() {
    if (!this.state.dashboard) return null;
    return (
      <div className="dashboard-view">
        <HeaderBar title={this.state.dashboard.title} />
        <GlobalEventListener resize={this.setStage}/>
        <CubeContext.Provider value={this.constructDataCubeContext(this.state.essence, this.clicker)}>
          <DownloadableDatasetProvider>
            <PartialTilesProvider>
              {({ addFilter, filter, removeTile }) => (
                <>
                  <FilterTilesRow
                    locale={this.props.appSettings.customization.locale}
                    timekeeper={this.props.initTimekeeper}
                    menuStage={this.state.stage}
                    partialFilter={filter}
                    removePartialFilter={removeTile}
                    addPartialFilter={addFilter}
                  />
                  <div className="dashboard-panels">
                    {this.state.dashboard.panels.map((panel, i) => (
                      <DashboardPanel
                        addFilter={addFilter}
                        appSettings={this.props.appSettings}
                        clicker={this.clicker}
                        dataCube={this.state.dataCube}
                        hash={this.props.hash}
                        key={i}
                        measures={panel.measures}
                        partialFilter={filter}
                        splits={panel.splits}
                        timekeeper={this.props.initTimekeeper}
                      />
                    ))}
                  </div>
                </>
              )}
            </PartialTilesProvider>
          </DownloadableDatasetProvider>
        </CubeContext.Provider>
      </div>
    );
  }
}
