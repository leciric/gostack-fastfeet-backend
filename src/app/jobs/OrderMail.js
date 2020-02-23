import Mail from '../../lib/Mail';

class OrderMail {
  get key() {
    return 'OrderMail';
  }

  async handle({ data }) {
    const { updatedData } = data;

    await Mail.sendMail({
      to: `${updatedData.name} <${updatedData.email}>`,
      subject: 'Produto disponivel para coleta',
      template: 'order',
      context: {
        deliveryman: updatedData.name,
        product: updatedData.product,
      },
    });
  }
}

export default new OrderMail();
