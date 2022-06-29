// references
// v4 https://d3-graph-gallery.com/graph/line_several_group.html
// v6 https://observablehq.com/@bjedwards/multi-line-chart-d3-v6

import { Component, OnInit } from '@angular/core';
import { DataManagerService } from '../services/data-manager.service';
import * as d3 from 'd3';
import { color, range, svg } from 'd3';
import {
  SensorDataModel,
  SENSOR_NAMES,
} from '../models/temperature-data.model';

@Component({
  selector: 'app-temperature-chart',
  templateUrl: './temperature-chart.component.html',
  styleUrls: ['./temperature-chart.component.scss'],
})
export class TemperatureChartComponent implements OnInit {
  constructor(private dataManger: DataManagerService) {}
  margin = { top: 10, right: 30, bottom: 30, left: 60 };
  width = 460 - this.margin.left - this.margin.right;
  height = 400 - this.margin.top - this.margin.bottom;

  async ngOnInit() {
    const chart = await this.initChart('chart');
    console.log('chart', chart);
  }

  private async initChart(selectorId: string) {
    const chart = d3
      .select(`#${selectorId}`)
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr(
        'transform',
        `translate("${this.margin.left}", "${this.margin.top}")`
      );

    const data = await this.dataManger.loadData('assets/data/20220623.csv');

    // group data
    const groupedData = d3.group(data, (d) => d.id);
    console.log('groupedData', groupedData);

    // Add X axis --> it is a date format
    const [startDate, endDate] = d3.extent(data, (d) => d.date);
    const d1: Date = startDate as Date;
    const d2: Date = endDate as Date;

    const x = d3.scaleTime().domain([d1, d2]).range([0, this.width]);

    chart
      .append('g')
      .attr('transform', `translate(0, ${this.height})`)
      .call(d3.axisBottom(x).ticks(5));

    // Add Y axis
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.temperature) as number])
      .range([this.height, 0]);

    chart.append('g').call(d3.axisLeft(y));

    // color palate
    const color = d3
      .scaleOrdinal()
      .domain(Array.from(groupedData.keys()) as string[])
      .range(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00']);

    return chart;
  }
}
