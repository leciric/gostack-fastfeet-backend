import Sequelize, { Model } from 'sequelize';

class Recipient extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        street: Sequelize.STRING,
        number: Sequelize.STRING,
        additional: Sequelize.STRING,
        state: Sequelize.STRING,
        city: Sequelize.STRING,
        zipcode: Sequelize.INTEGER,
      },
      {
        sequelize,
      }
    );
  }
}

export default Recipient;