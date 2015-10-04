var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/:topic/:page', function(req, res, next) {
    res.render(req.params.topic + '/' + req.params.page,{},function(err,html){
      if ( err ){
        console.log(err);
        return res.send('Page not found');
      }
      return res.send(html);
    });
});

module.exports = router;
