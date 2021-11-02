import BigNumber from "bignumber.js";

const getLarixPrice = async () => {
    const backupPrice = 0.08

    try {
        const response = await fetch(
            "/getLarixPrice"
        );
        const data = await response.text()
        return new BigNumber(data)

    } catch (e) {
        console.log(e)
        try {
            const response = await fetch(
                "/getLarixPriceByMxc"
            );
            const data = (await response.json()).data[0];
            return new BigNumber(data.last!=='0'?data.last:data.ask);

        } catch (e) {
            console.log(e)
            try {
                const response = await fetch(
                    "/getLarixPriceByGate"
                );
                const data = await response.json();
                return new BigNumber(data.last!=='0'?data.last:data.lowestAsk);

            } catch (e) {
                console.log(e)
                return new BigNumber(backupPrice)
            }
        }
    }

};
const getMndePrice = async () => {
    const backupPrice = 1.65
    try {
        const response = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=marinade&vs_currencies=usd"
        );
        return new BigNumber((await response.json())["marinade"].usd)
    } catch (e){
        return new BigNumber(backupPrice)
    }
}
export default {
    getLarixPrice,
    getMndePrice
}