// const myPromise = new Promise((resolve, reject) => {

//     setTimeout(() => {
//         value = 0
//         console.log(value++);
//         resolve(value);
//     }, 1000);
// });

function count(value) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log(value++);
            resolve(value);
        }, 1000);
    })
}
// myPromise.then(count).
//     then(count).

//     then(count).then(count).then(count)

function setTimeoutPromise(delay) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, delay);
    });
}

let interv = setInterval(() => {
    console.log(new Date());
}, 100);

let obj = {}
obj.run = async function () {
    await setTimeoutPromise(1000)
    console.log('after wait');
    clearInterval(interv)
    for (; ;) {
        await setTimeoutPromise(1)
        console.log(new Date());
    }
}

// obj.run()

