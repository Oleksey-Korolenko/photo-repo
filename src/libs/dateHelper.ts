const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const weekNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default class DateHelper {
  static getNowString(): string {
    const now = new Date();

    const weekDay = weekNames[now.getUTCDay()];
    const month = monthNames[now.getUTCMonth()];
    const day = now.getUTCDate();

    let hours: number | string = now.getUTCHours();
    if (hours < 10) {
      hours = `0${hours}`;
    }

    let minutes: number | string = now.getUTCMinutes();
    if (minutes < 10) {
      minutes = `0${minutes}`;
    }

    let seconds: number | string = now.getUTCSeconds();
    if (seconds < 10) {
      seconds = `0${seconds}`;
    }

    const year = now.getUTCFullYear();

    const dateNow = `${weekDay} ${month} ${day} ${hours}:${minutes}:${seconds} UTC ${year}`;

    return dateNow;
  }
}
