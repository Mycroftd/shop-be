

exports.catch404Error = (req,res,next) =>{    
    res.status(404).send({msg: 'path not found'});
}

exports.catch500Error = (err, req, res, next) => {
    console.log(err);
    res.status(500).send({ msg: "internal server error" });
  }

  exports.customError = (err, req, res, next) => {
    if (err.msg != undefined) {
      res.status(err.status).send({ msg: err.msg });
    } else {
      next(err);
    }
  }