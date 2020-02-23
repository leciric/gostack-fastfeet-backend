import * as Yup from 'yup';
import Deliveryman from '../models/Deliveryman';

class DeliverymanController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const deliverymans = await Deliveryman.findAll({
      order: ['id'],
      attributes: ['id', 'name', 'email', 'avatar_id'],
      page: 20,
      offset: (page - 1) * 20,
    });

    return res.json({ deliverymans });
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      avatar_id: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const deliverymanExists = await Deliveryman.findOne({
      where: { email: req.body.email },
    });

    if (deliverymanExists) {
      return res.status(400).json({ error: 'Deliveryman already exists' });
    }

    const { id, name, email, avatar_id } = await Deliveryman.create(req.body);

    return res.json({
      id,
      name,
      email,
      avatar_id,
    });
  }

  async update(req, res) {
    const { index } = req.params;
    const deliveryman = await Deliveryman.findByPk(index, {
      attributes: ['id', 'name', 'email', 'avatar_id'],
    });

    const { name, email, avatar_id } = req.body;
    const newDeliveryman = await deliveryman.update({ name, email, avatar_id });

    return res.json(newDeliveryman);
  }

  async delete(req, res) {
    const { index } = req.params;

    const deliveryman = await Deliveryman.findByPk(index);

    await deliveryman.destroy();

    return res.json();
  }
}

export default new DeliverymanController();
