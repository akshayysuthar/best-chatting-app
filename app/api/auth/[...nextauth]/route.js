import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    CredentialsProvider({
      name: "Name and Email",
      credentials: {
        name: { label: "Name", type: "text", placeholder: "Your Name" },
        email: { label: "Email", type: "email", placeholder: "your@email.com" },
      },
      async authorize(credentials) {
        if (credentials.name && credentials.email) {
          return { id: credentials.email, name: credentials.name, email: credentials.email }
        }
        return null
      },
    }),
  ],
  
})
