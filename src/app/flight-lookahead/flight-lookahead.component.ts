import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, filter, Subject, takeUntil } from 'rxjs';
import { FlightLookaheadFacade } from './flight-lookahead.facade';

@Component({
  selector: 'app-flight-lookahead',
  templateUrl: './flight-lookahead.component.html',
})
export class FlightLookaheadComponent implements OnInit, OnDestroy {

  destroy$ = new Subject<void>();
  control = new FormControl();

  flights$ = this.facade.flights$;
  online$ = this.facade.online$;
  loading$ = this.facade.loading$;

  input$ = this.control.valueChanges.pipe(
    filter((v) => v.length >= 3),
    debounceTime(300)
  );

  constructor(private facade: FlightLookaheadFacade) {}

  ngOnInit(): void {
    this.input$.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.facade.setInput(value);
    });

    this.facade.online$.pipe(takeUntil(this.destroy$)).subscribe((online) => {
      console.log('online', online);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
