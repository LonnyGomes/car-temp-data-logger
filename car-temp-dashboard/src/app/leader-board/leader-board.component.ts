import { Component, Input, OnInit } from '@angular/core';
import { TemperatureGuess } from '../models/temperature-data.model';

@Component({
  selector: 'app-leader-board',
  templateUrl: './leader-board.component.html',
  styleUrls: ['./leader-board.component.scss'],
})
export class LeaderBoardComponent implements OnInit {
  @Input() temperatureGuesses: TemperatureGuess[] | null = null;
  @Input() maxTemperature: number = 0;

  constructor() {}

  ngOnInit(): void {}
}
