
$Input = require('./input/Input');

module.exports = function(env){
    return {

        Blade : require('./blade/blade')(env)

    }
};
