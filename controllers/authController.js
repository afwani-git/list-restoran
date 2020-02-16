const passport = require('passport');
const crypto = require('crypto');
const User = require('../models/User');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');

exports.login = passport.authenticate('local',{
	failureRedirect:'/login',
	failureFlash:'Failed Login!',
	successRedirect:'/',
	successFlash:'You are now login'
})


exports.logout = async (req,res) => {
	req.logout();	
	req.flash('success','you  are now logged out! 👋');
	res.redirect('/');
}


exports.isLoggedIn = async (req,res,next) => {
	if(req.isAuthenticated()){
		return next();
	}

	req.flash('error','Oops you must be loggin');
	res.redirect('/login');
}

exports.forgot = async (req,res) => {
	
	const { email } = req.body;
	const user = await User.findOne({email});

	if(!user) {
		req.flash('error','No account that account email');
		return res.redirect('/login');
	}

	user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
	user.resetPasswordExpires = Date.now() + 36000000;
 	await user.save();

	const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
	
	mail.send({
		user,
		subject:'Password Reset',
		filename:'password-reset',
		resetURL
	})

	req.flash('success',`email has been send 📧 `);
	res.redirect('/login');
}

exports.reset = async (req,res) => {
	const user = await User.findOne({
		resetPasswordToken:req.params.token,
		resetPasswordExpires:{$gt:Date.now()}
	});
	
	if(!user){
		req.flash('error','Token hash expired');
		return res.redirect('/login');
	}

	res.render('reset',{title:'Reset password'});
}

exports.confirmPassword  = async (req,res,next) => {
	if(req.body.password == req.body['password-confirm']){
		return next()
	}

	req.flash('error',"password not match");
	req.redirect('back');
}

exports.update = async (req,res) => {
	const user = await User.findOne({
		resetPasswordToken:req.params.token,
		resetPasswordExpires:{$gt:Date.now()}
	});
	
	if(!user){
		req.flash('error','Token hash expired');
		return res.redirect('/login');
	}

	const setPassword = promisify(user.setPassword,user);
	await setPassword(req.body.password);
	user.resetPasswordToken =  undefined;
	user.resetPasswordExpires = undefined;
	const updateUser = await user.save();
	req.login(updateUser);
	req.flash('success','Nice your password has been reset');
	res.redirect('/')
}