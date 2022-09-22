import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  distinctUntilChanged,
  filter,
  interval,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { Flight } from '../model/flight';
import { FlightService } from '../model/flight.service';

@Injectable({ providedIn: 'root' })
export class FlightLookaheadFacade {
  private input$ = new Subject<string>();
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorsSubject = new Subject<unknown>();

  readonly loading$ = this.loadingSubject.asObservable();
  readonly errors$ = this.errorsSubject.asObservable();

  readonly online$ = interval(2000).pipe(
    startWith(-1),
    map(() => Math.random() < 0.5),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly flights$ = combineLatest({ input: this.input$, online: this.online$ }).pipe(
    filter((combined) => combined.online),
    tap(() => this.loadingSubject.next(true)),
    switchMap((combined) => this.load(combined.input)),
    tap(() => this.loadingSubject.next(false))
  );

  constructor(private flightService: FlightService) {}

  private load(from: string): Observable<Flight[]> {
    return this.flightService.load(from).pipe(
      catchError((error) => {
        console.error('error', error);
        this.errorsSubject.next(error);
        return of([]);
      })
    );
  }

  setInput(value: string): void {
    this.input$.next(value);
  }
}
