import type { Metadata } from 'next'
import { AuthScreen } from '@/components/auth-screen'

export const metadata: Metadata = {
  title: 'Sign in | Crumb & Bloom',
  description: 'Preview sign-in page for Crumb & Bloom. It does not check a password or open an account.',
}

export default function LoginPage() {
  return <AuthScreen mode="login" />
}
