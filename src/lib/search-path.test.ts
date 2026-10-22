import assert from "node:assert/strict";
import { test } from "node:test";
import { parseSearchPath, searchPath } from "./search-path.ts";

const catalog = {
  cities: ["Belo Horizonte - MG", "São Paulo - SP"],
  brands: [
    { brand: "GM - Chevrolet", models: ["Onix", "Tracker"] },
    { brand: "Volkswagen", models: ["T-Cross"] },
  ],
};

test("searchPath leva cidade, marca e modelo para o caminho", () => {
  assert.equal(
    searchPath({ cidade: "Belo Horizonte", marca: "GM - Chevrolet", modelo: "Onix", anoMin: "", ordem: "recentes" }, catalog),
    "/comprar/mg-belo-horizonte/gm-chevrolet/onix?ordem=recentes",
  );
  assert.equal(searchPath({ marca: "Volkswagen", modelo: "T-Cross" }, catalog), "/comprar/volkswagen/t-cross");
  assert.equal(searchPath({ cidade: "sao paulo" }, catalog), "/comprar/sp-sao-paulo");
});

test("searchPath deixa na query o que não está no catálogo", () => {
  assert.equal(searchPath({ cidade: "Contagem", marca: "Fiat", modelo: "Uno" }, catalog), "/comprar?cidade=Contagem&marca=Fiat&modelo=Uno");
  assert.equal(searchPath({ marca: "Volkswagen", modelo: "Gol" }, catalog), "/comprar/volkswagen?modelo=Gol");
});

test("parseSearchPath desfaz o caminho com os nomes do catálogo", () => {
  assert.deepEqual(parseSearchPath(["mg-belo-horizonte", "gm-chevrolet", "onix"], catalog), {
    cidade: "Belo Horizonte",
    uf: "MG",
    marca: "GM - Chevrolet",
    modelo: "Onix",
  });
  assert.deepEqual(parseSearchPath(["volkswagen"], catalog), { marca: "Volkswagen" });
  assert.deepEqual(parseSearchPath([], catalog), {});
});

test("parseSearchPath recusa pedaço desconhecido", () => {
  assert.equal(parseSearchPath(["fiat"], catalog), null);
  assert.equal(parseSearchPath(["volkswagen", "gol"], catalog), null);
  assert.equal(parseSearchPath(["onix"], catalog), null);
});
