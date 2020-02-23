import * as Yup from 'yup';
import { Op } from 'sequelize';
import compareAsc from 'date-fns/compareAsc';

import Order from '../models/Order';
import File from '../models/File';

class EndOrderController {
  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      path: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { index } = req.params;
    const { originalname: name, filename: path } = req.file;

    const order = await Order.findOne({
      where: { id: index, end_date: null, start_date: { [Op.not]: null } },
    });

    if (!order) {
      return res.status(401).json({
        error:
          'Order do not exist or order was not started yet, try another one',
      });
    }

    const { id } = await File.create({ name, path });

    const end_date = new Date();

    if (compareAsc(order.start_date, end_date)) {
      return res
        .status(401)
        .json('error: the start date is after the end date');
    }
    if (order.start_date) await order.update({ end_date, signature_id: id });

    return res.json(order);
  }
}

export default new EndOrderController();
