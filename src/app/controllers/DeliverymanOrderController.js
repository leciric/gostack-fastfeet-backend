import * as Yup from 'yup';
import { Op } from 'sequelize';
import { startOfDay, endOfDay, parseISO } from 'date-fns';

import Order from '../models/Order';

class DeliverymanOrderController {
  async index(req, res) {
    const schema = Yup.object().shape({
      delivered: Yup.boolean().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { index } = req.params;

    const { delivered } = req.body;

    let orders;

    if (delivered) {
      orders = await Order.findAll({
        where: {
          deliveryman_id: index,
          start_date: { [Op.not]: null },
          canceled_at: null,
          end_date: { [Op.not]: null },
        },
      });
      if (!orders) {
        return res.status(401).json({ error: 'Deliveryman do not exists' });
      }
    } else if (!delivered) {
      orders = await Order.findAll({
        where: {
          deliveryman_id: index,
          start_date: { [Op.not]: null },
          canceled_at: null,
          end_date: null,
        },
      });
      if (!orders) {
        return res.status(401).json({ error: 'Deliveryman do not exists' });
      }
    }

    return res.json(orders);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date().required(),
      deliveryman_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { index } = req.params;
    const { start_date, deliveryman_id } = req.body;

    const parsed_date = parseISO(start_date);

    const pickups = await Order.findAndCountAll({
      where: {
        start_date: {
          [Op.between]: [startOfDay(parsed_date), endOfDay(parsed_date)],
        },
        deliveryman_id,
      },
      attributes: ['id'],
    });

    if (pickups.count > 5) {
      return res.status(401).json('You are able to pick up only 5 items a day');
    }

    const order = await Order.findOne({
      where: {
        id: index,
        deliveryman_id,
      },
    });

    if (!order) {
      return res
        .status(401)
        .json({ error: 'this order are not attributed to you' });
    }

    order.start_date = parsed_date;
    await order.save();

    return res.json(order);
  }

  async revise(req, res) {
    const schema = Yup.object().shape({
      end_date: Yup.date().required(),
      deliveryman_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { index } = req.params;
    const { end_date, deliveryman_id } = req.body;

    const parsed_date = parseISO(end_date);

    const pickups = await Order.findAndCountAll({
      where: {
        end_date: {
          [Op.between]: [startOfDay(parsed_date), endOfDay(parsed_date)],
        },
        deliveryman_id,
      },
      attributes: ['id'],
    });

    if (pickups.count > 5) {
      return res.status(401).json('You are able to pick up only 5 items a day');
    }

    const order = await Order.findOne({
      where: {
        id: index,
        start_date: {
          [Op.not]: null,
        },
        deliveryman_id,
      },
    });

    if (!order) {
      return res.status(401).json({ error: 'There is no matching records' });
    }
    console.log(order.start_date);
    console.log(parsed_date);
    order.end_date = parsed_date;
    await order.save();

    return res.json(order);
  }
}

export default new DeliverymanOrderController();
