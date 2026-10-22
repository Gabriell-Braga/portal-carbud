import assert from "node:assert/strict";
import { test } from "node:test";
import { localMedia, maskCityOrCep, maskKm, maskMoney, maskPhone, price, whatsappLink } from "./format.ts";

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

test("máscaras de dinheiro, km, telefone e CEP", () => {
  assert.equal(maskMoney("150000"), "R$ 150.000");
  assert.equal(maskMoney("R$ 1.500"), "R$ 1.500");
  assert.equal(maskMoney("abc"), "");
  assert.equal(maskKm("050000"), "50.000 km");
  assert.equal(maskPhone("31999990000"), "(31) 99999-0000");
  assert.equal(maskPhone("3133330000"), "(31) 3333-0000");
  assert.equal(maskPhone("319"), "(31) 9");
  assert.equal(maskCityOrCep("30130010"), "30130-010");
  assert.equal(maskCityOrCep("Belo Horizonte"), "Belo Horizonte");
});
