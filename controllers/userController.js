const promisify = require('es6-promisify');
const User = require('../models/User');

exports.loginForm = async (req,res) => {

	res.render('login',{ title:'login' })

}

exports.registerForm = async (req,res) => {
	res.render('register',{ title:'register' })
}

exports.validateRegister = (req, res, next) => {
  req.sanitizeBody('name');
  req.checkBody('name', 'You must supply a name!').notEmpty();
  req.checkBody('email', 'That Email is not valid!').isEmail();
  req.sanitizeBody('email').normalizeEmail({
    gmail_remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false
  });
  req.checkBody('password', 'Password Cannot  be Blank!').notEmpty();
  req.checkBody('password-confirm', 'Confirmed Password cannot be blank!').notEmpty();
  req.checkBody('password-confirm', 'Oops! Your passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors.map(err => err.msg));
    res.render('register', { title: 'Register', body: req.body, flashes: req.flash() });
    return; // stop the fn from running
  }
  next(); // there were no errors!
};

exports.register = async (req,res,next) => {
	const user = new User({ email: req.body.email, name: req.body.name });
  const register = promisify(User.register, User);
  await register(user, req.body.password);
  next(); // pass to authController.logi
}

exports.account = async (req,res) => {
	res.render('account',{title:"edit account"});
}

exports.updateAccount = async  (req,res) => {

	const { name,email } = req.body;

	const updates = {name,email};

	const user = await User.findOneAndUpdate(
		{ _id:req.user._id },
		{ $set:updates },
		{ new:true,runValidators:true,context:'query'}
	);

	req.flash('success',"account update successfully 😄"); 
	res.redirect('back');
}