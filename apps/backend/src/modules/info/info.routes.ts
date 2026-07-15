import type { FastifyPluginAsync } from "fastify";

export const infoRoutes: FastifyPluginAsync = async (app) => {
  app.get("/app", async () => ({
    name: "ahoj",
    version: "0.1.0",
    legal: {
      privacyPolicy: {
        title: "Privacy Policy",
        body:
          "ahoj collects the minimum profile, location, and story information required to power nearby discovery and private story sharing. Your data is used to show you relevant nearby users, support story visibility, and keep the app functioning. You can manage privacy options in Settings at any time.",
      },
      termsOfService: {
        title: "Terms of Service",
        body:
          "By using ahoj you agree to use the app respectfully, avoid abusive behavior, and respect other users' privacy and content rights. The service is provided as-is and may change over time.",
      },
      contact: {
        title: "Contact",
        body: "For questions or support, contact the ahoj team through the app or its official support channels.",
      },
    },
    openSource: {
      title: "Open Source & Credits",
      body:
          "ahoj uses open-source libraries and community tools across the mobile, backend, and shared packages. We appreciate the contributors behind Expo, Fastify, React Native, Drizzle, Zustand, and the wider React ecosystem.",
      items: [
        "Expo",
        "React Native",
        "Fastify",
        "Drizzle ORM",
        "TanStack Query",
        "Zustand",
        "React Native Reanimated",
      ],
    },
    additionalSections: [
      {
        title: "Accessibility",
        body: "We aim to keep the app readable and usable across devices, including larger text and clear navigation states.",
      },
      {
        title: "Data & Safety",
        body: "You can control visibility and story sharing from Settings. You may also remove or update profile content at any time.",
      },
    ],
  }));
};
