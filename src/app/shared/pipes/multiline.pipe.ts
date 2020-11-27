import { Pipe, PipeTransform } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'multiline'
})
export class MultilinePipe implements PipeTransform {
  constructor() {
  }

  transform(value: string): SafeHtml {
    return value ? value.replace('\n', '<br>') : null;
  }
}
