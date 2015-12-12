'use strict';

module.exports = function(env){
    return {
        Blade : require('./blade/blade')(env)
    }
};
