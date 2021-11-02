import BigNumber from "bignumber.js";
import numeral from 'numeral';
export const BIG_NUMBER_ONE = new BigNumber(1)
export const BIG_NUMBER_ZERO = new BigNumber(0);
export const getBigNumberStr = (bigNumber:BigNumber, fixed:number, factor = 1) => {
    if (!BigNumber.isBigNumber(bigNumber)) {
        return new BigNumber(bigNumber||0)?.times(factor)?.toFixed(fixed) || '0'
    }
    if (bigNumber.isZero()) {
        return '0'
    }
    return bigNumber?.times(factor)?.toFixed(fixed) || '0'
}
export const formatBigNumberStr = (bigNumber:BigNumber, fixed:number, factor = 1) => {
    if (!BigNumber.isBigNumber(bigNumber)) {
        return new BigNumber(bigNumber||0)?.times(factor)?.toFixed(fixed) || '0'
    }
    if (bigNumber.isZero()) {
        return '0'
    }
    const strRaw = bigNumber?.times(factor)?.toFixed(fixed)
    return bigNumber ? numeral(strRaw).format('0,0.00') : '0'
}

export const formatDollars = (val:string) => {
    return numeral(val).format('$0,0.00')
}
export const formatDollarsInFourDecimalPlaces = (val:string) =>{
    return numeral(val).format('$0,0.0000')
}
export const formatDollarsKmb = (val:BigNumber) => {
    let value
    const numeralString = numeral(val?.toString()).format('$0,0.[00]a')
    if (/NaN/.test(numeralString)) {
        if (val.isLessThan(0.005)) {
            value = '$0'
        } else {
            value = '$' + Number(val?.toString()).toPrecision(2)
        }
    } else {
        value = numeral(val?.toString()).format('$0,0.[00]a')
    }
    return value.replace(/[mbtk]$/, str => str.toUpperCase())
}
export const formatKmb = (val:BigNumber) => {
    let value
    const numeralString = numeral(val?.toString()).format('0,0.[00]a')
    if (/NaN/.test(numeralString)) {
        if (val.isLessThan(0.005)) {
            value = '0'
        } else {
            value = Number(val?.toString()).toPrecision(2)
        }
    } else {
        value = numeral(val?.toString()).format('0,0.[00]a')
    }
    return value.replace(/[mbtk]$/, str => str.toUpperCase())
}

// eX(2, 3) = 2e3 = 2000
// eX(2, -3) = 2e-3 = 0.002
export const eX = (value: string | number, x: string | number) => {
    return new BigNumber(`${value}e${x}`);
};

export const leftTime = (e:number) => {
    const Time = {
        day: '00',
        hour: '00',
        minutes: '00',
        seconds: '00'
    };
    let Distance = e;

    if (Distance > 0) {
        Time.day = Math.floor(Distance / 86400000).toString();
        Distance -= (Number(Time.day) * 86400000);
        Time.hour = Math.floor(Distance / 3600000).toString();
        Distance -= Number(Time.hour) * 3600000;
        Time.minutes = Math.floor(Distance / 60000).toString();
        Distance -= Number(Time.minutes) * 60000;
        Time.seconds = Math.floor(Distance / 1000).toFixed(0);
        Distance -= Number(Time.seconds) * 1000;
        if (Number(Time.day) < 10) {
            Time.day = '0' + Time.day;
        }
        if (Number(Time.hour) < 10) {
            Time.hour = '0' + Time.hour;
        }
        if (Number(Time.minutes) < 10) {
            Time.minutes = '0' + Time.minutes;
        }
        if (Number(Time.seconds) < 10) {
            Time.seconds = '0' + Time.seconds;
        }
        return Time;
    } else {
        return Time;
    }

}
