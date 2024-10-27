import { inject, Injectable } from '@angular/core';
import {
  Auth,
  authState,
  signInWithEmailAndPassword,
} from '@angular/fire/auth';
import { collection, getDocs, query, where } from '@angular/fire/firestore';
import { Router } from '@angular/router';

import { Observable, from, map, of, switchMap } from 'rxjs';
import { Firestore } from '@angular/fire/firestore';
import { User } from '../types/user.type';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  firestore = inject(Firestore);
  firebaseAuth = inject(Auth);

  userCollectionName = 'users';
  historyCollectionName = 'loginHistory';
  constructor(private router: Router) {}

  login(email: string, password: string) {
    const promise = signInWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    ).then(() => {});
    return from(promise);
  }

  logout() {
    this.firebaseAuth.signOut().then(() => this.router.navigate(['login']));
  }

  getCurrentUser(): Observable<User | undefined> {
    return authState(this.firebaseAuth).pipe(
      switchMap((user) => {
        if (user) {
          return this.getUserByEmail(user.email!).pipe(
            map((userData) => userData)
          );
        } else {
          return of(undefined);
        }
      })
    );
  }

  getUserByEmail(email: string): Observable<User | undefined> {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('email', '==', email));

    return new Observable<User | undefined>((observer) => {
      getDocs(q)
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const data = doc.data() as User;
            const userData = { ...data, id: doc.id };
            observer.next(userData);
          });
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }
}
