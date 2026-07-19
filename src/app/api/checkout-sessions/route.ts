import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

import { stripe } from '../../../lib/stripe'

type CartItem = {
  _id: string
  productId: string
  title: string
  image: string
  price: number
  size?: string | null
  color?: string | null
  quantity: number
}

export async function POST(request: Request) {
  try {
    const headersList = await headers()
    const origin = headersList.get('origin')

    const formData = await request.formData()

    const userId = formData.get('userId') as string
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const district = formData.get('district') as string
    const thana = formData.get('thana') as string
    const villageCity = formData.get('villageCity') as string
    const roadBlockHouse = formData.get('roadBlockHouse') as string
    const message = formData.get('message') as string
    const address = formData.get('address') as string
    const city = formData.get('city') as string
    const deliveryLocation = formData.get('deliveryLocation') as string
    const shippingFee = formData.get('shippingFee') as string
    const subtotal = formData.get('subtotal') as string
    const totalAmount = formData.get('totalAmount') as string
    const paymentMethod = formData.get('paymentMethod') as string
    const cartItemsRaw = formData.get('cartItems') as string
    const cartItemIdsRaw = formData.get('cartItemIds') as string

    // ---- Parse product details ----
    let cartItems: CartItem[] = []
    try {
      cartItems = cartItemsRaw ? JSON.parse(cartItemsRaw) : []
    } catch {
      return NextResponse.json({ error: 'Invalid cart items' }, { status: 400 })
    }

    if (!cartItems.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // ---- Build Stripe line items based on payment method ----
    // Cash on Delivery: only the delivery/shipping fee is charged upfront via Stripe.
    //                   The product cost itself is paid in cash on delivery.
    // Card Payment:     the full product cost is charged via Stripe, with free shipping.
    const shippingAmount = Math.round(parseFloat(shippingFee) * 100)
    const deliveryLabel = deliveryLocation === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'

    const shippingLineItem = {
      price_data: {
        currency: 'usd',
        unit_amount: Number.isFinite(shippingAmount) && shippingAmount > 0 ? shippingAmount : 0,
        product_data: {
          name: `Delivery Fee (${deliveryLabel})`,
        },
      },
      quantity: 1,
    }

    let line_items: any[]

    if (paymentMethod === 'cod') {
      // Only charge the delivery fee now — products are paid in cash on delivery
      if (!Number.isFinite(shippingAmount) || shippingAmount <= 0) {
        return NextResponse.json({ error: 'Invalid delivery fee' }, { status: 400 })
      }
      line_items = [shippingLineItem]
    } else {
      // Card payment — charge full product cost, shipping is free
      const productLineItems = cartItems.map((item) => {
        const unitAmount = Math.round(item.price * 100)
        if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
          throw new Error(`Invalid price for product: ${item.title}`)
        }

        const descriptionParts = [
          item.size ? `Size: ${item.size}` : null,
          item.color ? `Color: ${item.color}` : null,
        ].filter(Boolean)

        return {
          price_data: {
            currency: 'usd',
            unit_amount: unitAmount,
            product_data: {
              name: item.title,
              description: descriptionParts.length ? descriptionParts.join(' · ') : undefined,
              images: item.image ? [item.image] : undefined,
            },
          },
          quantity: item.quantity,
        }
      })

      line_items = productLineItems
    }

    // Create Checkout Session — for COD this only charges the shipping fee,
    // for card payments this charges the full product cost.
    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      metadata: {
        userId: userId ?? '',
        name: name ?? '',
        phone: phone ?? '',
        district: district ?? '',
        thana: thana ?? '',
        villageCity: villageCity ?? '',
        roadBlockHouse: roadBlockHouse ?? '',
        message: message ?? '',
        address: address ?? '',
        city: city ?? '',
        deliveryLocation: deliveryLocation ?? '',
        shippingFee: shippingFee ?? '',
        subtotal: subtotal ?? '',
        totalAmount: totalAmount ?? '',
        paymentMethod: paymentMethod ?? '',
        cartItemIds: cartItemIdsRaw ?? '',
      },
    })

    return NextResponse.redirect(session.url as string, 303)
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode || 500 }
    )
  }
}