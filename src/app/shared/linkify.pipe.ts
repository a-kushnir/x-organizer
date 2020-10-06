import { Pipe, PipeTransform } from '@angular/core';
import linkifyStr from 'linkifyjs/string';

@Pipe({name: 'linkify'})
export class LinkifyPipe implements PipeTransform {
  transform(str: string, options: object = {}): string {
    return str ? linkifyStr(str, options) : str;
  }
}
