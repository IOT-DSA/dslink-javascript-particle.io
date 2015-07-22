require('babel/register')({
  stage: 0,
  only: [
    'lib/*.js',
    'lib/**/*.js'
  ]
});
require('./lib');
