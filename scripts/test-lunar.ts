import { getSolarDate } from '../src/lib/lunar';

const lDay = 10;
const lMonth = 3;
const lYear = 2026;

const solarDate = getSolarDate(lDay, lMonth, lYear);
console.log(`Lunar: ${lDay}/${lMonth}/${lYear} AL`);
console.log(`Solar: ${solarDate.getDate()}/${solarDate.getMonth() + 1}/${solarDate.getFullYear()}`);
