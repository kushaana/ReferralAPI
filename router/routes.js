const express               =  require('express'),
      referralCodes         =  require("referral-codes"),
      passport              =  require("passport"),
      LocalStrategy         =  require("passport-local"),
      User                  =  require("../models/user"),
      emailMask             =  require("email-mask");
      
passport.serializeUser(User.serializeUser());    
passport.deserializeUser(User.deserializeUser());   
passport.use(new LocalStrategy(User.authenticate()));

const router = express.Router();

const initCode = "------";
const getIncentive = (id) => {
    if(id === 3) return 50;
    else if(id === 5) return 100;
    else if(id === 10) return 150;
    else if(id === 50) return 250;
    else if(id === 100) return 500;
    else if(id === 500) return 1000;
    else return 0;
};

//=======================
//      R O U T E S
//=======================

router.get("/", (req,res) =>{
    res.render("home");
});

router.get("/milestones", (req, res) => {
    User.findOne({ 'username' : req.user.username }, (err, user) => {
        if (err) {
            res.send("Error while fetching milestones!");
        }
        else {
            const milestones = [3, 5, 10, 50, 100, 500];
            const initMilestone = {
                milestone : "Used referral code", 
                incentive: 50,
                status: user.refereeCode != "" ? "Achieved" : "Missed" 
            };
            var response = [initMilestone].concat(milestones.map((val) => {
                return ({ 
                    milestone : "Refer " + val + " friends", 
                    incentive: getIncentive(val),
                    status: val <= user.referredUsers.length ? "Achieved" : "Pending" 
                })
            }))

            res.render("array", {response});
        }
    });
});

router.get("/referralhistory", (req, res) => {
    User.findOne({ 'username' : req.user.username }, (err, user) => {
        if (err) {
            res.send("Error while fetching referral history!");
        }
        else {
            var response = user.referredUsers.map((referredUser, index) => {
                return ({ username: emailMask(referredUser), incentive: getIncentive(index+1)})
            });

            res.render("array", {response});
        }
    });
});

router.get("/referralcode/:enroll", (req, res) => {
    const code = req.user.referralCode === initCode ? referralCodes.generate({
        prefix: req.user.username+'-',
        length: 6
    })[0] : req.user.referralCode;

    User.findOneAndUpdate(
        { username: req.user.username },
        { $set : { 'referralCode' : req.params.enroll === "1" ? code : initCode } },
        {new: true},
        (err, refreeUser) => {
            if (err) {
                res.send("Something wrong while getting referral code!");
            }
            else {
                res.json(req.params.enroll === "1" ? code : "Successfully un-enrolled");
            }
        }
    )
});

router.get("/userprofile",isLoggedIn,(req,res) =>{
    res.render("userprofile");
});

//Auth Routes
router.get("/login",(req,res)=>{
    res.render("login");
});

router.post("/login", 
    passport.authenticate("local", {
        successRedirect:"/userprofile",
        failureRedirect:"/login"
    }), 
    function (req, res){}
);

router.get("/register",(req,res)=>{
    res.render("register");
});

router.post("/register", function (req,res,next) {
    if(req.body.refereeCode !== "") {
        User.findOne({ 'referralCode' : req.body.refereeCode }, (err, refreeUser) => {
            if (err) {
                res.render("error", { err });
            }
            else {
                if(refreeUser === null) {
                    req.validReferralCode = false;
                }
                else {
                    req.validReferralCode = true;
                }
                next();
            }
        });
    }
    else {
        req.validReferralCode = true;
        next();
    }
});

router.post("/register", (req,res) => {

    if(req.validReferralCode) {
        const newUser = new User({
            username: req.body.username, 
            email: req.body.email, 
            referralCode: initCode, 
            refereeCode: req.body.refereeCode
        });

        User.register(newUser, req.body.password, function(err, user) {
            if(err){
                res.render("error", { err });
            }
            else {
                passport.authenticate("local")
                (req, res, function(){
                    if(req.body.refereeCode !== "") {
                        User.findOneAndUpdate(
                            { referralCode: req.body.refereeCode },
                            { $push : { 'referredUsers' : req.body.email } },
                            {new: true},
                            (err, refreeUser) => {
                                if (err) {
                                    res.send("Something wrong when updating data!");
                                }
                            }
                        )
                    }
                    res.redirect("/login");
                });
            }
        })
    }
    else {
        const err = "Invalid referral code!";
        res.render("error", { err });
    }
});

router.get("/logout",(req,res)=>{
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req,res,next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

module.exports = router;