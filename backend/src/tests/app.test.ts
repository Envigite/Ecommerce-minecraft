import request from "supertest";
import { app } from "../app";

describe("GET /", () => {
  it("Debería responder con un mensaje de bienvenida o estado 200", async () => {
    const res = await request(app).get("/");
  });
});

describe("GET /api/products", () => {
  it("Debería devolver una lista de productos", async () => {
    const res = await request(app).get("/api/products");
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});