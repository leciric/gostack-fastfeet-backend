import * as Yup from 'yup';
import Recipient from '../models/Recipient';

class RecipientController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.string().required(),
      additional: Yup.string(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      zipcode: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const {
      id,
      name,
      street,
      number,
      additional,
      state,
      city,
      zipcode,
    } = await Recipient.create(req.body);
    return res.json({
      id,
      name,
      street,
      number,
      additional,
      state,
      city,
      zipcode,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      street: Yup.string(),
      number: Yup.string(),
      additional: Yup.string(),
      state: Yup.string(),
      city: Yup.string(),
      zipcode: Yup.number().min(8),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const { index } = req.params;
    const recipient = await Recipient.findByPk(index);

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient does not exist' });
    }

    const {
      id,
      name,
      street,
      number,
      additional,
      state,
      city,
      zipcode,
    } = await recipient.update(req.body);

    return res.json({
      id,
      name,
      street,
      number,
      additional,
      state,
      city,
      zipcode,
    });
  }
}

export default new RecipientController();
