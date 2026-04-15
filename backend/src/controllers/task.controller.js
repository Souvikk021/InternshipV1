const taskService = require('../services/task.service');
const { sendSuccess, sendError } = require('../utils/response');

const list = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const result = await taskService.getTasks(req.user, { status, page, limit });
    return sendSuccess(res, result, 200, 'Tasks retrieved');
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.user.id, req.body);
    return sendSuccess(res, { task }, 201, 'Task created');
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const task = await taskService.getTask(req.params.id, req.user);
    return sendSuccess(res, { task }, 200, 'Task retrieved');
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.user, req.body);
    return sendSuccess(res, { task }, 200, 'Task updated');
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await taskService.deleteTask(req.params.id, req.user);
    return sendSuccess(res, null, 200, 'Task deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = { list, create, getOne, update, remove };
