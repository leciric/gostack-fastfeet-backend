import * as Yup from 'yup';

import DeliveryProblems from '../models/DeliveryProblems';
import Deliveryman from '../models/Deliveryman';
import Order from '../models/Order';

import CancelOrderMail from '../jobs/CancelOrderMail';
import Queue from '../../lib/Queue';

class DeliveryProblemsController {
  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { index } = req.params;
    const { description } = req.body;

    const order = await Order.findByPk(index);

    if (!order) {
      return res.status(400).json({ error: 'order do not exists' });
    }

    const problem = await DeliveryProblems.create(index, description);

    return res.json(problem);
  }

  async index(req, res) {
    const { page = 1 } = req.query;

    const orders = await DeliveryProblems.findAll({
      page: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'product', 'recipient_id', 'deliveryman_id'],
        },
      ],
    });

    return res.json(orders);
  }

  async delete(req, res) {
    const { index } = req.params;

    const order = await Order.findOne({
      where: {
        id: index,
      },
      attributes: [
        'id',
        'product',
        'start_date',
        'end_date',
        'recipient_id',
        'deliveryman_id',
        'signature_id',
        'canceled_at',
      ],
    });

    if (!order) {
      return res.status(400).json({ error: 'order do not exists' });
    }

    const deliveryman = await Deliveryman.findOne({
      where: {
        id: order.deliveryman_id,
      },
    });

    if (!deliveryman) {
      return res.status(400).json({ error: 'deliveryman do not exists' });
    }

    order.canceled_at = new Date();
    await order.save();

    const { product } = order;

    const { name, email } = deliveryman;
    const updatedData = { name, email, product };

    Queue.add(CancelOrderMail.key, { updatedData });

    return res.json(order);
  }
}

export default new DeliveryProblemsController();
