import {Injectable, OnDestroy} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RealTimeUpdate implements OnDestroy {
  public key: any;
  private sub: any;
  private readonly onKeyChange: any;
  private readonly onValueChange: any;

  constructor(onKeyChange: any, onValueChange: any) {
    this.onKeyChange = onKeyChange;
    this.onValueChange = onValueChange;
  }

  subscribe(key: any): void {
    if (this.key !== key) {
      this.unsubscribe();
      if (key !== null && key !== undefined) {
        this.key = key;
        this.sub = this.onKeyChange(key);
        if (this.sub) {
          this.sub = this.sub.subscribe(this.onValueChange);
        }
      }
    }
  }

  unsubscribe(): void {
    if (this.sub) {
      this.sub.unsubscribe();
      this.sub = null;
      this.key = null;
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }
}
