import type { Metadata } from 'next'
import { AuthScreen } from '@/components/auth-screen'

export const metadata: Metadata = {
  title: 'Create an account | Crumb & Bloom',
  description: 'Preview sign-up page for Crumb & Bloom. It does not save a name, email, or password.',
}

export default function SignupPage() {
  return <AuthScreen mode="signup" />
}
