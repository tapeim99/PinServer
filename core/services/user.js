
var User = require('../models/user');

module.exports = {
    /*
    * Find User ( request )
    * name : String
    */
    find_user_by_email : (req, res) => {
        User.findOne({
            email : req.body.email
        }, (err, user)=>{
            if(err) return res.status(500).json({
                result : false,
                error : err
            });
            if(!user) return res.status(404).json({
                return : false,
                error : 'user not fount'
            });

            res.json({
                result : user
            });
        });
    },
    find_user_by_name : (req, res)=>{
        User.findOne({
            name : req.body.name
        }, (err, user)=>{
            if(err) return res.status(500).json({
                result : false,
                error : err
            });
            if(!user) return res.status(404).json({
                return : false,
                error : 'user not fount'
            });

            res.json({
                result : user
            });
        });
    },
    is_find_user_by_name : (name)=>{
        var promise = new Promise((resolve, reject)=>{
            User.findOne({name : name}, (err, user)=>{
                if(!user) resolve(false);
                resolve(true)
            });
        })
        return promise;
    },
    is_find_user_by_email : (email)=>{
        var promise = new Promise((resolve, reject)=>{
            User.findOne({email : email}, (err, user)=>{
                if(!user) resolve(false);
                resolve(true)
            });
        })
        return promise;
    },
    signup: (req, res) =>{
        require('./user').is_find_user_by_email(req.body.email).then((result)=>{
            // 유저가 없을때만 회원가입한다.
            if(!result) {
                User.count({}, (err, count)=>{
                    var user = new User({
                        id : count,
                        name : req.body.name,
                        password : req.body.password,
                        email: req.body.email
                    });
    
                    user.save((err)=>{
                        if(err){
                            // console.error(err);
                            // res.json({result : false, signup : false});
                            // return;
                            res.status(500).json({
                                result : false,
                                error : err
                            });
                            return;
                        }
                        require('./user').signin(req, res);
                    });
                });
            } else {
                // res.json({
                //    result : true, 
                //    signup : false
                // })
                require('./user').signin(req, res);
            }
        })
    },
    // 로그인
    signin: (req, res) =>{
        User.findOne({
            email : req.body.email,
            password : req.body.password
        }, (err, user)=>{
            if(err) res.status(500).json({
                result : false,
                error : err
            });
            if(!user){
                res.status(404).json({
                    result : false,
                    error : 'user not found'
                });
            }else {
                res.json({
                    result : true,
                    user : user
                });
            }
        });
    }
};