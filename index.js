require('babel/register')({
  stage: 0,
  only: /lib/
});
require('./lib');
