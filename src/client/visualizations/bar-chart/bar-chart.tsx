/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2019 Allegro.pl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from "react";
import { or } from "../../../common/utils/functional/functional";
import makeQuery from "../../../common/utils/query/visualization-query";
import { Predicates } from "../../../common/utils/rules/predicates";
import {
  ChartPanel,
  VisualizationProps
} from "../../views/cube-view/center-panel/center-panel";
import "./bar-chart.scss";
import { BarChart as ImprovedBarChartComponent } from "./improved-bar-chart/bar-chart";
import { newVersionSupports } from "./improved-bar-chart/support";
import { BarChart as BarChartComponent } from "./old-bar-chart/old-bar-chart";

export default function BarChart(props: VisualizationProps) {
  return newVersionSupports(props.essence)
    ? <ChartPanel {...props} queryFactory={makeQuery} chartComponent={ImprovedBarChartComponent} />
    : <ChartPanel {...props} queryFactory={makeQuery} chartComponent={BarChartComponent}/>;
}
