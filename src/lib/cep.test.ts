import assert from "node:assert/strict";
import { test } from "node:test";
import { cepDigits } from "./cep.ts";

test("cepDigits aceita CEP com ou sem pontuação", () => {
  assert.equal(cepDigits("30130-010"), "30130010");
  assert.equal(cepDigits(" 30130010 "), "30130010");
  assert.equal(cepDigits("30.130-010"), "30130010");
});

test("cepDigits recusa nome de cidade e número incompleto", () => {
  assert.equal(cepDigits("Belo Horizonte"), null);
  assert.equal(cepDigits("3013001"), null);
  assert.equal(cepDigits(undefined), null);
});
