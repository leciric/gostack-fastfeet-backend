import Mail from '../../lib/Mail';

class CancelOrderMail {
  get key() {
    return 'CancelOrderMail';
  }

  async handle({ data }) {
    const { updatedData } = data;

    console.log(updatedData);

    await Mail.sendMail({
      to: `${updatedData.name} <${updatedData.email}>`,
      subject: 'Entrega cancelada',
      template: 'cancel-order',
      context: {
        deliveryman: updatedData.name,
        product: updatedData.product,
      },
    });
  }
}

export default new CancelOrderMail();
