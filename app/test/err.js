

function main() {
    console.log('start err', new Date());
    try {

        console.log(err);

        setInterval(() => {
            process.send(new Date());
        }, 1000);

    } catch (err) {
        setTimeout(() => {
            main()
        }, 1000);

    }
}
main()

var cleanExit = function () {
    console.log('Sensor process.exit()');
    process.exit()
};
process.on('SIGINT', cleanExit); // catch ctrl-c
process.on('SIGTERM', cleanExit); // catch kill