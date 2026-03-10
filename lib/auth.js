import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { queryOne, redis } from '@/lib/db'
import bcrypt from 'bcryptjs'

// Validate required environment variables in production
if (process.env.NODE_ENV === 'production') {
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error('NEXTAUTH_SECRET must be set in production')
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set in production')
  }
}

// Fungsi untuk verify user login
async function verifyUser(email, password) {
  try {
    const key = `ratelimit:login:email:${(email || '').toLowerCase()}`
    const attempts = parseInt((await redis.get(key)) || '0', 10)
    if (attempts >= 10) {
      return null
    }

    const user = await queryOne(
      'SELECT * FROM users WHERE email = $1',
      [email]
    )

    if (!user || !user.password_hash) {
      await redis.incr(key)
      await redis.expire(key, 600)
      return null
    }

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      await redis.incr(key)
      await redis.expire(key, 600)
      return null
    }

    await redis.del(key)
    return user
  } catch (error) {
    console.error('Error verifying user:', error)
    return null
  }
}

// Fungsi untuk menyimpan atau update user dari Google OAuth
async function syncUser(profile) {
  try {
    const existingUser = await queryOne(
      'SELECT * FROM users WHERE email = $1',
      [profile.email]
    )

    if (existingUser) {
      await queryOne(
        `UPDATE users
         SET full_name = $1, avatar_url = $2, email_verified = true, updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [profile.name, profile.picture, existingUser.id]
      )
      return existingUser
    }

    const newUser = await queryOne(
      `INSERT INTO users (email, full_name, avatar_url, email_verified, role)
       VALUES ($1, $2, $3, true, 'user')
       RETURNING *`,
      [profile.email, profile.name, profile.picture]
    )

    return newUser
  } catch (error) {
    console.error('Error syncing user:', error)
    throw error
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await verifyUser(credentials.email, credentials.password)
        if (!user) {
          return null
        }
        if (!user.email_verified) {
          throw new Error('Email belum terverifikasi')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.full_name,
          image: user.avatar_url,
          role: user.role,
        }
      }
    })
  ],
  callbacks: {
    async signIn({ account, profile, user }) {
      // For Google OAuth, sync user ke database
      if (account?.provider === 'google' && profile) {
        await syncUser(profile)
        return true
      }
      return true
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
        token.role = user.role
      }

      // For Google OAuth, get user role from database
      if (account?.provider === 'google' && profile) {
        const dbUser = await queryOne(
          'SELECT * FROM users WHERE email = $1',
          [profile.email]
        )
        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role
          token.email = dbUser.email
          token.name = dbUser.full_name
          token.picture = dbUser.avatar_url
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.name = token.name
        session.user.image = token.picture
        session.user.role = token.role
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
})
