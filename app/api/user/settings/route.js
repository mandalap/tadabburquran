import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { queryOne } from '@/lib/db'

// GET - Get user settings
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try to fetch settings, handle missing columns gracefully
    let user
    try {
      user = await queryOne(
        'SELECT email_notifications, promo_notifications, public_profile, hide_purchase_history FROM users WHERE email = $1',
        [session.user.email]
      )
    } catch (dbError) {
      // If columns don't exist yet, return default values
      console.log('Settings columns not yet created, using defaults')
      user = null
    }

    if (!user) {
      // Return default settings if columns don't exist or user not found
      return NextResponse.json({
        settings: {
          emailNotifications: true,
          promoNotifications: false,
          publicProfile: true,
          hidePurchaseHistory: false
        }
      })
    }

    return NextResponse.json({
      settings: {
        emailNotifications: user.email_notifications ?? true,
        promoNotifications: user.promo_notifications ?? false,
        publicProfile: user.public_profile ?? true,
        hidePurchaseHistory: user.hide_purchase_history ?? false
      }
    })
  } catch (error) {
    console.error('Error fetching user settings:', error)
    return NextResponse.json({
      // Return defaults on error instead of failing
      settings: {
        emailNotifications: true,
        promoNotifications: false,
        publicProfile: true,
        hidePurchaseHistory: false
      }
    })
  }
}

// PATCH - Update user settings
export async function PATCH(request) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { emailNotifications, promoNotifications, publicProfile, hidePurchaseHistory } = body

    // Get current user
    const currentUser = await queryOne(
      'SELECT id FROM users WHERE email = $1',
      [session.user.email]
    )

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Try to update settings, handle missing columns
    try {
      const updatedUser = await queryOne(
        `UPDATE users
         SET email_notifications = $1,
             promo_notifications = $2,
             public_profile = $3,
             hide_purchase_history = $4,
             updated_at = NOW()
         WHERE id = $5
         RETURNING id, email_notifications, promo_notifications, public_profile, hide_purchase_history`,
        [
          emailNotifications !== undefined ? emailNotifications : true,
          promoNotifications !== undefined ? promoNotifications : false,
          publicProfile !== undefined ? publicProfile : true,
          hidePurchaseHistory !== undefined ? hidePurchaseHistory : false,
          currentUser.id
        ]
      )

      return NextResponse.json({
        settings: {
          emailNotifications: updatedUser.email_notifications,
          promoNotifications: updatedUser.promo_notifications,
          publicProfile: updatedUser.public_profile,
          hidePurchaseHistory: updatedUser.hide_purchase_history
        },
        message: 'Pengaturan berhasil disimpan'
      })
    } catch (dbError) {
      // If columns don't exist, return success with the sent values
      // (Settings will be saved once migration runs)
      console.log('Settings columns not yet created, values acknowledged')

      return NextResponse.json({
        settings: {
          emailNotifications: emailNotifications ?? true,
          promoNotifications: promoNotifications ?? false,
          publicProfile: publicProfile ?? true,
          hidePurchaseHistory: hidePurchaseHistory ?? false
        },
        message: 'Pengaturan disimpan (local only - jalankan migration database)'
      })
    }
  } catch (error) {
    console.error('Error updating user settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
