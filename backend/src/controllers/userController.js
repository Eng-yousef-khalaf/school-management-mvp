const userService = require('../services/userService');

async function getUsers(req, res, next) {
  try {
    const result = await userService.getUsers(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getUserById(req, res, next) {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function createUser(req, res, next) {
  try {
    const user = await userService.createUser(req.body, req.user, req);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const user = await userService.updateUser(req.params.id, req.body, req.user, req);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }
    const result = await userService.resetPassword(req.params.id, newPassword, req.user, req);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function deactivateUser(req, res, next) {
  try {
    const user = await userService.deactivateUser(req.params.id, req.user, req);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  resetPassword,
  deactivateUser
};
