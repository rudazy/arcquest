import { z } from "zod";

const addressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid EVM address");

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_PRIVY_APP_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_ARC_RPC_URL: z.string().url().optional(),
  NEXT_PUBLIC_ARC_CHAIN_ID: z.coerce.number().int().positive().optional(),
  NEXT_PUBLIC_XP_REGISTRY_ADDRESS: addressSchema.optional(),
  NEXT_PUBLIC_ARCQUEST_NFT_ADDRESS: addressSchema.optional(),
});

const clientEnv = {
  NEXT_PUBLIC_PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_ARC_RPC_URL: process.env.NEXT_PUBLIC_ARC_RPC_URL,
  NEXT_PUBLIC_ARC_CHAIN_ID: process.env.NEXT_PUBLIC_ARC_CHAIN_ID,
  NEXT_PUBLIC_XP_REGISTRY_ADDRESS: process.env.NEXT_PUBLIC_XP_REGISTRY_ADDRESS,
  NEXT_PUBLIC_ARCQUEST_NFT_ADDRESS: process.env.NEXT_PUBLIC_ARCQUEST_NFT_ADDRESS,
};

const parsedClient = clientSchema.safeParse(clientEnv);
if (!parsedClient.success) {
  throw new Error(
    `Invalid public env vars:\n${parsedClient.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n")}`,
  );
}

const parsedServer = serverSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
});
if (!parsedServer.success) {
  throw new Error(
    `Invalid server env vars:\n${parsedServer.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n")}`,
  );
}

export const env = {
  ...parsedClient.data,
  ...(typeof window === "undefined" ? parsedServer.data : {}),
} as const;

export type Env = typeof env;