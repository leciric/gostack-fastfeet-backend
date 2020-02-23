import { getHours, startOfDay, endOfDay } from 'date-fns';
import * as Yup from 'yup';
import { Op } from 'sequelize';

import Order from '../models/Order';
import Deliveryman from '../models/Deliveryman';

import OrderMail from '../jobs/OrderMail';
import Queue from '../../lib/Queue';

class OrderController {
  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { deliveryman_id, product } = req.body;

    const deliveryman = await Deliveryman.findOne({
      where: { id: deliveryman_id },
      attributes: ['name', 'email'],
    });

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman do not exists' });
    }

    await Order.create(req.body);

    const { name, email } = deliveryman;
    const updatedData = { name, email, product };

    Queue.add(OrderMail.key, {
      updatedData,
    });

    return res.json({
      deliveryman_id,
      product,
    });
  }

  async update(req, res) {
    const { index, deliveryman_id } = req.params;

    const order = await Order.findOne({
      where: { id: index, start_date: null, deliveryman_id },
    });

    if (!order) {
      return res
        .status(400)
        .json({ error: 'Order do not exist or already delivered' });
    }

    const start_date = new Date();

    const pickups = await Order.findAndCountAll({
      where: {
        start_date: {
          [Op.between]: [startOfDay(new Date()), endOfDay(new Date())],
        },
        deliveryman_id,
      },
      attributes: ['id'],
    });

    if (pickups.count > 5) {
      return res.status(401).json('You are able to pick up only 5 items a day');
    }

    if (!(getHours(start_date) >= 7 && getHours(start_date) < 18)) {
      return res
        .status(400)
        .json({ error: 'You can only take a product between 08:00 and 18:00' });
    }

    const { id, product } = await order.update({ start_date });

    return res.json({ id, product, start_date });
  }

  async index(req, res) {
    const orders = await Order.findAll({
      order: ['start_date'],
    });

    return res.json(orders);
  }

  async delete(req, res) {
    const { index } = req.params;

    const order = await Order.findByPk(index);

    if (!order) {
      return res
        .status(401)
        .json({ error: 'Order do not exist, try another one.' });
    }

    order.canceled_at = new Date();

    await order.save();

    return res.json();
  }
}

export default new OrderController();
