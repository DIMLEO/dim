
$Input = require('./input/Input');

$Session = require('./Session/Session');

$Request = require('./request/Request');

$Hash = require('password-hash')

/*
 * start of adaption to laravel function
 */
$Hash.make = $Hash.generate;
$Hash.check = $Hash.verify;
/*
 * end of adaption to laravel function
 */

$Auth = require('./Auth/Auth');

module.exports = function(env){
    return {

        Blade : require('./blade/blade')(env)

    }
};
