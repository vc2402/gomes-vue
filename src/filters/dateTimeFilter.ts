export type DateTimeFormat = "d"|"dt"|"t";

export function DateTimeFilter(value: any, format?: DateTimeFormat): string {
  // TODO use momentum for locale support
  let ret = "";
  if( value ) {
    let d: Date|undefined;
    if( typeof value == "number" )
      d = new Date(value as number);
    else if( value instanceof Date )
      d = value as Date;
    else if( typeof value == "string" ) {
      //TODO
    }
    if( d ) {
      if( !format || format.startsWith( "d" ) ) {
        ret += to2dig(d.getDate()) + "." + to2dig(d.getMonth()+1) + "." + d.getFullYear() + " ";
      }
      if( format == "t" || format == "dt" ) {
        ret += to2dig(d.getHours()) + ":" + to2dig(d.getMinutes()) + ":" + to2dig(d.getSeconds());
      }
    }
  }
  return ret;
}

function to2dig( val: string|number ): string {
  return (val+'').padStart(2, "0");
}