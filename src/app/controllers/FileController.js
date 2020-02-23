import * as Yup from 'yup';
import File from '../models/File';

class FileController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      path: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const { originalname: name, filename: path } = req.file;

    const file = await File.create({
      name,
      path,
    });

    return res.json(file);
  }
}

export default new FileController();
