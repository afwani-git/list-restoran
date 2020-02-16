const express = require('express');
const router = express.Router();
const { catchErrors } = require('../handlers/errorHandlers');
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

// Do work here
router.get('/',catchErrors(storeController.getStore)); 
router.get('/stores',catchErrors(storeController.getStore));
router.get('/stores/page/:page',catchErrors(storeController.getStore));

router.get('/add',
	authController.isLoggedIn,
	storeController.addStore
	);

router.get('/store/:slug',storeController.getStoreBySlug);
router.get('/stores/:id/edit',catchErrors(storeController.deleteStore));

router.post('/add',
	authController.isLoggedIn,
	storeController.upload
	,catchErrors(storeController.resize)
	,catchErrors(storeController.createStore));

// update stores
router.post('/add/:id',storeController.upload,
	catchErrors(storeController.resize),
	catchErrors(storeController.updateStore));
router.get('/tags',storeController.getStoreByTag);
router.get('/tags/:tag',storeController.getStoreByTag);

router.get('/login',userController.loginForm);
router.get('/register',userController.registerForm);
router.post('/register',
	userController.validateRegister,
	catchErrors(userController.register),
	authController.login);

router.get('/logout',authController.logout);
router.post('/login',authController.login);


router.get('/account',authController.isLoggedIn,userController.account);
router.post('/account',authController.isLoggedIn,catchErrors(userController.updateAccount));
router.post('/account/forgot',catchErrors(authController.forgot));
router.get('/account/reset/:token',catchErrors(authController.reset));
router.post('/account/reset/:token',
	catchErrors(authController.confirmPassword),
	catchErrors(authController.update));
router.get('/map',storeController.mapPage);
router.get('/hearts',authController.isLoggedIn,storeController.getHeart);
router.get('/top',catchErrors(storeController.getTopStore));
router.post('/reviews/:store',reviewController.addReview);


router.post('/api/stores/:id/heart',catchErrors(storeController.heartStore));
router.get('/api/search',catchErrors(storeController.searchStores));
router.get('/api/stores/near',catchErrors(storeController.mapStore));

module.exports = router;