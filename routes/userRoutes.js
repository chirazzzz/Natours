const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();
// /signup && /login are one-off, special routes that don't fit into REST pattern. We only use POST
router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch(
  '/updateMyPassword',
  authController.protect, // protects route
  authController.updatePassword // then password update is allowed
);

router.get(
  '/me',
  authController.protect, // makes sure user is logged in
  userController.getMe, // fakes req.params.id to match req.user.id
  userController.getUser // uses this 'faked' id to get user that is logged in
);
router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(
    // authController.protect, // protects route
    // authController.restrictTo('Admin'), // verifies if user has permission (only admin can delete)
    userController.deleteUser
  );

module.exports = router;
