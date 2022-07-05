import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TemperatureChartComponent } from './temperature-chart/temperature-chart.component';
import { LeaderBoardComponent } from './leader-board/leader-board.component';

@NgModule({
  declarations: [AppComponent, TemperatureChartComponent, LeaderBoardComponent],
  imports: [BrowserModule, AppRoutingModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
