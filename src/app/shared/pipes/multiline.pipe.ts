import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'multiline'
})
export class MultilinePipe implements PipeTransform {
  constructor() {
  }

  transform(value: string): string {
    return value ? value.replace(/\n/g, '<br>') : null;
  }
}
