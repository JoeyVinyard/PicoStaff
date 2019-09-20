import { Injectable } from '@angular/core';
import { LocationService } from './location.service';
import { AngularFirestoreDocument } from '@angular/fire/firestore';
import { Schedule } from '../models/schedule';
import { Subscription, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  currentLocationDoc: AngularFirestoreDocument;
  currentScheduleSub: Subscription;
  currentSchedule: ReplaySubject<Schedule> = new ReplaySubject(1);

  loadSchedule(scheduleId: string): void {
    if(this.currentScheduleSub) {
      this.currentScheduleSub.unsubscribe();
    }
    this.currentScheduleSub =  this.currentLocationDoc.collection("schedules").doc<Schedule>(scheduleId).valueChanges().subscribe((scheduleData) => {
        this.currentSchedule.next(new Schedule(scheduleData, this.currentLocationDoc.collection("scheudles").doc<Schedule>(scheduleId)));
    });
  }

  constructor(private locationService: LocationService) {
    this.locationService.currentLocation.subscribe((location) => {
      console.log(location);
      this.currentLocationDoc = location.document;
    });
  }
}
