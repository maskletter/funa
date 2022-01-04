


module.exports = {

    runSystem(type) {
        return type[process.env.frame] && type[process.env.frame]();
    }

}