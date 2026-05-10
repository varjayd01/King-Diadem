import stripe
import os

# โหลด Stripe Secret จาก environment
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")


def create_checkout(api_key: str):
    """
    Create Stripe checkout session for King Diadem credits
    """

    price_id = os.getenv("STRIPE_PRICE_ID")

    try:
        if price_id:
            line_items = [{"price": price_id, "quantity": 1}]
        else:
            line_items = [{
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": "King Diadem Credits"
                    },
                    "unit_amount": 500
                },
                "quantity": 1
            }]

        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=line_items,
            mode="payment",
            success_url="https://king-diadem.onrender.com/success",
            cancel_url="https://king-diadem.onrender.com/cancel",
            metadata={"api_key": api_key}
        )

        return {"checkout_url": session.url}

    except Exception as e:
        return {"error": str(e)}
