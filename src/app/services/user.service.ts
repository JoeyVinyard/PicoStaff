import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { User } from 'firebase';
import { UserInfo } from '../models/user-info';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private currentUserInfo: Observable<UserInfo>;

  public getCurrentUserInfo(): Observable<UserInfo> {
    return this.currentUserInfo;
  }

  public logout(): Promise<void> {
    return this.afAuth.auth.signOut();
  }

  private loadUserInfo(user: User): void {
    this.currentUserInfo = this.afStorage.doc<UserInfo>(`users/${user.email}`).valueChanges();
  }

  constructor(private afAuth: AngularFireAuth, private afStorage: AngularFirestore) {
    afAuth.user.subscribe((user) => {
      if(user){
        this.loadUserInfo(user);
      } else {
        this.currentUserInfo = null;
      }
    });
  }
}