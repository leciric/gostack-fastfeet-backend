import DeliveryProblems from '../models/DeliveryProblems';
import Order from '../models/Order';

class OrderProblemsController {
  async index(req, res) {
    const { index } = req.params;

    const order = await Order.findByPk(index);

    if (!order) {
      return res.status(400).json({ error: 'order do not exists' });
    }

    const problems = await DeliveryProblems.findAll({
      where: {
        order_id: index,
      },
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'product', 'recipient_id', 'deliveryman_id'],
        },
      ],
    });

    return res.json(problems);
  }
}

export default new OrderProblemsController();
