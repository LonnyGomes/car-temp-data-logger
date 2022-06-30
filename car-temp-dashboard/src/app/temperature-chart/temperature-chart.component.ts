// references
// v4 https://d3-graph-gallery.com/graph/line_several_group.html
// v6 https://observablehq.com/@bjedwards/multi-line-chart-d3-v6
// https://stackoverflow.com/questions/41905301/angular-2-typescript-d3-type-issue-property-x-does-not-exist-on-type-number
// simple multiline - https://bl.ocks.org/d3noob/ed0864ef6ec6af1e360917c29f4b08da

import { Component, OnInit } from '@angular/core';
import { DataManagerService } from '../services/data-manager.service';
import * as d3 from 'd3';
import { TemperatureDataModel } from '../models/temperature-data.model';

@Component({
  selector: 'app-temperature-chart',
  templateUrl: './temperature-chart.component.html',
  styleUrls: ['./temperature-chart.component.scss'],
})
export class TemperatureChartComponent implements OnInit {
  constructor(private dataManger: DataManagerService) {}
  margin = { top: 20, right: 60, bottom: 40, left: 60 };
  width = 960 - this.margin.left - this.margin.right;
  height = 500 - this.margin.top - this.margin.bottom;
  containerWidth = this.width + this.margin.left + this.margin.right;
  containerHeight = this.height + this.margin.top + this.margin.bottom;
  temperatureData: TemperatureDataModel[] = [];

  async ngOnInit() {
    this.temperatureData = await this.dataManger.loadData(
      '//s3.amazonaws.com/www.lonnygomes.com/data/car-temperatures/20220629.csv'
    );
    const chart = await this.initChart('chart', this.temperatureData);
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
    const [startDate, endDate] = d3.extent(data, (d) => d.date);
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
      .text('Time')
      .attr('x', (this.width - this.margin.left - this.margin.right) / 2)
      .attr('y', this.margin.bottom); // Relative to the y axis

    // Add Y axis
    const y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(data, (d) => Math.max(d.sensor_1, d.sensor_2)) as number,
      ])
      .range([this.height, 0])
      .nice();

    chart
      .append('g')
      .call(d3.axisLeft(y))
      // Add label
      .append('text')
      .attr('class', 'chart-axis-label')
      .text('Temperature (°)')
      .attr('transform', 'rotate(-90)')
      .attr(
        'x',
        -(
          this.margin.top +
          (this.height - this.margin.top - this.margin.bottom) / 2
        )
      )
      .attr('y', -40); // Relative to the y axis

    // Add light sensitivity Y axis
    const y2 = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.photocell) as number])
      .range([this.height, 0])
      .nice();

    chart
      .append('g')
      .attr('transform', `translate(${this.width}, 0)`)
      .call(d3.axisRight(y2))
      // Add label
      .append('text')
      .attr('class', 'chart-axis-label')
      .text('Light sensitivity (%)')
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
      .x((d) => x(d.date))
      .y((d) => y(d.sensor_1));

    const externalSensor = d3
      .line<TemperatureDataModel>()
      .x((d) => x(d.date))
      .y((d) => y(d.sensor_2));

    const lightSensitivityLine = d3
      .line<TemperatureDataModel>()
      .x((d) => x(d.date))
      .y((d) => y2(d.photocell));

    // add sensor line 1
    chart
      .append('path')
      .data([data])
      .attr('class', 'chart-line')
      .style('stroke', 'blue')
      .attr('d', internalSensor);

    // add sensor line 2
    chart
      .append('path')
      .data([data])
      .attr('class', 'chart-line')
      .style('stroke', 'red')
      .attr('d', externalSensor);

    // add light sensitivity line
    chart
      .append('path')
      .data([data])
      .attr('class', 'chart-line')
      .style('stroke', '#fbbc04')
      .attr('d', lightSensitivityLine);

    return chart;
  }
}
