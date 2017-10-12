var multiparty = require('multiparty');
var fs = require('fs');
var dispersion = require('../modules/dispersion');
var fileLoader = require('../modules/fileLoader')
var Post = require('../models/post');

// Post 관련 함수
module.exports = {
    posting_query : (req, res, data)=>{
        try{
            var fields = data.fields;
            var files = data.files;
          
            var user_id = fields.find((value)=>{ return value.name == "user_id"; }).value;
            var sns_list = fields.find((value)=>{return value.name == "sns"; }).value;

            // 이미지 삽입
            var title = fields.find((value)=>{ return value.name == "Title"; }).value;
            var contents = fields.find((value)=>{ return value.name == "Contents"; }).value;
            
            var images = "";
            files.forEach((value, index)=>{
                images += value.path;
                if (index != files.length-1){
                    images += ",";
                }
            });
        }
        catch (err) {
            console.log(err);
        }
        finally {
            Post.count({
                author : user_id
            }, (err, post_count)=>{
                var post_id = post_count + 1;
                Post.findOne({
                    author : user_id,
                    post_id : post_id
                }, (err, rpost)=>{
                    if(!rpost){
                        var post = new Post({
                            author : user_id,
                            post_id : post_id,
                            title : title,
                            contents : contents,
                            images : images,
                            sns : sns_list
                        });

                        post.save((err)=>{
                            if (err) {
                                console.log('post error : ' + err);
                                res.json({result : false});
                            } else {
                                console.log('sending post : ' + post);
                                // 미디어 추가
                                require('./media').add_media(post_id, files);
                                res.json({result : true});
                            }
                        });
                    }
                });
            });
        }
    },
    posting : (req, res)=>{
        fileLoader.get_postdata(req).then((data)=>{
            require('./post').posting_query(req, res, data);
        });
    },
    get_posts : (req, res)=>{
        var user_id = req.body.user_id;
        var page = parseInt(req.body.page);
        
        Post.find({
            author : user_id
        }, (err, posts)=>{
            if(!posts)
                res.json({ result : null })
            res.json({posts});
        }).sort({ date : -1 }).skip(page).limit(2);
    }
};