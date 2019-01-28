const express=require('express');
const { check, validationResult } = require('express-validator/check');


let router=express.Router();

let Article=require('../models/article');
let User=require('../models/user');

router.get('/', function(req, res){
    Article.find({},function(err,articles){
        res.render('/articles/index', {
            articles:articles
        })
    });
});

router.get('/new', ensureAuthenticated, function(req, res){
    res.render('articles/new',{
        title:'Add Article'
    });
});

router.get('/:id', function(req, res){
    Article.findById(req.params.id, function(err, article){
        User.findById(article.author, function(req, user){
            res.render('articles/show',{
                article: article,
                author: user.name
            });
        });
    });
});

router.get('/:id/edit', ensureAuthenticated, function(req, res){
    Article.findById(req.params.id, function(err, article){
        if(article.author !=req.user._id){
            req.flash('danger', 'Not Authorized');
            return res.redirect('/');
        }

        res.render('articles/edit',{
            title:'Edit Article',
            article:article
        })
    })
})

router.post('/create', [
    check('title').isLength({min:1}).withMessage('Title is required'),
    check('body').isLength({min:1}).withMessage('Body is required'),
],function(req, res){
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.render('articles/new',{
            title:'Add Article',
            errors:errors.array()
        })
    }else{
        let article=new Article(req.body);

        article.author=req.user._id;

        article.save(function(err){
            if(err){
                console.log(err);
                return;
            }else{
                req.flash("success", "Article Add");
                res.redirect('/');
            }
        })   
    }
});

router.post('/update/:id', function(req, res){
    let query={_id: req.params.id}

    Article.update(query, req.body, function(err){
        if(err){
            console.log(err);
            return;
        }else{
            req.flash("success", "Article update");
            res.redirect('/');
        }
    })    

});

router.delete('/:id', function(req, res){
    if(!req.user._id){
        return res.status(500).send();
    }

    let query={_id:req.params.id};
    
    Article.findById(req.params.id, function(err, article){
        if(article.author != req.user._id){
            res.status(500).send();
        }else{
            Article.remove(query, function(err){
                if(err){
                    console.log(err);
                }
        
                res.send('Success');
            })
        }
    })
})

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      req.flash('danger', 'Please login');
      res.redirect('/users/login');
    }
}

module.exports=router;