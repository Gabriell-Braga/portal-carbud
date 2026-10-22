import assert from "node:assert/strict";
import { test } from "node:test";
import { localMedia, price, whatsappLink } from "./format.ts";

test("preço sem centavos e sob consulta", () => {
  assert.equal(price(13990000), "R$ 139.900");
  assert.equal(price(0), "Sob consulta");
  assert.equal(price(5000000, true), "Sob consulta");
});

test("foto do painel vira caminho local, com ou sem mount path", () => {
  assert.equal(localMedia("/app/api/media/t/1/a.jpg"), "/media/t/1/a.jpg");
  assert.equal(localMedia("/api/media/t/1/a.jpg"), "/media/t/1/a.jpg");
  assert.equal(localMedia(null), null);
});

test("whatsapp ganha DDI e recusa número curto", () => {
  assert.equal(whatsappLink("(31) 99999-0000", "oi"), "https://wa.me/5531999990000?text=oi");
  assert.equal(whatsappLink("5531999990000", "oi"), "https://wa.me/5531999990000?text=oi");
  assert.equal(whatsappLink("1234", "oi"), null);
});
