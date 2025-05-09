export const routes = {
  home: "/",
  auth: "/auth",
  tickets: "/tickets",
  ticketDetails: (id: string) => `/tickets/${id}`,
  payment: (id: string) => `/payment/${id}`,
  myTickets: "/my-tickets",
  myWallet: "/my-wallet",
  verifyTicket: "/verify-ticket",
  emailVerification: "/email-verification",
  profile: "/profile",
  editProfile: "/profile/edit",
  changePassword: "/profile/change-password",
  security: "/profile/security",
  notFound: "*"
}; 