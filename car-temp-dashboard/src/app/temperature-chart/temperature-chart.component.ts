// references
// v4 https://d3-graph-gallery.com/graph/line_several_group.html
// v6 https://observablehq.com/@bjedwards/multi-line-chart-d3-v6
// https://stackoverflow.com/questions/41905301/angular-2-typescript-d3-type-issue-property-x-does-not-exist-on-type-number
// simple multiline - https://bl.ocks.org/d3noob/ed0864ef6ec6af1e360917c29f4b08da

import { Component, OnInit } from '@angular/core';
import { DataManagerService } from '../services/data-manager.service';
import * as d3 from 'd3';
import {
  TemperatureDataField,
  TemperatureDataMetadata,
  TemperatureDataModel,
  TemperatureLegendItem,
  TemperatureListings,
} from '../models/temperature-data.model';

@Component({
  selector: 'app-temperature-chart',
  templateUrl: './temperature-chart.component.html',
  styleUrls: ['./temperature-chart.component.scss'],
})
export class TemperatureChartComponent implements OnInit {
  margin = { top: 20, right: 60, bottom: 50, left: 60 };
  width = 750 - this.margin.left - this.margin.right;
  height = 650 - this.margin.top - this.margin.bottom;
  containerWidth = this.width + this.margin.left + this.margin.right;
  containerHeight = this.height + this.margin.top + this.margin.bottom;
  temperatureData: TemperatureDataModel[] = [];
  temperatureMetadata: TemperatureDataMetadata | null = null;
  chartLegendItems: TemperatureLegendItem[];
  temperatureListings: TemperatureListings | null = null;
  selectedDataset: string | null = null;

  private CHART_LABEL = {
    TIME: 'Time',
    TEMPERATURE: 'Temperature (°F)',
    LIGHT: 'Light sensitivity (%)',
  };

  constructor(private dm: DataManagerService) {
    this.chartLegendItems = this.dm.getLegendItems();
  }

  async ngOnInit() {
    this.temperatureListings = this.dm.loadDatasets();
    this.selectedDataset = this.temperatureListings.datasets[0].url;

    this.temperatureData = await this.dm.loadData(
      '//s3.amazonaws.com/www.lonnygomes.com/data/car-temperatures/20220630.csv'
    );
    const chart = await this.initChart('chart', this.temperatureData);
    this.temperatureMetadata = this.dm.analyzeDataset(this.temperatureData);
  }

  onTemperatureDropdownChange(evt: any) {
    console.log(this.selectedDataset);
  }

  private initChart(selectorId: string, data: TemperatureDataModel[]) {
    const chart = d3
      .select(`#${selectorId}`)
      .append('svg')
      //.attr('width', this.containerWidth)
      //.attr('height', this.containerHeight)
      .attr('viewBox', `0 0 ${this.containerWidth} ${this.containerHeight}`)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    // Add X axis --> it is a date format
    const [startDate, endDate] = d3.extent(
      data,
      (d) => d[TemperatureDataField.DATE]
    );
    const d1: Date = startDate as Date;
    const d2: Date = endDate as Date;

    const x = d3.scaleTime().domain([d1, d2]).range([0, this.width]);

    chart
      .append('g')
      .attr('transform', `translate(0, ${this.height})`)
      .call(d3.axisBottom(x))
      // Add label
      .append('text')
      .attr('class', 'chart-axis-label')
      .text(this.CHART_LABEL.TIME)
      .attr('x', (this.width - this.margin.left - this.margin.right) / 2)
      .attr('y', this.margin.bottom); // Relative to the y axis

    // Add Y axis
    const y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(data, (d) =>
          Math.max(
            d[TemperatureDataField.INTERNAL_SENSOR],
            d[TemperatureDataField.EXTERNAL_SENSOR]
          )
        ) as number,
      ])
      .range([this.height, 0])
      .nice();

    chart
      .append('g')
      .call(
        d3
          .axisLeft(y)
          .tickFormat((d, idx) => (idx % 2 === 0 ? d.toString() : ''))
      )
      // Add label
      .append('text')
      .attr('class', 'chart-axis-label')
      .text(this.CHART_LABEL.TEMPERATURE)
      .attr('transform', 'rotate(-90)')
      .attr(
        'x',
        -(
          this.margin.top +
          (this.height - this.margin.top - this.margin.bottom) / 2
        )
      )
      .attr('y', -40); // Relative to the y axis

    // add y grid axis
    const yAxisGrid = d3
      .axisLeft(y)
      .tickSize(-this.width)
      .tickFormat((d) => '');
    chart.append('g').attr('class', 'chart-axis-grid y').call(yAxisGrid);

    // Add light sensitivity Y axis
    const y2 = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(data, (d) => d[TemperatureDataField.LIGHT_SENSOR]) as number,
      ])
      .range([this.height, 0])
      .nice();

    chart
      .append('g')
      .attr('transform', `translate(${this.width}, 0)`)
      .call(d3.axisRight(y2).ticks(5))
      // Add label
      .append('text')
      .attr('class', 'chart-axis-label')
      .text(this.CHART_LABEL.LIGHT)
      .attr('transform', 'rotate(-90)')
      .attr(
        'x',
        -(
          this.margin.top +
          (this.height - this.margin.top - this.margin.bottom) / 2
        )
      )
      .attr('y', 45); // Relative to the y axis

    const internalSensor = d3
      .line<TemperatureDataModel>()
      .x((d) => x(d[TemperatureDataField.DATE]))
      .y((d) => y(d[TemperatureDataField.INTERNAL_SENSOR]));

    const externalSensor = d3
      .line<TemperatureDataModel>()
      .x((d) => x(d[TemperatureDataField.DATE]))
      .y((d) => y(d[TemperatureDataField.EXTERNAL_SENSOR]));

    const lightSensitivityLine = d3
      .line<TemperatureDataModel>()
      .x((d) => x(d[TemperatureDataField.DATE]))
      .y((d) => y2(d[TemperatureDataField.LIGHT_SENSOR]));

    // add sensor line 1
    chart
      .append('path')
      .data([data])
      .attr('class', 'chart-line')
      .style(
        'stroke',
        this.dm.SENSOR_COLOR[TemperatureDataField.INTERNAL_SENSOR]
      )
      .attr('d', internalSensor);

    // add sensor line 2
    chart
      .append('path')
      .data([data])
      .attr('class', 'chart-line')
      .style(
        'stroke',
        this.dm.SENSOR_COLOR[TemperatureDataField.EXTERNAL_SENSOR]
      )
      .attr('d', externalSensor);

    // add light sensitivity line
    chart
      .append('path')
      .data([data])
      .attr('class', 'chart-line')
      .style('stroke', this.dm.SENSOR_COLOR[TemperatureDataField.LIGHT_SENSOR])
      .attr('d', lightSensitivityLine);

    return chart;
  }
}
