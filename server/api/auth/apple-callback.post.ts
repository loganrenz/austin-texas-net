import {
  getUserByAppleSub,
  getUserByEmail,
  createUserFromApple,
  signJwt,
  setAuthCookie,
  createSession,
} from '../../utils/auth'
import { createRemoteJWKSet, jwtVerify } from 'jose'

/**
 * Apple Sign In server-side callback — receives form_post from Apple.
 *
 * Apple posts: id_token, code, state, and optionally user (JSON) on first sign-in.
 * We verify the id_token via Apple's JWKS, find/create the user, set the JWT cookie,
 * and redirect to the original `state` URL.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id_token, state, user: appleUserRaw } = body

  if (!id_token) {
    throw createError({ statusCode: 400, message: 'Missing id_token from Apple' })
  }

  // Verify Apple id_token via JWKS
  const JWKS = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'))

  let payload: any
  try {
    const config = useRuntimeConfig()
    const result = await jwtVerify(id_token, JWKS, {
      issuer: 'https://appleid.apple.com',
      audience: config.appleClientId,
    })
    payload = result.payload
  } catch (err) {
    console.error('Apple id_token verification failed:', err)
    throw createError({ statusCode: 401, message: 'Invalid Apple id_token' })
  }

  const appleSub = payload.sub as string
  const email = (payload.email as string) || ''

  // Parse user info (only sent on first sign-in)
  let appleUser: any = null
  if (appleUserRaw) {
    try {
      appleUser = typeof appleUserRaw === 'string' ? JSON.parse(appleUserRaw) : appleUserRaw
    } catch {}
  }
  const name = appleUser?.name
    ? `${appleUser.name.firstName || ''} ${appleUser.name.lastName || ''}`.trim()
    : undefined

  if (!appleSub) {
    throw createError({ statusCode: 400, message: 'Invalid Apple response: missing sub' })
  }

  // Find or create user
  let user = await getUserByAppleSub(appleSub)

  if (!user && email) {
    user = await getUserByEmail(email)
  }

  if (!user) {
    if (!email) {
      throw createError({ statusCode: 400, message: 'Email is required for account creation' })
    }
    user = await createUserFromApple(appleSub, email, name)
  }

  // Create session and set JWT cookie
  await createSession(user.id)
  const jwt = await signJwt(user)
  setAuthCookie(event, jwt)

  // Redirect to the original page or home
  const redirectTo = (state && state !== '/') ? state : '/'
  return sendRedirect(event, redirectTo, 302)
})
