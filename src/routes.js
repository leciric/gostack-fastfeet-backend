import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import DeliverymanController from './app/controllers/DeliverymanController';
import FileController from './app/controllers/FileController';
import OrderController from './app/controllers/OrderController';
import EndOrderController from './app/controllers/EndOrderController';
import DeliverymanOrderController from './app/controllers/DeliverymanOrderController';
import DeliveryProblemsController from './app/controllers/DeliveryProblemsController';
import OrderProblemsController from './app/controllers/OrderProblemsController';

import authMiddleware from './app/middlewares/auth';

const routes = Router();
const upload = multer(multerConfig);

routes.post('/sessions', SessionController.store);

routes.get('/deliveryman/:index/deliveries', DeliverymanOrderController.index);
routes.put('/deliveryman/:index/start_date', DeliverymanOrderController.update);
routes.put('/deliveryman/:index/end_date', DeliverymanOrderController.revise);

routes.post('/delivery/:index/problems', DeliveryProblemsController.store);

routes.use(authMiddleware);

routes.post('/users', UserController.store);
routes.put('/users', UserController.update);

routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:index', RecipientController.update);

routes.get('/deliverymans', DeliverymanController.index);
routes.post('/deliverymans', DeliverymanController.store);
routes.put('/deliverymans/:index', DeliverymanController.update);
routes.delete('/deliverymans/:index', DeliverymanController.delete);

routes.post('/orders', OrderController.store);
routes.put(
  '/orders/:index/deliveryman/:deliveryman_id',
  OrderController.update
);
routes.get('/orders', OrderController.index);
routes.delete('/orders/:index', OrderController.delete);

routes.put(
  '/endorders/:index',
  upload.single('file'),
  EndOrderController.update
);

routes.get('/delivery/problems', DeliveryProblemsController.index);
routes.get('/delivery/:index/problems', OrderProblemsController.index);

routes.delete(
  '/problem/:index/cancel-delivery',
  DeliveryProblemsController.delete
);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
