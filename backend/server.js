const fastify = require("fastify")({
    logger: true
  });
  
  fastify.get("/", async () => {
    return {
      message: "Lunari backend is running"
    };
  });
  
  const start = async () => {
    try {
      await fastify.listen({
        port: 5000,
        host: "0.0.0.0"
      });
    } catch (error) {
      fastify.log.error(error);
      process.exit(1);
    }
  };
  
  start();