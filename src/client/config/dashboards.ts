/*
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

// Hardcoded dashboards config

export interface Dashboard {
  cube: string;
  rows: DashboardPanel[][][];
  title: string;
}

export interface DashboardPanel {
  measures: string[];
  splits?: string[];
}

export const dashboards: Record<string, Dashboard> = {
  covid19: {
    cube: "covid19",
    title: "Covid19",
    rows: [
      [
        [
          {
            measures: ["tests"]
          }
        ],
        [
          {
            measures: ["deaths"],
            splits: ["time"]
          }
        ]
      ]
    ]
  }
};
