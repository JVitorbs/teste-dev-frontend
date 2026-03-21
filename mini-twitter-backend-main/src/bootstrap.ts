import { db } from "./db";

async function bootstrap() {
  const result = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };

  if (!result || result.count === 0) {
    console.log("🌱 Banco vazio detectado. Executando seed inicial...");
    await import("../seed.ts");
  } else {
    console.log(`📦 Banco ja possui dados (${result.count} usuarios). Seed nao executado.`);
  }

  await import("./index.ts");
}

bootstrap().catch((error) => {
  console.error("❌ Falha ao inicializar aplicacao:", error);
  process.exit(1);
});
