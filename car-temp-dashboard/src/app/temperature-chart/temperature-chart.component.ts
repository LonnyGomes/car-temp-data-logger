// references
// v4 https://d3-graph-gallery.com/graph/line_several_group.html
// v6 https://observablehq.com/@bjedwards/multi-line-chart-d3-v6
// https://stackoverflow.com/questions/41905301/angular-2-typescript-d3-type-issue-property-x-does-not-exist-on-type-number
// simple multiline - https://bl.ocks.org/d3noob/ed0864ef6ec6af1e360917c29f4b08da

import { Component, OnInit } from '@angular/core';
import { DataManagerService } from '../services/data-manager.service';
import * as d3 from 'd3';
import {
  FieldName,
  FIELD_NAMES,
  SensorName,
  SENSOR_NAMES,
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
  margin = { top: 20, right: 65, bottom: 50, left: 65 };
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

  private TRANSITION_DURATION = 2000;

  private MAX_Y_TEMPERATURE = 160;

  constructor(private dm: DataManagerService) {
    this.chartLegendItems = this.dm.getLegendItems();
  }

  async ngOnInit() {
    this.temperatureListings = this.dm.loadDatasets();
    this.selectedDataset = this.temperatureListings.datasets[0].url;

    //'//s3.amazonaws.com/www.lonnygomes.com/data/car-temperatures/20220630.csv'
    this.temperatureData = await this.dm.loadData(this.selectedDataset);
    const chart = this.initChart('chart');
    this.updateChart('chart', this.temperatureData);
    this.temperatureMetadata = this.dm.analyzeDataset(this.temperatureData);
  }

  async onTemperatureDropdownChange(url: string) {
    this.temperatureData = await this.dm.loadData(url);
    this.temperatureMetadata = this.dm.analyzeDataset(this.temperatureData);
    this.updateChart('chart', this.temperatureData);
  }

  private genD3Line(
    sensorName: SensorName,
    x: d3.ScaleTime<number, number>,
    y: d3.ScaleLinear<number, number>
  ) {
    return d3
      .line<TemperatureDataModel>()
      .x((d) => x(d[TemperatureDataField.DATE]))
      .y((d) => y(d[sensorName]));
  }

  /**
   * Create D3 SVG chart
   * @param selectorId CSS id for SVG container
   * @returns generated d3 chart
   */
  private initChart(selectorId: string) {
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

    const x = d3.scaleTime().range([0, this.width]);

    chart
      .append('g')
      .attr('class', 'axis chart-axis-x')
      .attr('transform', `translate(0, ${this.height})`)
      .call(d3.axisBottom(x))
      // Add label
      .append('text')
      .attr('class', 'chart-axis-label')
      .text(this.CHART_LABEL.TIME)
      .attr('x', (this.width - this.margin.left - this.margin.right) / 2)
      .attr('y', this.margin.bottom); // Relative to the y axis

    // Add Y axis
    const y = d3.scaleLinear().range([this.height, 0]).nice();

    chart
      .append('g')
      .attr('class', 'axis chart-axis-y')
      .call(
        d3.axisLeft(y)
        //.tickFormat((d, idx) => (idx % 2 === 0 ? d.toString() : ''))
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
      .attr('y', -this.margin.left + 15); // Relative to the y axis

    // add y grid axis
    const yAxisGrid = d3
      .axisLeft(y)
      .tickSize(-this.width)
      .tickFormat((d) => '');
    chart.append('g').attr('class', 'chart-axis-grid y').call(yAxisGrid);

    // Add light sensitivity Y axis
    const y2 = d3.scaleLinear().range([this.height, 0]).nice();

    chart
      .append('g')
      .attr('class', 'axis chart-axis-y-right')
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
      .attr('y', this.margin.right - 15); // Relative to the y axis

    // create sensor lines
    chart
      .selectAll('.chart-line')
      .data(SENSOR_NAMES)
      .enter()
      .append('path')
      .attr('class', (sensorName) => `chart-line ${sensorName}`)
      .style('stroke', (sensorName) => this.dm.SENSOR_COLOR[sensorName]);

    // add hover line
    chart
      .append('g')
      .append('path')
      .attr('class', 'chart-hover-line')
      .attr('opacity', 0)
      .attr('d', `M 0, ${this.height} 0,0`);

    // create group for hover labels
    chart.append('g').attr('class', 'chart-hover-labels');

    // add area for mouse over
    chart
      .append('rect')
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .attr('class', 'chart-focus-box')
      .attr('width', this.width)
      .attr('height', this.height);

    return chart;
  }

  /**
   * Update the D3 chart with new temperature dataset
   * @param selectorId CSS id of SVG container
   * @param data temperature dataset
   */
  private updateChart(selectorId: string, data: TemperatureDataModel[]) {
    const chart = d3.select(`#${selectorId}`);

    const dateValues = data.map((d) => d[TemperatureDataField.DATE].getTime());
    const formatDateToTime = (date: Date) => {
      const hour = date.getHours();
      const mins = date.getMinutes();
      const secs = date.getSeconds();
      return `${hour < 10 ? '0' : ''}${hour}:${mins < 10 ? '0' : ''}${mins}:${
        secs < 10 ? '0' : ''
      }${secs}`;
    };
    const onTouchStart = (e: TouchEvent) => {
      onMouseOver(e);
      onMouseMove(e);
    };
    const onMouseOver = (e: MouseEvent | TouchEvent) => {
      chart.select('.chart-hover-line').attr('opacity', 1);
      chart.select('.chart-hover-labels').attr('opacity', 1);
    };
    const onMouseMove = (e: MouseEvent | TouchEvent) => {
      const [xPos] = d3.pointer(e);
      const x0 = x.invert(xPos);
      const positionIsLeft = xPos > (this.width * 2) / 3;
      const labelGap = 30;
      const labelAnchorPadding = positionIsLeft ? -7 : 7;

      const dataIdx = d3.bisect(dateValues, x0.getTime(), 0);
      const selectedData = data[dataIdx];

      // determine the y position of the smallest value
      // with a hardcoded floor
      const minSensorValue = Math.min(
        yLeft(
          d3.min<number>(SENSOR_NAMES.map((d) => selectedData[d])) as number
        ),
        this.height * (2 / 3)
      );

      // update position of hover line and data
      chart
        .select('.chart-hover-line')
        .attr('d', `M ${xPos},${this.height} ${xPos},0`);

      const hoverLabels = chart
        .select('.chart-hover-labels')
        .selectAll<SVGTextElement, FieldName>('.chart-hover-label')
        .data(FIELD_NAMES, (d) => d);

      hoverLabels
        .join('text')
        .text(
          (d) =>
            `${this.dm.FIELD_LABEL[d]}: ${
              d === TemperatureDataField.DATE
                ? formatDateToTime(selectedData[d])
                : Math.round(selectedData[d] * 100) / 100
            }`
        )
        .attr('fill', (d) => this.dm.FIELD_COLOR[d])
        .attr('class', 'chart-hover-label')
        .attr('text-anchor', positionIsLeft ? 'end' : 'start')
        .attr('x', xPos + labelAnchorPadding)
        .attr('y', (d, idx) => minSensorValue + labelGap * (idx + 1));
    };
    const onMouseOut = (e: MouseEvent | TouchEvent) => {
      chart.select('.chart-hover-line').attr('opacity', 0);
      chart.select('.chart-hover-labels').attr('opacity', 0);
      onMouseMove(e);
    };

    // Add x axis
    const [startDate, endDate] = d3.extent(
      data,
      (d) => d[TemperatureDataField.DATE]
    );
    const d1: Date = startDate as Date;
    const d2: Date = endDate as Date;

    const x = d3.scaleTime().domain([d1, d2]).range([0, this.width]);
    const xAxis = d3.axisBottom(x);
    chart
      .selectAll<SVGGElement, TemperatureDataModel[]>('.chart-axis-x')
      .call(xAxis);

    // Add left Y axis
    const yLeft = d3
      .scaleLinear()
      .domain([
        0,
        // d3.max(data, (d) =>
        //   Math.max(
        //     d[TemperatureDataField.INTERNAL_SENSOR],
        //     d[TemperatureDataField.EXTERNAL_SENSOR]
        //   )
        // ) as number,
        this.MAX_Y_TEMPERATURE,
      ])
      .range([this.height, 0])
      .nice();

    const yLeftAxis = d3
      .axisLeft(yLeft)
      .tickFormat((d, idx) => (idx % 2 === 0 ? d.toString() : ''));

    chart
      .selectAll<SVGGElement, TemperatureDataModel[]>('.chart-axis-y')
      .call(yLeftAxis);

    // Add light sensitivity Y axis to the right side
    const yRight = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(data, (d) => d[TemperatureDataField.LIGHT_SENSOR]) as number,
      ])
      .range([this.height, 0])
      .nice();

    const yRightAxis = d3.axisRight(yRight).ticks(5);
    chart
      .selectAll<SVGGElement, TemperatureDataModel[]>('.chart-axis-y-right')
      .call(yRightAxis);

    // add hover listeners
    chart
      .select('.chart-focus-box')
      .on('mouseover', onMouseOver)
      .on('touchstart', onTouchStart)
      .on('mousemove', onMouseMove)
      .on('touchmove', onMouseMove)
      .on('mouseout', onMouseOut)
      .on('touchend', onMouseOut);

    // update lines
    for (let sensorName of SENSOR_NAMES) {
      const y =
        sensorName === TemperatureDataField.LIGHT_SENSOR ? yRight : yLeft;
      const lines = chart
        .selectAll<SVGPathElement, TemperatureDataModel[]>(`.${sensorName}`)
        .data([data]);

      lines.exit().transition().duration(this.TRANSITION_DURATION).remove();

      lines
        .enter()
        .append('path')
        .attr('class', `chart-line ${sensorName}`)
        .style('stroke', this.dm.SENSOR_COLOR[sensorName])
        .merge(lines)
        .transition()
        .duration(this.TRANSITION_DURATION)
        .attr('d', this.genD3Line(sensorName, x, y));
    }
  }
}
